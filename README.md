# 📡 YouTube Live Simulator

> **Transform any recorded YouTube lecture into an authentic, wall-clock synchronized live stream to eliminate procrastination.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-red.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Browser Support](https://img.shields.io/badge/Chrome%20%7C%20Edge%20%7C%20Brave-Supported-success.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🧠 The Problem & Behavioral Psychology

### The Trap of Recorded Lectures:
When studying through lengthy recorded video lectures (e.g., 6 to 8 hours long), students often take **3 to 4 days** to finish a single lecture. Why?
* **Illusion of Infinite Time:** Because the user holds the pause button with no consequence, the brain relaxes into friction-free procrastination.
* **Trivial Distractions:** A 2-minute break turns into an hour-long rabbit hole because the lecture is always waiting.

### The Power of Live Broadcasts:
In contrast, when attending an **actual live stream**, students finish an 8-hour lecture in exactly 8 hours:
* **Social Synchronicity & Scarcity:** The broadcast is marching forward in real time.
* **Urgency & Pacing:** Falling 2–3 minutes behind creates immediate urgency to speed up (1.25× or 1.5×) to catch back up with the instructor.

**YouTube Live Simulator** brings that exact psychological commitment mechanism to **any recorded video on YouTube**.

---

## ✨ Key Features

* **🔴 1:1 Authentic YouTube Live UI:**
  * Replaces standard recorded timers (`2:49 / 44:38`) with an authentic YouTube Live indicator.
  * When in sync with the live broadcast head, displays a pulsing bright red dot: **`🔴 Live`**.
  * Spans a **solid red progress bar** across the timeline directly up to the live broadcast head.
* **⏱️ Real-World Wall-Clock Synchronization:**
  * If you start an 8-hour lecture at **2:00 PM**, it strictly concludes at **10:00 PM**.
  * **Resilient to Browser Closures:** Close your browser, sleep your laptop, or restart your computer — when you return at 2:45 PM, the lecture will be at 45:00!
* **🟡 Dynamic Behind-Live Latency Tracking:**
  * If you pause or fall behind, the indicator dot turns grey and displays your exact time lag in real time: **`⚪ -04:12 Behind Live`**.
  * Provides visual temporal feedback that prompts you to catch up.
* **⚡ One-Click Catch-Up (Jump to Live):**
  * Simply click the **`Live`** badge at any time to instantly seek straight to the current broadcast head.
* **🛡️ Anti-Cheat (Forward Seek Lock):**
  * You cannot skip into the future past the live broadcast head, maintaining true live stream scarcity. Backward scrubbing into past material remains fully accessible.
* **🎯 Zero-Clipping Right-Controls Placement:**
  * Injected directly into the spacious right-side controls (adjacent to the Autoplay switch), ensuring zero overlap with long chapter titles or volume controls.
* **📋 Active Sessions Manager Popup:**
  * Clean Manifest V3 popup dashboard showing all currently active live sessions, elapsed time, and scheduled finish times.

---

## 🚀 Installation Guide (For Any User)

You can install this extension on any Chromium-based browser (**Google Chrome**, **Brave**, **Microsoft Edge**, **Opera**, or **Vivaldi**) in under 60 seconds:

### Step 1: Get the Code

#### Option A (Using Git):
Open your terminal and clone the repository:
```bash
git clone https://github.com/sunny1256777-cloud/yt-live-simulator.git
```

#### Option B (Download as ZIP):
1. Click the green **`<> Code`** button at the top of this GitHub repository.
2. Select **`Download ZIP`**.
3. Extract the downloaded `.zip` file into a folder on your computer.

---

### Step 2: Load into Your Browser

1. Open your browser and navigate to the Extensions management page:
   * **Google Chrome / Brave:** Visit `chrome://extensions/`
   * **Microsoft Edge:** Visit `edge://extensions/`
2. In the top-right corner, toggle **Developer mode** to **ON**.
3. In the top-left corner, click the **"Load unpacked"** button.
4. In the file selection dialog, select the cloned or extracted `yt-live-simulator` folder (the folder containing `manifest.json`).
5. **Done!** The extension is now installed. Pin it to your browser toolbar for quick access.

---

## 📺 How to Use

1. Navigate to any YouTube video or recorded lecture (e.g., `https://www.youtube.com/watch?v=...`).
2. Start the Live Session using either method:
   * **From the Player Action Bar:** Click the **`📡 Convert to Live`** button located right below the video title.
   * **From the Extension Popup:** Click the extension icon in your browser toolbar and click **`📡 Start Live Session Now`**.
3. The video player transforms into an authentic live stream interface:
   * The timeline spans solid red up to your live head.
   * The live status indicator (**`🔴 Live`**) appears in the right control bar.
4. If you fall behind:
   * The badge updates in real time to show your exact delay: **`⚪ -XX:XX Behind Live`**.
   * Increase playback speed (e.g., 1.25× or 1.5×) using YouTube's native speed menu to catch up, or click the badge to jump straight to the live head.
5. To conclude or cancel a live session:
   * Double-click the Live badge, or open the extension popup and click **`End Live Mode`**.

---

## 🛠️ Tech Stack & Architecture

* **Architecture:** Manifest V3 Chrome Extension
* **Content Script:** Vanilla JavaScript (SPA navigation listeners, MutationObserver, DOM injection, requestAnimationFrame)
* **Storage:** `chrome.storage.local` persistent state machine
* **Styling:** Modular CSS3 with GPU-accelerated transitions and backdrop blur filters
* **Privacy:** 100% Client-Side. Zero external telemetry, zero tracking, zero remote servers.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
