let mediaStream = null;
let currentFacingMode = "environment"; // Default back camera
let swTimer = null, swElapsed = 0, isSwRunning = false;
let calcBuffer = '';
let dialPadStr = '';

// 1. Boot Transition
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const boot = document.getElementById('boot-screen');
    const os = document.getElementById('main-os');
    if (boot) boot.classList.add('boot-fadeout');
    if (os) os.classList.add('os-visible');
    setTimeout(() => { if (boot) boot.remove(); }, 800);
  }, 2500);
});

// 2. Real-time Clock & Status Bar
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  
  const statusTime = document.getElementById('live-status-time');
  const shadeTime = document.getElementById('shade-time');
  const liveClock = document.getElementById('live-clock');
  const liveDate = document.getElementById('live-date');

  if (statusTime) statusTime.innerText = timeStr;
  if (shadeTime) shadeTime.innerText = timeStr;
  if (liveClock) liveClock.innerText = timeStr;
  if (liveDate) liveDate.innerText = dateStr;
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

// 4. Control Center / Notification Shade
function toggleControlCenter() {
  const cc = document.getElementById('control-center');
  if (cc) cc.classList.toggle('shade-active');
}

function toggleTile(id) {
  const tile = document.getElementById(id);
  if (tile) tile.classList.toggle('active');
}

function toggleTorch() {
  const tile = document.getElementById('tile-torch');
  if (tile) {
    tile.classList.toggle('active');
    document.body.style.filter = tile.classList.contains('active') ? 'brightness(1.4)' : 'none';
  }
}

function changeBrightness(val) {
  const mainOs = document.getElementById('main-os');
  if (mainOs) mainOs.style.filter = `brightness(${val}%)`;
}

// 5. Drawer & Search Filter
function toggleDrawer() {
  const drawer = document.getElementById('app-drawer');
  if (drawer) drawer.classList.toggle('drawer-active');
}

function filterApps() {
  const q = document.getElementById('app-search').value.toLowerCase();
  document.querySelectorAll('#home-grid .app-item').forEach(item => {
    const label = item.querySelector('.label').innerText.toLowerCase();
    item.style.display = label.includes(q) ? 'flex' : 'none';
  });
}

// 6. Application Routing
function openApp(appName) {
  const win = document.getElementById('app-window');
  const title = document.getElementById('window-title');
  const content = document.getElementById('window-content');
  if (!win || !title || !content) return;

  win.classList.add('window-active');

  switch(appName) {
    case 'settings':
      title.innerText = "Settings";
      content.innerHTML = `
        <div class="settings-container">
          
          <!-- Group 1: Connectivity -->
          <div class="settings-card">
            <div class="settings-item">
              <div class="item-left">
                <div class="s-icon" style="background:#f59e0b;">✈️</div>
                <span class="s-title">Aeroplane mode</span>
              </div>
              <label class="switch">
                <input type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
            <div class="settings-item" onclick="alert('Wi-Fi scanning...')">
              <div class="item-left"><div class="s-icon" style="background:#0284c7;">📶</div><span class="s-title">Wi-Fi</span></div>
              <div class="item-right"><span>Off</span><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Bluetooth scanning...')">
              <div class="item-left"><div class="s-icon" style="background:#2563eb;">ᛒ</div><span class="s-title">Bluetooth</span></div>
              <div class="item-right"><span>Off</span><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('SIM: 5G Network Active')">
              <div class="item-left"><div class="s-icon" style="background:#16a34a;">⇅</div><span class="s-title">Mobile network</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Connected Devices: None')">
              <div class="item-left"><div class="s-icon" style="background:#0ea5e9;">🔗</div><span class="s-title">Device Connect</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

          <!-- Group 2: Personalisation & Display -->
          <div class="settings-card">
            <div class="settings-item" onclick="alert('Wallpapers, Themes & Icon Pack')">
              <div class="item-left"><div class="s-icon" style="background:#ea580c;">🎨</div><span class="s-title">Home screen, Lock screen & style</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Display: Dark Mode Active | 120Hz')">
              <div class="item-left"><div class="s-icon" style="background:#eab308;">☀️</div><span class="s-title">Display & brightness</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

          <!-- Group 3: Sound & Notifications -->
          <div class="settings-card">
            <div class="settings-item" onclick="alert('Volume: Media 100%, Ring 80%')">
              <div class="item-left"><div class="s-icon" style="background:#22c55e;">🔔</div><span class="s-title">Sound & vibration</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Notifications: Allowed')">
              <div class="item-left"><div class="s-icon" style="background:#0284c7;">💬</div><span class="s-title">Notifications & Quick Settings</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

          <!-- Group 4: Privacy & Safety -->
          <div class="settings-card">
            <div class="settings-item" onclick="alert('Security: Biometric & Passcode Protected')">
              <div class="item-left"><div class="s-icon" style="background:#2563eb;">🛡️</div><span class="s-title">Security and privacy</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Emergency SOS Active')">
              <div class="item-left"><div class="s-icon" style="background:#dc2626;">🆘</div><span class="s-title">Safety & emergency</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Location: System GPS enabled')">
              <div class="item-left"><div class="s-icon" style="background:#eab308;">📍</div><span class="s-title">Location</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Screen time: 3h 15m today')">
              <div class="item-left"><div class="s-icon" style="background:#0ea5e9;">👤</div><span class="s-title">Digital Wellbeing & parental controls</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

          <!-- Group 5: Apps & Battery -->
          <div class="settings-card">
            <div class="settings-item" onclick="alert('Installed Apps: 28')">
              <div class="item-left"><div class="s-icon" style="background:#16a34a;">🎛️</div><span class="s-title">Apps</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Battery: 100% - Good condition')">
              <div class="item-left"><div class="s-icon" style="background:#22c55e;">🔋</div><span class="s-title">Battery</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Accessibility: Gestures Active')">
              <div class="item-left"><div class="s-icon" style="background:#ea580c;">🚶</div><span class="s-title">Accessibility & convenience</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

          <!-- Group 6: System & Device Info -->
          <div class="settings-card">
            <div class="settings-item" onclick="alert('System: Nexus OS 2.0 (Up to date)')">
              <div class="item-left"><div class="s-icon" style="background:#64748b;">⚙️</div><span class="s-title">System & update</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="openAboutDevice()">
              <div class="item-left"><div class="s-icon" style="background:#16a34a;">📱</div><span class="s-title">About device</span></div>
              <div class="item-right"><span>Nexus Alpha</span><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Account: Primary User')">
              <div class="item-left"><div class="s-icon" style="background:#2563eb;">👥</div><span class="s-title">Users & accounts</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Google Play Services Connected')">
              <div class="item-left"><div class="s-icon" style="background:#0284c7;">G</div><span class="s-title">Google</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('realme Lab: DC Dimming Active')">
              <div class="item-left"><div class="s-icon" style="background:#0284c7;">⚗️</div><span class="s-title">realme Lab</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
            <div class="settings-item" onclick="alert('Help & Feedback Online')">
              <div class="item-left"><div class="s-icon" style="background:#ea580c;">📖</div><span class="s-title">Help & feedback</span></div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

        </div>
      `;
      break;

    case 'camera':
      title.innerText = "Camera";
      content.innerHTML = `
        <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between;">
          <div class="camera-view" style="position:relative; width:100%; height:62vh; background:#000; border-radius:24px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
            <video id="cam-feed" autoplay playsinline muted style="width:100%; height:100%; object-fit:cover;"></video>
            <div id="cam-flash" style="position:absolute; inset:0; background:white; opacity:0; pointer-events:none; transition:opacity 0.15s;"></div>
          </div>
          <canvas id="cam-canvas" style="display:none;"></canvas>
          <div style="display:flex; justify-content:space-around; align-items:center; padding:16px 10px;">
            <img id="cam-thumb" style="width:52px; height:52px; border-radius:14px; object-fit:cover; border:2px solid rgba(255,255,255,0.2); background:#1e293b;" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='52' height='52' fill='%23334155'><rect width='52' height='52'/></svg>">
            <button onclick="takePhoto()" style="width:72px; height:72px; border-radius:50%; border:4px solid #fff; background:transparent; padding:3px; cursor:pointer; outline:none;">
              <div style="width:100%; height:100%; background:#fff; border-radius:50%;"></div>
            </button>
            <button onclick="flipCamera()" style="width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; font-size:22px; cursor:pointer;">
              🔄
            </button>
          </div>
        </div>
      `;
      startCameraFeed();
      break;

    case 'dialer':
    case 'phone':
      title.innerText = "Phone";
      dialPadStr = '';
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

    case 'calc':
      title.innerText = "Calculator";
      calcBuffer = '';
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

    default:
      title.innerText = appName.toUpperCase();
      content.innerHTML = `<div style="text-align:center; margin-top:40px; color:#94a3b8;">${appName} app content goes here.</div>`;
  }
}

function closeApp() {
  const win = document.getElementById('app-window');
  if (win) win.classList.remove('window-active');
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  if (swTimer) clearInterval(swTimer);
  isSwRunning = false;
}

// 7. Camera Functions
async function startCameraFeed() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode }
    });
    const video = document.getElementById('cam-feed');
    if (video) video.srcObject = mediaStream;
  } catch (err) {
    alert("Camera permission allow karein ya secure HTTPS connection par check karein.");
  }
}

function flipCamera() {
  currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
  startCameraFeed();
}

function takePhoto() {
  const video = document.getElementById('cam-feed');
  const canvas = document.getElementById('cam-canvas');
  const thumb = document.getElementById('cam-thumb');
  const flash = document.getElementById('cam-flash');

  if (video && canvas) {
    if (flash) {
      flash.style.opacity = '0.9';
      setTimeout(() => { flash.style.opacity = '0'; }, 120);
    }

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    
    if (currentFacingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL('image/png');
    if (thumb) thumb.src = imgData;
  }
}

// 8. Dialer Functions
function dialDigit(d) {
  dialPadStr += d;
  const numDisplay = document.getElementById('dial-number');
  if (numDisplay) numDisplay.innerText = dialPadStr;
}

function dialClear() {
  dialPadStr = dialPadStr.slice(0, -1);
  const numDisplay = document.getElementById('dial-number');
  if (numDisplay) numDisplay.innerText = dialPadStr;
}

function startCall() {
  if (dialPadStr.length > 0) {
    window.location.href = `tel:${dialPadStr}`;
  }
}

// 9. About Device Page
function openAboutDevice() {
  const content = document.getElementById('window-content');
  const title = document.getElemen
