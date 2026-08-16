// Android 15 Clock Engine
function updateClock() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const timeStr = `${h}:${m}`;
  const dateStr = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;

  const tTop = document.getElementById('top-time');
  const mClock = document.getElementById('main-clock');
  const mDate = document.getElementById('main-date');

  if (tTop) tTop.innerText = timeStr;
  if (mClock) mClock.innerText = timeStr;
  if (mDate) mDate.innerText = dateStr;
}
updateClock();
setInterval(updateClock, 1000);

let calcBuffer = '';
let dialPadStr = '';
let mediaStream = null;
let currentFacing = 'environment';
let isMusicPlaying = false;
let mediaRecorder = null;
let audioChunks = [];
let activeRecentApps = ['drivers', 'files', 'calc', 'notes'];

// Recents & Navigation Management
function toggleRecents() {
  const recents = document.getElementById('recents-screen');
  const container = document.getElementById('recents-cards');
  if (!recents || !container) return;

  if (recents.style.display === 'flex') {
    recents.style.display = 'none';
    return;
  }

  document.getElementById('app-modal').style.display = 'none';
  container.innerHTML = '';
  if (activeRecentApps.length === 0) {
    container.innerHTML = '<p style="color:#64748b; margin:auto;">No background tasks</p>';
  } else {
    activeRecentApps.forEach((appName) => {
      container.innerHTML += `
        <div class="recent-task-card" onclick="openApp('${appName}'); document.getElementById('recents-screen').style.display='none';">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:20px;">⚡</span>
            <b style="color:#fff; text-transform:uppercase; font-size:14px;">${appName}</b>
          </div>
          <div style="flex:1; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:13px;">Running in RAM</div>
        </div>
      `;
    });
  }
  recents.style.display = 'flex';
}

function clearAllRecents() {
  activeRecentApps = [];
  toggleRecents();
}

function navBack() {
  const recents = document.getElementById('recents-screen');
  const modal = document.getElementById('app-modal');
  if (recents && recents.style.display === 'flex') {
    recents.style.display = 'none';
  } else if (modal && modal.style.display === 'flex') {
    closeApp();
  }
}

function navHome() {
  const recents = document.getElementById('recents-screen');
  if (recents) recents.style.display = 'none';
  closeApp();
}

// Power Management
function showPowerMenu() {
  document.getElementById('power-overlay').style.display = 'flex';
}
function hidePowerMenu() {
  document.getElementById('power-overlay').style.display = 'none';
}
function restartDevice() {
  hidePowerMenu();
  document.body.style.opacity = '0';
  setTimeout(() => window.location.reload(), 500);
}
function powerOffDevice() {
  hidePowerMenu();
  document.body.innerHTML = `
    <div style="height:100vh; background:#000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#334155;">
      <h2 style="font-size:22px; font-weight:600; margin-bottom:12px;">Nexus OS is Powered Off</h2>
      <button onclick="window.location.reload()" style="background:#38bdf8; border:none; padding:10px 24px; border-radius:30px; font-weight:bold; color:#000; cursor:pointer;">Press Power Button (Turn On)</button>
    </div>
  `;
}

// Fullscreen API Controller
function toggleFullscreenMode() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
  openApp('settings');
}

// Application Launcher
function openApp(name) {
  const modal = document.getElementById('app-modal');
  const hdr = document.getElementById('modal-hdr');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const recents = document.getElementById('recents-screen');

  if (recents) recents.style.display = 'none';
  if (!activeRecentApps.includes(name)) activeRecentApps.push(name);

  modal.style.display = 'flex';
  title.innerText = name.toUpperCase();

  // 1. Live Camera
  if (name === 'camera') {
    hdr.style.display = 'none';
    body.style.padding = '0';
    const lastThumb = localStorage.getItem('nexus_last_photo') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" fill="%23334155"><rect width="52" height="52"/></svg>';
    
    body.innerHTML = `
      <div style="position:absolute; inset:0; background:#000; display:flex; flex-direction:column; justify-content:space-between;">
        <div style="padding:14px 20px; display:flex; justify-content:space-between; z-index:10; background:linear-gradient(180deg, rgba(0,0,0,0.8), transparent);">
          <span style="color:#f59e0b; font-size:18px;">⚡</span>
          <span style="color:#fff; font-weight:600;">HDR AUTO</span>
          <button onclick="closeApp()" style="background:transparent; border:none; color:#fff; font-size:18px; cursor:pointer;">✕</button>
        </div>
        <div style="flex:1; width:100%; position:relative; background:#111; overflow:hidden;">
          <video id="cam-feed-view" autoplay playsinline muted style="width:100%; height:100%; object-fit:cover;"></video>
        </div>
        <div style="display:flex; justify-content:space-around; align-items:center; padding:20px; background:#000;">
          <img id="cam-thumb" onclick="openApp('photos')" style="width:52px; height:52px; border-radius:14px; object-fit:cover; border:2px solid #fff; background:#222;" src="${lastThumb}">
          <button onclick="takeCamSnap()" style="width:72px; height:72px; border-radius:50%; border:4px solid #fff; background:transparent; padding:4px; cursor:pointer;"><div style="width:100%; height:100%; background:#fff; border-radius:50%;"></div></button>
          <button onclick="flipCam()" style="width:50px; height:50px; border-radius:50%; background:#222; border:1px solid #444; color:#fff; font-size:20px; cursor:pointer;">🔄</button>
        </div>
      </div>
      <canvas id="cam-canvas-snap" style="display:none;"></canvas>
    `;
    startCamera();
    return;
  }

  hdr.style.display = 'flex';
  body.style.padding = '18px';

  switch(name) {
    // 2. Settings (Power & Fullscreen integrated)
    case 'settings':
      const isFull = !!document.fullscreenElement;
      body.innerHTML = `
        <div class="card">
          <div class="card-item" onclick="toggleFullscreenMode()">
            <div>
              <b>Full Screen Display</b>
              <p style="font-size:12px; color:#94a3b8;">Immersive app view</p>
            </div>
            <span style="color:#38bdf8; font-weight:bold;">${isFull ? 'ON' : 'OFF'} ›</span>
          </div>
          <div class="card-item" onclick="showPowerMenu()">
            <div>
              <b style="color:#ef4444;">Power & Restart Options</b>
              <p style="font-size:12px; color:#94a3b8;">Shutdown, reboot kernel</p>
            </div>
            <span style="color:#ef4444; font-weight:bold;">Menu ›</span>
          </div>
        </div>

        <div class="card">
          <div class="card-item"><span>Device Model</span><b style="color:#38bdf8;">Nexus Alpha</b></div>
          <div class="card-item"><span>Android Version</span><b style="color:#22c55e;">Android 15 (Realme UI 6.0)</b></div>
          <div class="card-item"><span>Processor</span><b>MediaTek Dimensity 7400</b></div>
          <div class="card-item"><span>RAM</span><b>8.00 GB LPDDR5X</b></div>
          <div class="card-item"><span>Storage</span><b>128 GB UFS 4.0</b></div>
        </div>
      `;
      break;

    // 3. Photos
    case 'photos':
      const savedPhoto = localStorage.getItem('nexus_last_photo');
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <h3 style="font-size:15px; color:#94a3b8;">Gallery Albums</h3>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
            ${savedPhoto ? `
              <div style="position:relative; aspect-ratio:1; border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.2);">
                <img src="${savedPhoto}" style="width:100%; height:100%; object-fit:cover;">
              </div>
            ` : '<p style="color:#64748b; grid-column:span 3; text-align:center; padding:40px 0;">No photos clicked yet.<br>Open Camera to capture!</p>'}
          </div>
          ${savedPhoto ? `<button onclick="localStorage.removeItem('nexus_last_photo'); openApp('photos')" class="calc-btn action" style="padding:12px; font-size:13px; border-radius:16px;">Clear Gallery</button>` : ''}
        </div>
      `;
      break;

    // 4. Calculator
    case 'calc':
      calcBuffer = '';
      body.innerHTML = `
        <div class="calc-screen" id="calc-view">0</div>
        <div class="calc-grid">
          <button class="calc-btn action" onclick="calcKey('C')">C</button>
          <button class="calc-btn action" onclick="calcKey('DEL')">⌫</button>
          <button class="calc-btn op" onclick="calcKey('/')">/</button>
          <button class="calc-btn op" onclick="calcKey('*')">×</button>
          <button class="calc-btn" onclick="calcKey('7')">7</button>
          <button class="calc-btn" onclick="calcKey('8')">8</button>
          <button class="calc-btn" onclick="calcKey('9')">9</button>
          <button class="calc-btn op" onclick="calcKey('-')">-</button>
          <button class="calc-btn" onclick="calcKey('4')">4</button>
          <button class="calc-btn" onclick="calcKey('5')">5</button>
          <button class="calc-btn" onclick="calcKey('6')">6</button>
          <button class="calc-btn op" onclick="calcKey('+')">+</button>
          <button class="calc-btn" onclick="calcKey('1')">1</button>
          <button class="calc-btn" onclick="calcKey('2')">2</button>
          <button class="calc-btn" onclick="calcKey('3')">3</button>
          <button class="calc-btn op" onclick="calcKey('=')">=</button>
          <button class="calc-btn" style="grid-column: span 2;" onclick="calcKey('0')">0</button>
          <button class="calc-btn" onclick="calcKey('.')">.</button>
        </div>
      `;
      break;

    // 5. Notes
    case 'notes':
      const savedNotes = localStorage.getItem('nexus_notes') || '';
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <textarea id="note-input" oninput="localStorage.setItem('nexus_notes', this.value)" style="width:100%; height:60vh; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:16px; color:#fff; font-size:16px; resize:none;" placeholder="Write your notes here...">${savedNotes}</textarea>
          <button onclick="localStorage.removeItem('nexus_notes'); document.getElementById('note-input').value='';" class="calc-btn action" style="padding:12px; font-size:13px; border-radius:16px;">Clear Notes</button>
        </div>
      `;
      break;

    // 6. Music
    case 'music':
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:10px 0; gap:18px;">
          <div style="width:190px; height:190px; border-radius:50%; background:radial-gradient(circle, #334155 20%, #0f172a 70%); border:4px solid #ec4899; display:flex; align-items:center; justify-content:center; font-size:52px; box-shadow:0 8px 30px rgba(236,72,153,0.3);">
            🎵
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:700;">Nexus Cyberpunk Studio</h2>
            <p style="color:#94a3b8; font-size:13px; margin-top:2px;">Digital Audio Hi-Res</p>
          </div>
          <input type="range" min="0" max="100" value="45" style="width:85%; accent-color:#ec4899;">
          <div style="display:flex; gap:20px; align-items:center;">
            <button class="calc-btn action" style="width:52px; height:52px; border-radius:50%;">⏮</button>
            <button onclick="toggleMusic()" id="music-play-btn" style="width:68px; height:68px; border-radius:50%; background:#ec4899; border:none; color:#fff; font-size:26px; cursor:pointer;">▶</button>
            <button class="calc-btn action" style="width:52px; height:52px; border-radius:50%;">⏭</button>
          </div>
        </div>
      `;
      break;

    // 7. Voice Recorder
    case 'recorder':
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; gap:24px; text-align:center;">
          <h2 id="rec-timer" style="font-size:40px; font-variant-numeric:tabular-nums;">00:00</h2>
          <button onclick="toggleRecording()" id="mic-btn" style="width:80px; height:80px; border-radius:50%; background:#ef4444; border:none; color:#fff; font-size:32px; cursor:pointer; box-shadow:0 8px 25px rgba(239,68,68,0.4);">🎙️</button>
          <p id="rec-status-text" style="color:#94a3b8; font-size:13px;">Tap mic to record audio</p>
          <audio id="recorded-audio" controls style="display:none; width:90%; margin-top:10px;"></audio>
        </div>
      `;
      break;

    // 8. Files
    case 'files':
      body.innerHTML = `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h4 style="color:#38bdf8;">UFS 4.0 Storage</h4>
            <span style="font-size:12px; color:#94a3b8;">42 GB / 128 GB</span>
          </div>
          <div style="width:100%; height:8px; background:#222; border-radius:4px; margin:10px 0; overflow:hidden;">
            <div style="width:33%; height:100%; background:linear-gradient(90deg, #38bdf8, #22c55e);"></div>
          </div>
          <p style="color:#94a3b8; font-size:12px;">86 GB Available</p>
        </div>
        <div class="card">
          <div class="card-item"><span>📄 Documents (PDF, DOCX)</span><span style="color:#94a3b8;">24 files ›</span></div>
          <div class="card-item" onclick="openApp('photos')"><span>🖼️ Images & Camera</span><span style="color:#94a3b8;">186 photos ›</span></div>
          <div class="card-item"><span>⬇️ Downloads</span><span style="color:#94a3b8;">12 files ›</span></div>
          <div class="card-item"><span>🎵 Audio Tracks</span><span style="color:#94a3b8;">8 tracks ›</span></div>
        </div>
      `;
      break;

    // 9. Hardware Drivers
    case 'drivers':
      body.innerHTML = `
        <div class="card">
          <h4 style="color:#38bdf8;">Hardware Interfaces</h4>
          <p style="font-size:12px; color:#94a3b8; margin-top:2px;">Real-time kernel bridges</p>
        </div>
        <div class="card">
          <div class="card-item"><span>📷 Camera Sensor</span><b style="color:#22c55e;">Sony IMX890 (Online)</b></div>
          <div class="card-item"><span>🎙️ Audio DAC</span><b style="color:#22c55e;">48kHz Hi-Res Active</b></div>
          <div class="card-item"><span>🧭 IMU Motion</span><b style="color:#22c55e;">Calibrated</b></div>
          <div class="card-item"><span>⚡ GPU Adreno/Mali</span><b style="color:#22c55e;">120Hz Native</b></div>
          <div class="card-item"><span>📶 5G Modem Subsystem</span><b style="color:#22c55e;">5G SA Connected</b></div>
        </div>
      `;
      break;

    // 10. Weather
    case 'weather':
      body.innerHTML = `
        <div style="text-align:center; padding:30px 0;">
          <h1 style="font-size:48px; margin-bottom:4px;">29°C</h1>
          <p style="color:#38bdf8; font-size:18px;">Partly Cloudy</p>
          <div class="card" style="margin-top:24px;">
            <div class="card-item"><span>Humidity</span><b>65%</b></div>
            <div class="card-item"><span>Wind Speed</span><b>12 km/h</b></div>
            <div class="card-item"><span>Air Quality Index</span><b style="color:#22c55e;">Good (AQI 42)</b></div>
          </div>
        </div>
      `;
      break;

    // 11. Phone Dialer
    case 'dialer':
      dialPadStr = '';
      body.innerHTML = `
        <div class="calc-screen" id="dial-number" style="font-size:28px; text-align:center; min-height:50px;"></div>
        <div class="calc-grid" style="grid-template-columns: repeat(3, 1fr);">
          <button class="calc-btn" onclick="dialDigit('1')">1</button>
          <button class="calc-btn" onclick="dialDigit('2')">2</button>
          <button class="calc-btn" onclick="dialDigit('3')">3</button>
          <button class="calc-btn" onclick="dialDigit('4')">4</button>
          <button class="calc-btn" onclick="dialDigit('5')">5</button>
          <button class="calc-btn" onclick="dialDigit('6')">6</button>
          <button class="calc-btn" onclick="dialDigit('7')">7</button>
          <button class="calc-btn" onclick="dialDigit('8')">8</button>
          <button class="calc-btn" onclick="dialDigit('9')">9</button>
          <button class="calc-btn" onclick="dialDigit('*')">*</button>
          <button class="calc-btn" onclick="dialDigit('0')">0</button>
          <button class="calc-btn" onclick="dialDigit('#')">#</button>
          <button class="calc-btn action" onclick="dialClear()">⌫</button>
          <button class="calc-btn op" style="background:#22c55e;" onclick="if(dialPadStr) window.location.href='tel:'+dialPadStr">📞</button>
          <div></div>
        </div>
      `;
      break;

    // 12. Browser
    case 'browser':
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; gap:8px;">
            <input type="text" id="web-search-query" style="flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:12px; color:#fff;" placeholder="Search or type URL...">
            <button onclick="launchSearch()" class="calc-btn op" style="padding:0 18px; border-radius:14px;">Go</button>
          </div>
          <div class="card">
            <h4 style="font-size:14px; color:#38bdf8; margin-bottom:14px;">Shortcuts</h4>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; text-align:center;">
              <a href="https://google.com" target="_blank" style="text-decoration:none; color:#fff; font-size:12px;"><div class="icon-box mat-blue" style="width:48px; height:48px; margin:0 auto 6px;">G</div>Google</a>
              <a href="https://youtube.com" target="_blank" style="text-decoration:none; color:#fff; font-size:12px;"><div class="icon-box mat-red" style="width:48px; height:48px; margin:0 auto 6px;">▶</div>YouTube</a>
              <a href="https://github.com" target="_blank" style="text-decoration:none; color:#fff; font-size:12px;"><div class="icon-box mat-zinc" style="width:48px; height:48px; margin:0 auto 6px;">🐙</div>GitHub</a>
              <a href="https://wikipedia.org" target="_blank" style="text-decoration:none; color:#fff; font-size:12px;"><div class="icon-box mat-slate" style="width:48px; height:48px; margin:0 auto 6px;">W</div>Wikipedia</a>
            </div>
          </div>
        </div>
      `;
      break;
  }
}

function closeApp() {
  document.getElementById('app-modal').style.display = 'none';
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
}

// Camera Helper Functions
function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacing, width: { ideal: 1280 }, height: { ideal: 720 } }
    })
    .then(stream => {
      mediaStream = stream;
      const v = document.getElementById('cam-feed
