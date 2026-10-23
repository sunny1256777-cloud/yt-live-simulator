/**
 * YouTube Live Simulator - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const statusTitle = document.getElementById('status-title');
  const statusDetails = document.getElementById('status-details');
  const statusActions = document.getElementById('status-actions');
  const sessionsList = document.getElementById('sessions-list');
  const sessionsCount = document.getElementById('sessions-count');

  function formatTime(seconds) {
    const sec = Math.max(0, Math.floor(seconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (h > 0) return `${h}h ${pad(m)}m`;
    return `${pad(m)}m ${pad(s)}s`;
  }

  function formatClockTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let currentVideoId = null;

  if (tab && tab.url && tab.url.includes('youtube.com/watch')) {
    try {
      const url = new URL(tab.url);
      currentVideoId = url.searchParams.get('v');
    } catch (e) {}
  }

  async function refreshUI() {
    chrome.storage.local.get(['yt_live_sessions'], (data) => {
      const sessions = data.yt_live_sessions || {};
      const sessionKeys = Object.keys(sessions);
      sessionsCount.textContent = sessionKeys.length;

      // Current tab status
      if (currentVideoId && sessions[currentVideoId]) {
        const session = sessions[currentVideoId];
        const now = Date.now();
        const elapsed = (now - session.startTime) / 1000;
        const duration = session.duration || 0;
        const isEnded = elapsed >= duration;
        const endTime = session.startTime + (duration * 1000);

        statusTitle.textContent = isEnded ? '🔴 Stream Completed' : '🔴 Live Session Active';
        statusDetails.innerHTML = `
          <strong>${session.title || 'YouTube Lecture'}</strong><br>
          ${isEnded
            ? 'Broadcast finish ho chuka hai. Replay unlocked.'
            : `Elapsed: <b>${formatTime(elapsed)}</b> / ${formatTime(duration)}<br>Finishes at: <b>${formatClockTime(endTime)}</b>`
          }
        `;

        statusActions.innerHTML = '';
        const endBtn = document.createElement('button');
        endBtn.className = 'btn btn-danger btn-large';
        endBtn.textContent = 'End Live Mode';
        endBtn.onclick = () => {
          delete sessions[currentVideoId];
          chrome.storage.local.set({ yt_live_sessions: sessions }, () => {
            if (tab && tab.id) {
              chrome.tabs.sendMessage(tab.id, { action: 'END_LIVE_SESSION' }, () => {});
            }
            refreshUI();
          });
        };
        statusActions.appendChild(endBtn);
      } else if (currentVideoId) {
        // Video detected, but live not active yet! Show direct Start Button!
        statusTitle.textContent = 'YouTube Video Detected';
        statusDetails.innerHTML = `Is video ko <b>Real-Time Live Lecture</b> me convert karne ke liye ye button dabayein:`;
        
        statusActions.innerHTML = '';
        const startBtn = document.createElement('button');
        startBtn.className = 'btn btn-primary btn-large';
        startBtn.id = 'btn-popup-start-live';
        startBtn.innerHTML = `<span>📡 Start Live Session Now</span>`;
        
        startBtn.onclick = () => {
          startBtn.disabled = true;
          startBtn.textContent = 'Starting Live...';

          if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'START_LIVE_NOW' }, (response) => {
              if (chrome.runtime.lastError || !response) {
                // Fallback: write session directly to storage and reload tab
                const newSession = {
                  videoId: currentVideoId,
                  startTime: Date.now(),
                  duration: 28800,
                  title: tab.title ? tab.title.replace(' - YouTube', '').trim() : 'YouTube Lecture',
                  createdAt: Date.now()
                };
                sessions[currentVideoId] = newSession;
                chrome.storage.local.set({ yt_live_sessions: sessions }, () => {
                  chrome.tabs.reload(tab.id, () => {
                    window.close();
                  });
                });
              } else {
                setTimeout(() => window.close(), 300);
              }
            });
          }
        };

        statusActions.appendChild(startBtn);
      } else {
        statusTitle.textContent = 'No Active YouTube Video';
        statusDetails.textContent = 'Kisi bhi YouTube lecture par jayein aur extension kholein.';
        statusActions.innerHTML = '';
      }

      // Render all active sessions list
      sessionsList.innerHTML = '';
      if (sessionKeys.length === 0) {
        sessionsList.innerHTML = '<div class="empty-state">Koi active live session nahi hai.</div>';
        return;
      }

      sessionKeys.forEach((vid) => {
        const item = sessions[vid];
        const now = Date.now();
        const elapsed = (now - item.startTime) / 1000;
        const duration = item.duration || 0;
        const isEnded = elapsed >= duration;

        const row = document.createElement('div');
        row.className = 'session-item';

        row.innerHTML = `
          <div class="session-info">
            <div class="session-title">${item.title || 'YouTube Lecture'}</div>
            <div class="session-meta">
              ${isEnded ? '✅ Completed' : `⏳ ${formatTime(elapsed)} / ${formatTime(duration)}`}
            </div>
          </div>
          <button class="btn-remove-session" title="Delete Session">✕</button>
        `;

        row.querySelector('.btn-remove-session').onclick = () => {
          delete sessions[vid];
          chrome.storage.local.set({ yt_live_sessions: sessions }, () => {
            refreshUI();
            if (tab && tab.id && currentVideoId === vid) {
              chrome.tabs.sendMessage(tab.id, { action: 'END_LIVE_SESSION' }, () => {});
            }
          });
        };

        sessionsList.appendChild(row);
      });
    });
  }

  refreshUI();
});
