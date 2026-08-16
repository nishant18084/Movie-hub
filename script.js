let mediaStream = null;

// 1. Boot Transition
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const boot = document.getElementById('boot-screen');
    const os = document.getElementById('main-os');
    boot.classList.add('boot-fadeout');
    os.classList.add('os-visible');
    setTimeout(() => boot.remove(), 800);
  }, 2500);
});

// 2. Real-time Clock
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  
  document.getElementById('live-status-time').innerText = timeStr;
  document.getElementById('shade-time').innerText = timeStr;
  document.getElementById('live-clock').innerText = timeStr;
  document.getElementById('live-date').innerText = dateStr;
}
setInterval(updateClock, 1000);
updateClock();

// 3. Fullscreen Toggle
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// 4. Notification & Control Center Shade
function toggleControlCenter() {
  const cc = document.getElementById('control-center');
  cc.classList.toggle('shade-active');
}

function toggleTile(id) {
  const tile = document.getElementById(id);
  tile.classList.toggle('active');
}

function toggleTorch() {
  const tile = document.getElementById('tile-torch');
  tile.classList.toggle('active');
  document.body.style.filter = tile.classList.contains('active') ? 'brightness(1.5)' : 'none';
}

function changeBrightness(val) {
  document.getElementById('main-os').style.filter = `brightness(${val}%)`;
}

// 5. Drawer & Search
function toggleDrawer() {
  document.getElementById('app-drawer').classList.toggle('drawer-active');
}

function filterApps() {
  const q = document.getElementById('app-search').value.toLowerCase();
  document.querySelectorAll('#home-grid .app-item').forEach(item => {
    const label = item.querySelector('.label').innerText.toLowerCase();
    item.style.display = label.includes(q) ? 'flex' : 'none';
  });
}

// 6. Application Routing & Handlers
function openApp(appName) {
  const win = document.getElementById('app-window');
  const title = document.getElementById('window-title');
  const content = document.getElementById('window-content');
  win.classList.add('window-active');

  switch(appName) {
    case 'dialer':
      title.innerText = "Phone";
      content.innerHTML = `
        <div class="dialer-screen" id="dial-number"></div>
        <div class="dial-grid">
          <div class="dial-btn" onclick="dialDigit('1')">1<span class="dial-sub">.</span></div>
          <div class="dial-btn" onclick="dialDigit('2')">2<span class="dial-sub">ABC</span></div>
          <div class="dial-btn" onclick="dialDigit('3')">3<span class="dial-sub">DEF</span></div>
          <div class="dial-btn" onclick="dialDigit('4')">4<span class="dial-sub">GHI</span></div>
          <div class="dial-btn" onclick="dialDigit('5')">5<span class="dial-sub">JKL</span></div>
          <div class="dial-btn" onclick="dialDigit('6')">6<span class="dial-sub">MNO</span></div>
          <div class="dial-btn" onclick="dialDigit('7')">7<span class="dial-sub">PQRS</span></div>
          <div class="dial-btn" onclick="dialDigit('8')">8<span class="dial-sub">TUV</span></div>
          <div class="dial-btn" onclick="dialDigit('9')">9<span class="dial-sub">WXYZ</span></div>
          <div class="dial-btn" onclick="dialDigit('*')">*</div>
          <div class="dial-btn" onclick="dialDigit('0')">0<span class="dial-sub">+</span></div>
          <div class="dial-btn" onclick="dialDigit('#')">#</div>
          <div class="dial-btn" onclick="dialClear()" style="font-size:18px;">⌫</div>
          <div class="dial-btn dial-call-btn" onclick="startCall()">📞</div>
          <div></div>
        </div>
      `;
      break;

    case 'camera':
      title.innerText = "Camera";
      content.innerHTML = `
        <div class="camera-view">
          <video id="cam-feed" autoplay playsinline muted></video>
        </div>
        <canvas id="cam-canvas" style="display:none;"></canvas>
        <div class="camera-actions">
          <img id="cam-thumb" class="captured-thumb" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50' fill='%23334155'><rect width='50' height='50'/></svg>">
          <button class="shutter-btn" onclick="takePhoto()"></button>
          <div style="width:50px;"></div>
        </div>
      `;
      startCameraFeed();
      break;

    case 'settings':
      title.innerText = "Settings";
      content.innerHTML = `
        <div class="settings-container">
          <div class="settings-card">
            <div class="settings-item">
              <div class="item-left">
                <div class="s-icon" style="background:#f59e0b;">✈️</div>
                <span class="s-title">Aeroplane mode</span>
              </div>
              <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            </div>
            <div class="settings-item" onclick="toggleControlCenter()">
              <div class="item-left"><div class="s-icon" style="background:#0284c7;">📶</div><span class="s-title">Wi-Fi</span></div>
              <div class="item-right"><span>Off</span><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="toggleControlCenter()">
              <div class="item-left"><div class="s-icon" style="background:#2563eb;">ᛒ</div><span class="s-title">Bluetooth</span></div>
              <div class="item-right"><span>Off</span><span class="arrow">›</span></div>
            </div>
          </div>
          <div class="settings-card">
            <div class="settings-item" onclick="openAboutDevice()">
              <div class="item-left"><div class="s-icon" style="background:#16a34a;">📱</div><span class="s-title">About device</span></div>
              <div class="item-right"><span>Nexus Alpha</span><span class="arrow">›</span></div>
            </div>
          </div>
        </div>
      `;
      break;

    case 'calc':
      title.innerText = "Calculator";
      content.innerHTML = `
        <div class="calc-screen" id="calc-display">0</div>
        <div class="calc-grid">
          <button class="calc-btn action" onclick="calcAction('C')">C</button>
          <button class="calc-btn action" onclick="calcAction('DEL')">⌫</button>
          <button class="calc-btn op" onclick="calcAction('/')">/</button>
          <button class="calc-btn op" onclick="calcAction('*')">×</button>
          <button class="calc-btn" onclick="calcAction('7')">7</button>
          <button class="calc-btn" onclick="calcAction('8')">8</button>
          <button class="calc-btn" onclick="calcAction('9')">9</button>
          <button class="calc-btn op" onclick="calcAction('-')">-</button>
          <button class="calc-btn" onclick="calcAction('4')">4</button>
          <button class="calc-btn" onclick="calcAction('5')">5</button>
          <button class="calc-btn" onclick="calcAction('6')">6</button>
          <button class="calc-btn op" onclick="calcAction('+')">+</button>
          <button class="calc-btn" onclick="calcAction('1')">1</button>
          <button class="calc-btn" onclick="calcAction('2')">2</button>
          <button class="calc-btn" onclick="calcAction('3')">3</button>
          <button class="calc-btn op" onclick="calcAction('=')">=</button>
          <button class="calc-btn" style="grid-column: span 2;" onclick="calcAction('0')">0</button>
          <button class="calc-btn" onclick="calcAction('.')">.</button>
        </div>
      `;
      break;

    case 'notes':
      title.innerText = "Quick Notes";
      const saved = localStorage.getItem('nexus_notes') || '';
      content.innerHTML = `
        <textarea id="note-input" oninput="saveNote()" style="width:100%; height:70vh; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px; color:#fff; font-size:16px; outline:none; resize:none;" placeholder="Start typing...">${saved}</textarea>
      `;
      break;

    case 'weather':
      title.innerText = "Weather";
      content.innerHTML = `
        <div style="text-align:center; padding:30px 0;">
          <h2 style="font-size:36px; margin-bottom:4px;">29°C</h2>
          <p style="color:#38bdf8; font-size:18px;">Partly Cloudy</p>
          <p style="color:#94a3b8; margin-top:8px;">Humidity: 65% • Wind: 12 km/h</p>
        </div>
      `;
      break;

    case 'watch':
      title.innerText = "Stopwatch";
      content.innerHTML = `
        <div style="text-align:center; padding:40px 0;">
          <h1 id="sw-display" style="font-size:44px; font-variant-numeric: tabular-nums; margin-bottom:24px;">00:00.00</h1>
          <div style="display:flex; justify-content:center; gap:16px;">
            <button id="sw-btn" onclick="toggleSw()" class="calc-btn action" style="width:100px; background:#22c55e;">Start</button>
            <button onclick="resetSw()" class="calc-btn action" style="width:100px;">Reset</button>
          </div>
        </div>
      `;
      break;
  }
}

function closeApp() {
  document.getElementById('app-window').classList.remove('window-active');
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  if (swTimer) clearInterval(swTimer);
  isSwRunning = false;
}

// 7. Dialer Functions
let dialPadStr = '';
function dialDigit(d) {
  dialPadStr += d;
  document.getElementById('dial-number').innerText = dialPadStr;
}
function dialClear() {
  dialPadStr = dialPadStr.slice(0, -1);
  document.getElementById('dial-number').innerText = dialPadStr;
}
function startCall() {
  if (dialPadStr.length > 0) {
    window.location.href = `tel:${dialPadStr}`;
  }
}

// 8. Real Camera Stream & Shutter
async function startCameraFeed() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    const video = document.getElementById('cam-feed');
    if (video) video.srcObject = mediaStream;
  } catch (err) {
    alert("Camera permission denied or camera not accessible.");
  }
}

function takePhoto() {
  const video = document.getElementById('cam-feed');
  const canvas = document.getElementById('cam-canvas');
  const thumb = document.getElementById('cam-thumb');
  if (video && canvas) {
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL('image/png');
    if (thumb) thumb.src = imgData;
  }
}

// 9. About Device
function openAboutDevice() {
  const content = document.getElementById('window-content');
  const title = document.getElementById('window-title');
  title.innerText = "About device";
  content.innerHTML = `
    <div class="settings-container">
      <div class="settings-card">
        <div class="settings-item"><span class="s-title">Device name</span><span class="item-right" style="color:#38bdf8; font-weight:600;">Nexus Alpha</span></div>
        <div class="settings-item"><span class="s-title">Model</span><span class="item-right">RMX_2026</span></div>
        <div class="settings-item"><span class="s-title">Processor</span><span class="item-right">MediaTek Dimensity 7400</span></div>
        <div class="settings-item"><span class="s-title">RAM</span><span class="item-right">8.00 GB</span></div>
        <div class="settings-item"><span class="s-title">Storage</span><span class="item-right">128 GB (86 GB Free)</span></div>
        <div class="settings-item"><span class="s-title">Android Version</span><span class="item-right">15</span></div>
      </div>
      <button onclick="openApp('settings')" class="calc-btn action" style="width:100%; margin-top:10px;">← Back to Settings</button>
    </div>
  `;
}

// 10. Calculator Engine
let calcBuffer = '';
function calcAction(val) {
  const display = document.getElementById('calc-display');
  if (val === 'C') {
    calcBuffer = '';
    display.innerText = '0';
  } else if (val === 'DEL') {
    calcBuffer = calcBuffer.slice(0, -1);
    display.innerText = calcBuffer || '0';
  } else if (val === '=') {
    try {
      calcBuffer = String(eval(calcBuffer));
      display.innerText = calcBuffer;
    } catch {
      display.innerText = 'Error';
      calcBuffer = '';
    }
  } else {
    calcBuffer += val;
    display.innerText = calcBuffer;
  }
}

// 11. Notes Storage
function saveNote() {
  const val = document.getElementById('note-input').value;
  localStorage.setItem('nexus_notes', val);
}

// 12. Stopwatch Engine
let swTimer = null, swElapsed = 0, isSwRunning = false;
function toggleSw() {
  const btn = document.getElementById('sw-btn');
  if (!isSwRunning) {
    const start = Date.now() - swElapsed;
    swTimer = setInterval(() => {
      swElapsed = Date.now() - start;
      const m = Math.floor(swElapsed / 60000);
      const s = Math.floor((swElapsed % 60000) / 1000);
      const ms = Math.floor((swElapsed % 1000) / 10);
      document.getElementById('sw-display').innerText = 
        `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }, 10);
    btn.innerText = 'Stop';
    btn.style.background = '#ef4444';
    isSwRunning = true;
  } else {
    clearInterval(swTimer);
    btn.innerText = 'Start';
    btn.style.background = '#22c55e';
    isSwRunning = false;
  }
}

function resetSw() {
  clearInterval(swTimer);
  swElapsed = 0;
  isSwRunning = false;
  const disp = document.getElementById('sw-display');
  const btn = document.getElementById('sw-btn');
  if (disp) disp.innerText = '00:00.00';
  if (btn) {
    btn.innerText = 'Start';
    btn.style.background = '#22c55e';
  }
}
