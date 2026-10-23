# YouTube Live Simulator (Chrome Extension)

Ye extension kisi bhi recorded YouTube lecture ko **real-world wall-clock synced live stream** me convert kar deta hai taaki aapka dimaag procrastination na kare aur 8 ghante ka lecture 8 ghante me hi khatam ho sake.

---

## 🎯 Yeh Kaise Kaam Karta Hai?

1. **"Convert to Live" Trigger:**
   * Kisi bhi recorded lecture par video ke niche ya player ke upar `📡 Convert to Live` button click karo.
   * Maan lo aapne **dopahar 2:00 PM** par start kiya, toh 2:00 PM aapka Live Start Time ban jayega.

2. **Real-World Clock Sync:**
   * **2:00 PM** $\rightarrow$ Video Time `00:00:00`
   * **2:45 PM** $\rightarrow$ Video Time strictly `00:45:00` hona chahiye.
   * **10:00 PM** $\rightarrow$ 8 ghante ka lecture strictly 10:00 PM par khatam hoga ("Stream Ended").

3. **Browser / Laptop Band Karne Par Bhi Live Chalta Rahega:**
   * Timestamp `chrome.storage.local` me secure rehta hai.
   * Agar aap 15 minute ke liye tab ya browser band karke wapas aate ho, toh video automatically bata dega:
     `🔴 -15:00 Behind Live`!
   * Isse aapke dimaag me wahi live stream wali urgency aayegi ki "jaldi teacher ke sath catch up karo".

4. **Anti-Cheat (Forward Seek Lock):**
   * Aap future me skip karke aage nahi ja sakte. Live head se aage seek karna lock rahega jab tak lecture khatam na ho jaye.

5. **Behind-Live Status & Sync:**
   * Agar aap teacher ke sath chal rahe ho: `🔴 LIVE` (Red pulsing badge).
   * Agar aap peeche ho: `🔴 -MM:SS Behind Live` (Badge par click karke direct live head par sync bhi kar sakte ho).

---

## 🚀 Chrome / Edge / Brave Me Install Kaise Karein (1 Minute Guide)

1. Chrome browser kholein aur address bar me type karein:
   ```
   chrome://extensions/
   ```
2. Top-right corner me **Developer mode** toggle ko **ON** karein.
3. Top-left me **"Load unpacked"** button par click karein.
4. Ye folder select karein:
   ```
   D:\Projects\yt-live-simulator
   ```
5. Done! Extension install ho jayega.

---

## 📺 Kaise Use Karein?

1. YouTube par koi bhi recorded lecture ya video kholein.
2. Video title ke paas aapko ek button dikhega: **`📡 Convert to Live`**.
3. Us par click karein:
   * Agar video start se dekhna hai toh **"Start from 00:00"** select karein.
   * Agar thoda dekh chuke the toh **"Resume from Current Time"** select karein.
4. Player ke top-right me **`🔴 LIVE`** badge active ho jayega.
5. Agar kabhi live session cancel karna ho, toh badge ke paas chhota sa **`✕`** icon dabayein ya extension popup se delete kar dein.
