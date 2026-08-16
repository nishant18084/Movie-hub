// Clock Engine
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
let activeFilterIdx = 0;
const camFilters = ['none', 'grayscale(100%)', 'sepia(80%)', 'contrast(150%)', 'hue-rotate(90deg)'];
let isMusicPlaying = false;
let mediaRecorder = null;
let audioChunks = [];
let navMode = 'buttons';

function openApp(name) {
  const modal = document.getElementById('app-modal');
  const hdr = document.getElementById('modal-hdr');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  modal.style.display = 'flex';
  title.innerText = name.toUpperCase();

  // 1. Camera Engine
  if (name === 'camera') {
    hdr.style.display = 'none';
    body.style.padding = '0';
    const lastThumb = localStorage.getItem('nexus_last_photo') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" fill="%23334155"><rect width="52" height="52"/></svg>';
    
    body.innerHTML = `
      <div class="cam-fullscreen">
        <div class="cam-top-icons">
          <button onclick="this.style.color = (this.style.color === 'rgb(245, 158, 11)') ? '#fff' : '#f59e0b'">⚡</button>
          <button onclick="alert('HDR: Auto Active')">HDR</button>
          <button onclick="alert('Google Lens Active')">⛶</button>
          <button onclick="closeApp()">✕</button>
        </div>

        <div class="cam-video-container">
          <video id="cam-video-feed" autoplay playsinline muted></video>
          <div id="cam-flash-fx" style="position:absolute; inset:0; background:white; opacity:0; pointer-events:none; transition:opacity 0.12s;"></div>

          <div class="cam-floating-controls">
            <div class="cam-round-icon" onclick="switchFilter()">🔘</div>
            <div class="cam-round-icon" onclick="alert('Beauty Retouch 50%')">✨</div>
          </div>

          <div class="cam-zoom-badge">1x</div>
        </div>

        <div class="cam-more-screen" id="cam-more-panel">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="font-size:16px;">More Modes</h3>
            <button onclick="setCameraMode('PHOTO')" style="background:transparent; border:none; color:var(--yellow); font-size:18px; cursor:pointer;">✕</button>
          </div>
          <div class="more-grid-items">
            <div class="more-btn-item" onclick="selectMore('PRO')"><div class="more-icon-wrap">PRO</div><span class="more-text">PRO</span></div>
            <div class="more-btn-item" onclick="selectMore('PANO')"><div class="more-icon-wrap">🖼️</div><span class="more-text">PANO</span></div>
            <div class="more-btn-item" onclick="selectMore('HI-RES')"><div class="more-icon-wrap">⊞</div><span class="more-text">HI-RES</span></div>
            <div class="more-btn-item" onclick="selectMore('FILM')"><div class="more-icon-wrap">🎬</div><span class="more-text">FILM</span></div>
            <div class="more-btn-item" onclick="selectMore('SLO-MO')"><div class="more-icon-wrap">⏳</div><span class="more-text">SLO-MO</span></div>
            <div class="more-btn-item" onclick="selectMore('TIME-LAPSE')"><div class="more-icon-wrap">⏱️</div><span class="more-text">TIME-LAPSE</span></div>
            <div class="more-btn-item" onclick="selectMore('SCANNER')"><div class="more-icon-wrap">📄</div><span class="more-text">TEXT SCANNER</span></div>
          </div>
        </div>

        <div class="cam-modes">
          <span class="cam-mode-label" onclick="setCameraMode('STREET')">STREET</span>
          <span class="cam-mode-label" onclick="setCameraMode('VIDEO')">VIDEO</span>
          <span class="cam-mode-label active" id="mode-photo-label" onclick="setCameraMode('PHOTO')">PHOTO</span>
          <span class="cam-mode-label" onclick="setCameraMode('PORTRAIT')">PORTRAIT</span>
          <span class="cam-mode-label" onclick="setCameraMode('MORE')">MORE</span>
        </div>

        <div class="cam-shutter-bar">
          <img id="cam-gallery-thumb" onclick="openApp('photos')" class="cam-thumb-btn" src="${lastThumb}">
          <button onclick="capturePhoto()" class="cam-shutter-button">
            <div class="cam-shutter-core"></div>
          </button>
          <button onclick="toggleFacing()" class="cam-flip-btn">🔄</button>
        </div>
      </div>
      <canvas id="cam-capture-canvas" style="display:none;"></canvas>
    `;
    startCameraStream();
    return;
  }

  hdr.style.display = 'flex';
  body.style.padding = '18px';

  switch(name) {
    // 2. Photos / Gallery
    case 'photos':
      const savedPhoto = localStorage.getItem('nexus_last_photo');
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <h3 style="font-size:15px; color:#94a3b8;">Camera Gallery & Captures</h3>
          <div id="photos-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
            ${savedPhoto ? `
              <div style="position:relative; aspect-ratio:1; border-radius:14px; overflow:hidden; border:1px solid rgba(255,255,255,0.2);">
                <img src="${savedPhoto}" style="width:100%; height:100%; object-fit:cover;" onclick="viewFullPhoto('${savedPhoto}')">
              </div>
            ` : '<p style="color:#64748b; grid-column:span 3; text-align:center; padding:40px 0;">No photos clicked yet.<br>Open Camera to capture!</p>'}
          </div>
          ${savedPhoto ? `<button onclick="localStorage.removeItem('nexus_last_photo'); openApp('photos')" class="calc-btn action" style="padding:10px; font-size:13px;">Clear Gallery</button>` : ''}
        </div>
      `;
      break;

    // 3. Calculator
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

    // 4. Notes Notepad
    case 'notes':
      const savedNotes = localStorage.getItem('nexus_notes') || '';
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px;">
          <textarea id="note-input" oninput="localStorage.setItem('nexus_notes', this.value)" style="width:100%; height:62vh; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px; color:#fff; font-size:16px; resize:none;" placeholder="Start writing notes...">${savedNotes}</textarea>
          <button onclick="localStorage.removeItem('nexus_notes'); document.getElementById('note-input').value='';" class="calc-btn action" style="padding:10px; font-size:13px;">Clear Notes</button>
        </div>
      `;
      break;

    // 5. Music Player
    case 'music':
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:10px 0; gap:18px;">
          <div id="vinyl-disc" style="width:180px; height:180px; border-radius:50%; background:radial-gradient(circle, #334155 20%, #0f172a 70%); border:4px solid #ec4899; display:flex; align-items:center; justify-content:center; font-size:48px; box-shadow:0 8px 25px rgba(236,72,153,0.3); transition:transform 1s linear;">
            🎵
          </div>
          <div>
            <h2 style="font-size:18px; font-weight:600;">Nexus Synthwave Cyber</h2>
            <p style="color:#94a3b8; font-size:13px; margin-top:2px;">Digital Audio Studio</p>
          </div>
          <input type="range" min="0" max="100" value="40" style="width:85%; accent-color:#ec4899;">
          <div style="display:flex; gap:20px; align-items:center;">
            <button class="calc-btn action" style="width:50px; height:50px; border-radius:50%;">⏮</button>
            <button onclick="toggleMusic()" id="music-play-btn" style="width:65px; height:65px; border-radius:50%; background:#ec4899; border:none; color:#fff; font-size:24px; cursor:pointer;">▶</button>
            <button class="calc-btn action" style="width:50px; height:50px; border-radius:50%;">⏭</button>
          </div>
        </div>
      `;
      break;

    // 6. Voice Recorder
    case 'recorder':
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; gap:24px; text-align:center;">
          <h2 id="rec-timer" style="font-size:36px; font-variant-numeric:tabular-nums;">00:00</h2>
          <button onclick="toggleRecording()" id="mic-btn" style="width:75px; height:75px; border-radius:50%; background:#ef4444; border:none; color:#fff; font-size:28px; cursor:pointer; box-shadow:0 6px 20px rgba(239,68,68,0.4);">🎙️</button>
          <p id="rec-status-text" style="color:#94a3b8; font-size:13px;">Tap mic to record audio</p>
          <audio id="recorded-audio" controls style="display:none; width:90%;"></audio>
        </div>
      `;
      break;

    // 7. Files Storage
    case 'files':
      body.innerHTML = `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h4 style="color:#38bdf8;">Device Storage</h4>
            <span style="font-size:12px; color:#94a3b8;">42 GB / 128 GB</span>
          </div>
          <div style="width:100%; height:6px; background:#222; border-radius:3px; margin:10px 0; overflow:hidden;">
            <div style="width:33%; height:100%; background:linear-gradient(90deg, #38bdf8, #22c55e);"></div>
          </div>
          <p style="color:#94a3b8; font-size:12px;">86 GB Available</p>
        </div>
        <div class="card">
          <div class="card-item" onclick="openFileCategory('Documents')"><span>📄 Documents (PDF, TXT)</span><span style="color:#94a3b8;">24 files ›</span></div>
          <div class="card-item" onclick="openApp('photos')"><span>🖼️ Images & Camera</span><span style="color:#94a3b8;">186 photos ›</span></div>
          <div class="card-item" onclick="openFileCategory('Downloads')"><span>⬇️ Downloads</span><span style="color:#94a3b8;">12 files ›</span></div>
          <div class="card-item" onclick="openFileCategory('Audio')"><span>🎵 Audio & Recordings</span><span style="color:#94a3b8;">8 tracks ›</span></div>
          <div class="card-item" onclick="openFileCategory('APKs')"><span>📦 Packages (APK)</span><span style="color:#94a3b8;">3 files ›</span></div>
        </div>
      `;
      break;

    // 8. Drivers & Hardware
    case 'drivers':
      body.innerHTML = `
        <div class="card">
          <h4 style="color:#38bdf8;">Hardware Driver Bridges</h4>
          <p style="font-size:12px; color:#94a3b8; margin-top:2px;">Real-time peripheral kernel interfaces</p>
        </div>
        <div class="card">
          <div class="card-item"><span>📷 Camera Sensor Driver</span><b style="color:#22c55e;">Online (v2.4)</b></div>
          <div class="card-item"><span>🎙️ Audio DAC Driver</span><b style="color:#22c55e;">48kHz Hi-Res</b></div>
          <div class="card-item"><span>🧭 IMU Gyroscope Motion</span><b style="color:#22c55e;">Active</b></div>
          <div class="card-item"><span>⚡ GPU Acceleration</span><b style="color:#22c55e;">120Hz Native</b></div>
          <div class="card-item"><span>📶 5G Modem Baseband</span><b style="color:#22c55e;">Connected</b></div>
        </div>
        <button onclick="alert('Driver diagnostics: All hardware drivers are running perfectly.')" class="calc-btn action" style="width:100%; padding:10px; font-size:13px;">Run Hardware Diagnostic</button>
      `;
      break;

    // 9. Phone Dialer
    case 'dialer':
      dialPadStr = '';
      body.innerHTML = `
        <div class="dialer-screen" id="dial-number"></div>
        <div class="dial-grid">
          <div class="dial-btn" onclick="dialDigit('1')">1</div>
          <div class="dial-btn" onclick="dialDigit('2')">2</div>
          <div class="dial-btn" onclick="dialDigit('3')">3</div>
          <div class="dial-btn" onclick="dialDigit('4')">4</div>
          <div class="dial-btn" onclick="dialDigit('5')">5</div>
          <div class="dial-btn" onclick="dialDigit('6')">6</div>
          <div class="dial-btn" onclick="dialDigit('7')">7</div>
          <div class="dial-btn" onclick="dialDigit('8')">8</div>
          <div class="dial-btn" onclick="dialDigit('9')">9</div>
          <div class="dial-btn" onclick="dialDigit('*')">*</div>
          <div class="dial-btn" onclick="dialDigit('0')">0</div>
          <div class="dial-btn" onclick="dialDigit('#')">#</div>
          <div class="dial-btn" onclick="dialClear()">⌫</div>
          <div class="dial-btn" onclick="if(dialPadStr) window.location.href='tel:'+dialPadStr" style="background:#22c55e;">📞</div>
          <div></div>
        </div>
      `;
      break;

    // 10. Web Browser
    case 'browser':
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; gap:8px;">
            <input type="text" id="web-search-query" style="flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px; color:#fff;" placeholder="Search or type URL...">
            <button onclick="launchSearch()" class="calc-btn op" style="padding:0 16px;">Go</button>
          </div>
          <div class="card">
            <h4 style="font-size:14px; color:#38bdf8; margin-bottom:12px;">Quick Shortcuts</h4>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; text-align:center;">
              <a href="https://google.com" target="_blank" style="text-decoration:none; color:#fff; font-size:12px;"><div class="icon bg-blue" style="width:48px; height:48px; margin:0 auto 4px;">G</div>Google</a>
              <a href="https://youtube.com" target="_blank" style="text-decoration:none; color:#fff; font-size:12px;"><div class="icon bg-red" style="width:48px; height:48px; margin:0 auto 4px;">▶</div>YouTube</a>
              <a href="https://github.com" target="_blank" style="text-decoration:none; color:#fff; font-size:12px;"><div class="icon bg-zinc" style="width:48px; height:48px; margin:0 auto 4px;">🐙</div>GitHub</a>
              <a href="https://wikipedia.org" target="_blank" style="text-decoration:none; color:#fff; font-size:12px;"><div class="icon bg-slate" style="width:48px; height:48px; margin:0 auto 4px;">W</div>Wikipedia</a>
            </div>
          </div>
        </div>
      `;
      break;

    // 11. Weather
    case 'weather':
      body.innerHTML = `
        <div style="text-align:center; padding:30px 0;">
          <h1 style="font-size:44px; margin-bottom:4px;">29°C</h1>
          <p style="color:#38bdf8; font-size:18px;">Partly Cloudy</p>
          <div class="card" style="margin-top:24px;">
            <div class="card-item"><span>Humidity</span><b>65%</b></div>
            <div class="card-item"><span>Wind Speed</span><b>12 km/h</b></div>
            <div class="card-item"><span>Air Quality</span><b style="color:#22c55e;">Good (AQI 42)</b></div>
          </div>
        </div>
      `;
      break;

    // 12. Settings
    case 'settings':
      body.innerHTML = `
        <div class="card">
          <div class="card-item" onclick="toggleNavLayoutSetting()">
            <span>System Navigation</span>
            <b style="color:#38bdf8;">${navMode === 'buttons' ? '3-Button Bar' : 'Full Gestures'} ›</b>
          </div>
          <div class="card-item" onclick="alert('Wi-Fi scanning...')">
            <span>Wi-Fi Network</span>
            <span style="color:#94a3b8;">Off ›</span>
          </div>
          <div class="card-item" onclick="alert('Bluetooth ready')">
            <span>Bluetooth</span>
            <span style="color:#94a3b8;">Off ›</span>
          </div>
        </div>
        <div class="card">
          <div class="card-item"><span>Device Name</span><b style="color:#38bdf8;">Nexus Alpha</b></div>
          <div class="card-item"><span>Processor</span><b>MediaTek Dimensity 7400</b></div>
          <div class="card-item"><span>RAM</span><b>8.00 GB</b></div>
          <div class="card-item"><span>Storage</span><b>128 GB</b></div>
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
function startCameraStream() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacing, width: { ideal: 1280 }, height: { ideal: 720 } }
    })
    .then(stream => {
      mediaStream = stream;
      const v = document.getElementById('cam-video-feed');
      if (v) {
        v.srcObject = stream;
        v.onloadedmetadata = () => v.play().catch(() => {});
      }
    })
    .catch(() => alert('Allow Camera Access in browser settings.'));
  }
}

function toggleFacing() {
  currentFacing = (currentFacing === 'environment') ? 'user' : 'environment';
  if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
  startCameraStream();
}

function switchFilter() {
  activeFilterIdx = (activeFilterIdx + 1) % camFilters.length;
  const v = document.getElementById('cam-video-feed');
  if (v) v.style.filter = camFilters[activeFilterIdx];
}

function setCameraMode(mode) {
  const morePanel = document.getElementById('cam-more-panel');
  document.querySelectorAll('.cam-mode-label').forEach(el => {
    el.classList.toggle('active', el.innerText === mode);
  });
  if (mode === 'MORE') {
    if (morePanel) morePanel.style.display = 'flex';
  } else {
    if (morePanel) morePanel.style.display = 'none';
  }
}

function selectMore(m) {
  alert(`Mode: ${m}`);
  setCameraMode('PHOTO');
}

function capturePhoto() {
  const v = document.getElementById('cam-video-feed');
  const c = document.getElementById('cam-capture-canvas');
  con
