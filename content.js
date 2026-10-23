/**
 * YouTube Live Simulator - Content Script
 * Converts any recorded YouTube video into an authentic YouTube Live Stream interface.
 */

(function () {
  'use strict';

  let currentVideoId = null;
  let activeSession = null;
  let liveMonitorInterval = null;
  let isDraggingScrubber = false;

  // --- Utility Functions ---

  function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  function formatTime(seconds) {
    const sec = Math.max(0, Math.floor(seconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  }

  // --- Chrome Storage ---

  function getAllSessions() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['yt_live_sessions'], (result) => {
        resolve(result.yt_live_sessions || {});
      });
    });
  }

  async function getSession(videoId) {
    if (!videoId) return null;
    const sessions = await getAllSessions();
    return sessions[videoId] || null;
  }

  async function saveSession(session) {
    const sessions = await getAllSessions();
    sessions[session.videoId] = session;
    return new Promise((resolve) => {
      chrome.storage.local.set({ yt_live_sessions: sessions }, () => {
        resolve(session);
      });
    });
  }

  async function deleteSession(videoId) {
    const sessions = await getAllSessions();
    if (sessions[videoId]) {
      delete sessions[videoId];
      return new Promise((resolve) => {
        chrome.storage.local.set({ yt_live_sessions: sessions }, () => {
          resolve(true);
        });
      });
    }
    return true;
  }

  // --- Authentic Live Controls Injection ---

  function enableLiveModeUI() {
    const player = document.getElementById('movie_player');
    if (player) {
      player.classList.add('yt-sim-live-mode');
    }

    injectLiveBadge();
    injectLiveProgressBar();
    updateActionBarButton(true);
  }

  function disableLiveModeUI() {
    const player = document.getElementById('movie_player');
    if (player) {
      player.classList.remove('yt-sim-live-mode');
    }

    removeLiveBadge();
    removeLiveProgressBar();
    updateActionBarButton(false);
  }

  // 1. Inject Authentic "• Live" Badge in .ytp-left-controls
  function injectLiveBadge() {
    const leftControls = document.querySelector('.ytp-left-controls');
    if (!leftControls || document.getElementById('yt-sim-live-badge-btn')) return;

    const badgeBtn = document.createElement('button');
    badgeBtn.id = 'yt-sim-live-badge-btn';
    badgeBtn.className = 'ytp-button yt-sim-live-badge';
    badgeBtn.title = 'Click to seek to live';
    badgeBtn.innerHTML = `
      <span class="yt-sim-live-dot" id="yt-sim-live-dot"></span>
      <span class="yt-sim-live-text" id="yt-sim-live-text">Live</span>
    `;

    // Click badge to jump to live broadcast head
    badgeBtn.onclick = (e) => {
      e.stopPropagation();
      seekToLiveHead();
    };

    // Double click to end live session
    badgeBtn.ondblclick = (e) => {
      e.stopPropagation();
      if (confirm('End Live Mode for this video?')) {
        endCurrentSession();
      }
    };

    const timeDisplay = leftControls.querySelector('.ytp-time-display');
    if (timeDisplay) {
      leftControls.insertBefore(badgeBtn, timeDisplay);
    } else {
      leftControls.appendChild(badgeBtn);
    }
  }

  function removeLiveBadge() {
    const btn = document.getElementById('yt-sim-live-badge-btn');
    if (btn) btn.remove();
  }

  function seekToLiveHead() {
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    if (!video || !activeSession) return;

    const elapsed = (Date.now() - activeSession.startTime) / 1000;
    const liveHead = Math.min(elapsed, video.duration || activeSession.duration);

    const player = document.getElementById('movie_player');
    if (player && typeof player.seekTo === 'function') {
      player.seekTo(liveHead, true);
    }
    video.currentTime = liveHead;

    updateLiveTimelineUI(liveHead, liveHead, video.duration || activeSession.duration);
  }

  // 2. Inject Authentic Live Progress Bar
  function injectLiveProgressBar() {
    const progressContainer = document.querySelector('.ytp-progress-bar-container');
    if (!progressContainer || document.getElementById('yt-sim-live-progress-container')) return;

    const container = document.createElement('div');
    container.id = 'yt-sim-live-progress-container';
    container.className = 'yt-sim-live-progress-container';

    container.innerHTML = `
      <div class="yt-sim-live-progress-bg" id="yt-sim-live-progress-bg">
        <div class="yt-sim-live-play-progress" id="yt-sim-live-play-progress"></div>
        <div class="yt-sim-live-scrubber" id="yt-sim-live-scrubber"></div>
      </div>
      <div class="yt-sim-live-tooltip" id="yt-sim-live-tooltip">Live</div>
    `;

    const bg = container.querySelector('#yt-sim-live-progress-bg');
    const tooltip = container.querySelector('#yt-sim-live-tooltip');

    function seekFromEvent(e) {
      const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
      if (!video || !activeSession) return;

      const rect = bg.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = offsetX / rect.width;

      const elapsed = (Date.now() - activeSession.startTime) / 1000;
      const liveHead = Math.min(elapsed, video.duration || activeSession.duration);

      const targetTime = ratio * liveHead;

      const player = document.getElementById('movie_player');
      if (player && typeof player.seekTo === 'function') {
        player.seekTo(targetTime, true);
      }
      video.currentTime = targetTime;

      updateLiveTimelineUI(targetTime, liveHead, video.duration || activeSession.duration);
    }

    container.addEventListener('mousedown', (e) => {
      isDraggingScrubber = true;
      seekFromEvent(e);
      const scrubber = container.querySelector('#yt-sim-live-scrubber');
      if (scrubber) scrubber.classList.add('active');

      const onMouseMove = (moveEvent) => {
        if (isDraggingScrubber) seekFromEvent(moveEvent);
      };

      const onMouseUp = () => {
        isDraggingScrubber = false;
        if (scrubber) scrubber.classList.remove('active');
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    // Tooltip tracking
    container.addEventListener('mousemove', (e) => {
      const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
      if (!video || !activeSession) return;

      const rect = bg.getBoundingClientRect();
      const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const ratio = offsetX / rect.width;

      const elapsed = (Date.now() - activeSession.startTime) / 1000;
      const liveHead = Math.min(elapsed, video.duration || activeSession.duration);

      const hoverTime = ratio * liveHead;
      tooltip.style.left = `${offsetX}px`;

      const lag = liveHead - hoverTime;
      if (lag <= 2) {
        tooltip.textContent = 'Live';
      } else {
        tooltip.textContent = `-${formatTime(lag)}`;
      }
    });

    progressContainer.appendChild(container);
  }

  function removeLiveProgressBar() {
    const container = document.getElementById('yt-sim-live-progress-container');
    if (container) container.remove();
  }

  // --- Synchronize Timeline UI ---

  function updateLiveTimelineUI(currentTime, liveHead, duration) {
    if (!activeSession) return;

    const delay = Math.max(0, liveHead - currentTime);
    const isEnded = liveHead >= duration;

    // 1. Update Live Badge
    const dot = document.getElementById('yt-sim-live-dot');
    const label = document.getElementById('yt-sim-live-text');
    const badgeBtn = document.getElementById('yt-sim-live-badge-btn');

    if (!dot || !label) {
      injectLiveBadge();
    } else {
      if (isEnded) {
        dot.className = 'yt-sim-live-dot ended';
        label.className = 'yt-sim-live-text';
        label.textContent = 'Stream Ended';
      } else if (delay <= 3) {
        // In Sync with Live Head
        dot.className = 'yt-sim-live-dot'; // Solid bright red
        label.className = 'yt-sim-live-text';
        label.textContent = 'Live';
        if (badgeBtn) badgeBtn.title = 'You are in sync with live broadcast';
      } else {
        // Behind Live: Dot turns Grey, Text shows "-MM:SS Behind"
        dot.className = 'yt-sim-live-dot behind';
        label.className = 'yt-sim-live-text behind';
        label.textContent = `-${formatTime(delay)} Behind`;
        if (badgeBtn) badgeBtn.title = `You are ${formatTime(delay)} behind! Click to jump to live.`;
      }
    }

    // 2. Update Progress Bar & Scrubber
    if (!isDraggingScrubber && liveHead > 0) {
      const percent = Math.min(100, Math.max(0, (currentTime / liveHead) * 100));
      const progressBar = document.getElementById('yt-sim-live-play-progress');
      const scrubber = document.getElementById('yt-sim-live-scrubber');

      if (progressBar) {
        progressBar.style.setProperty('width', `${percent}%`, 'important');
      }

      if (scrubber) {
        scrubber.style.setProperty('left', `${percent}%`, 'important');
        if (delay > 3) {
          scrubber.classList.add('behind-live');
        } else {
          scrubber.classList.remove('behind-live');
        }
      }
    }
  }

  // --- Monitoring Loop (Real-Time Clock Sync) ---

  function startMonitoring(session) {
    stopMonitoring();
    activeSession = session;
    enableLiveModeUI();

    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');

    function tick() {
      if (!activeSession) return;
      const v = document.querySelector('video.html5-main-video') || document.querySelector('video');
      if (!v) return;

      const now = Date.now();
      const elapsed = (now - activeSession.startTime) / 1000;
      const duration = (v.duration && !isNaN(v.duration) && v.duration > 0) ? v.duration : activeSession.duration;
      const liveHead = Math.min(elapsed, duration);
      const isEnded = elapsed >= duration;

      // Anti-Cheat: Prevent skipping ahead into the future past live head
      if (!isEnded && v.currentTime > liveHead + 1.2) {
        v.currentTime = liveHead;
      }

      updateLiveTimelineUI(v.currentTime, liveHead, duration);
    }

    liveMonitorInterval = setInterval(tick, 250);

    // Also update instantly on video timeupdate (handles keyboard seeking like Left/Right arrow)
    if (video) {
      video.addEventListener('timeupdate', tick);
    }
  }

  function stopMonitoring() {
    if (liveMonitorInterval) {
      clearInterval(liveMonitorInterval);
      liveMonitorInterval = null;
    }
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    if (video) {
      video.removeEventListener('timeupdate', () => {});
    }
    activeSession = null;
    disableLiveModeUI();
  }

  async function endCurrentSession() {
    if (currentVideoId) {
      await deleteSession(currentVideoId);
      stopMonitoring();
    }
  }

  // --- Native Action Bar Button (Under Video Title) ---

  function injectActionBarButton() {
    if (!currentVideoId) return;

    const existingBtn = document.getElementById('yt-live-sim-action-btn');
    if (existingBtn) existingBtn.remove();

    const targets = [
      '#owner',
      '#top-row #actions',
      '#top-level-buttons-computed',
      '#actions-inner #menu',
      '#actions',
    ];

    let container = null;
    for (const selector of targets) {
      const el = document.querySelector(selector);
      if (el) {
        container = el;
        break;
      }
    }

    if (!container) return;

    const btn = document.createElement('button');
    btn.id = 'yt-live-sim-action-btn';
    btn.className = `yt-live-action-btn ${activeSession ? 'active' : ''}`;
    btn.innerHTML = activeSession
      ? `<span>🔴 Live Mode Active</span>`
      : `<span>📡 Convert to Live</span>`;

    btn.onclick = () => {
      if (activeSession) {
        if (confirm('End Live Mode for this video?')) {
          endCurrentSession();
        }
      } else {
        startLiveSessionDirectly();
      }
    };

    container.appendChild(btn);
  }

  function updateActionBarButton(isActive) {
    const btn = document.getElementById('yt-live-sim-action-btn');
    if (!btn) {
      injectActionBarButton();
      return;
    }

    if (isActive) {
      btn.className = 'yt-live-action-btn active';
      btn.innerHTML = `<span>🔴 Live Mode Active</span>`;
    } else {
      btn.className = 'yt-live-action-btn';
      btn.innerHTML = `<span>📡 Convert to Live</span>`;
    }
  }

  // --- Direct Live Start Flow ---

  async function startLiveSessionDirectly(forceBeginning = false) {
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    const curTime = (video && !isNaN(video.currentTime)) ? video.currentTime : 0;
    const dur = (video && !isNaN(video.duration) && video.duration > 0) ? video.duration : 28800;

    let startTime;
    if (forceBeginning || curTime <= 10) {
      if (video) video.currentTime = 0;
      startTime = Date.now();
    } else {
      startTime = Date.now() - (curTime * 1000);
    }

    const videoTitle = document.title.replace(' - YouTube', '').trim();
    const session = {
      videoId: currentVideoId,
      startTime: startTime,
      duration: dur,
      title: videoTitle,
      createdAt: Date.now(),
    };

    await saveSession(session);
    startMonitoring(session);

    if (video && video.paused) {
      video.play().catch(() => {});
    }
  }

  // --- Runtime Messaging ---

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_LIVE_NOW') {
      startLiveSessionDirectly(request.fromBeginning || false);
      sendResponse({ success: true });
    } else if (request.action === 'END_LIVE_SESSION') {
      endCurrentSession().then(() => sendResponse({ success: true }));
      return true;
    }
  });

  // --- SPA Page Changes ---

  async function handlePageChange() {
    const newVideoId = getVideoId();

    if (newVideoId !== currentVideoId) {
      currentVideoId = newVideoId;
      stopMonitoring();

      if (!currentVideoId) return;

      const session = await getSession(currentVideoId);
      if (session) {
        startMonitoring(session);
      }
    }

    setTimeout(() => {
      injectActionBarButton();
      if (activeSession) {
        enableLiveModeUI();
      }
    }, 600);
  }

  window.addEventListener('yt-navigate-finish', handlePageChange);
  window.addEventListener('load', handlePageChange);

  let lastCheckedHref = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastCheckedHref) {
      lastCheckedHref = window.location.href;
      handlePageChange();
    } else if (activeSession) {
      if (!document.getElementById('yt-sim-live-badge-btn')) injectLiveBadge();
      if (!document.getElementById('yt-sim-live-progress-container')) injectLiveProgressBar();
    }
  }, 1000);

  handlePageChange();
})();
