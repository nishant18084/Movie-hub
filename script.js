// 1. Clock Engine
function renderTime() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const tStr = `${h}:${m}`;
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dStr = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;

  const st = document.getElementById('live-status-time');
  const lc = document.getElementById('live-clock');
  const ld = document.getElementById('live-date');

  if (st) st.innerText = tStr;
  if (lc) lc.innerText = tStr;
  if (ld) ld.innerText = dStr;
}
renderTime();
setInterval(renderTime, 1000);

let mediaStream = null;
let currentFacingMode = "environment";
let calcBuffer = '';
let dialPadStr = '';
let swTimer = null, swElapsed = 0, isSwRunning = false;
let isPlaying = false;
let board = Array(9).fill(null), gameActive = true;
let paintCtx, isDrawing = false, paintColor = '#38bdf8';

// Active Task Stack
let activeTasks = [];
let navMode = localStorage.getItem('nexus_nav_mode') || 'buttons';
let navLayout = localStorage.getItem('nexus_nav_layout') || 'right_back';

// Camera States
let currentCamMode = 'PHOTO';
let currentZoom = 1;

// 2. Navigation Functions
function renderNavButtons() {
  const btnBar = document.getElementById('nav-buttons-bar');
  if (!btnBar) return;

  if (navLayout === 'right_back') {
    btnBar.innerHTML = `
      <div class="nav-btn" onclick="navRecents()">⏹</div>
      <div class="nav-btn" onclick="navHome()">⚪</div>
      <div class="nav-btn" onclick="navBack()">◀</div>
    `;
  } else {
    btnBar.innerHTML = `
      <div class="nav-btn" onclick="navBack()">◀</div>
      <div class="nav-btn" onclick="navHome()">⚪</div>
      <div class="nav-btn" onclick="navRecents()">⏹</div>
    `;
  }
}

function applyNavMode(mode) {
  navMode = mode;
  localStorage.setItem('nexus_nav_mode', mode);

  const btnBar = document.getElementById('nav-buttons-bar');
  const gestBar = document.getElementById('nav-gesture-bar');
  const dock = document.getElementById('main-dock');
  const appWin = document.getElementById('app-window');
  const recents = document.getElementById('recents-modal');
  const osRoot = document.getElementById('os-container');

  if (mode === 'gestures') {
    if (btnBar) btnBar.style.display = 'none';
    if (gestBar) gestBar.style.display = 'flex';
    if (dock) dock.style.bottom = '26px';
    if (appWin) appWin.style.bottom = '24px';
    if (recents) recents.style.bottom = '24px';
    if (osRoot) osRoot.style.height = 'calc(100dvh - 105px)';
  } else {
    renderNavButtons();
    if (btnBar) btnBar.style.display = 'flex';
    if (gestBar) gestBar.style.display = 'none';
    if (dock) dock.style.bottom = '50px';
    if (appWin) appWin.style.bottom = '44px';
    if (recents) recents.style.bottom = '44px';
    if (osRoot) osRoot.style.height = 'calc(100dvh - 130px)';
  }
}

function setNavLayout(layout) {
  navLayout = layout;
  localStorage.setItem('nexus_nav_layout', layout);
  renderNavButtons();
}

setTimeout(() => applyNavMode(navMode), 50);

// Search Filter
function filterApps() {
  const q = document.getElementById('app-search').value.toLowerCase();
  document.querySelectorAll('#home-grid .app-item').forEach(item => {
    const label = item.querySelector('.label').innerText.toLowerCase();
    item.style.display = label.includes(q) ? 'flex' : 'none';
  });
}

// Navigation Actions
function navBack() {
  const recents = document.getElementById('recents-modal');
  const win = document.getElementById('app-window');
  if (recents && recents.style.display === 'flex') {
    recents.style.display = 'none';
  } else if (win && win.style.display === 'flex') {
    closeApp();
  }
}

function navHome() {
  const recents = document.getElementById('recents-modal');
  const win = document.getElementById('app-window');
  if (recents) recents.style.display = 'none';
  if (win) closeApp();
  const container = document.getElementById('os-container');
  if (container) container.scrollTo({ left: 0, behavior: 'smooth' });
}

function navRecents() {
  const recents = document.getElementById('recents-modal');
  const list = document.getElementById('task-list');
  if (!recents || !list) return;

  if (recents.style.display === 'flex') {
    recents.style.display = 'none';
    return;
  }

  list.innerHTML = '';
  if (activeTasks.length === 0) {
    list.innerHTML = '<p style="color:#64748b; padding:40px 0;">No active background apps.</p>';
  } else {
    activeTasks.forEach((app, idx) => {
      list.innerHTML += `
        <div class="task-card" onclick="openApp('${app}'); document.getElementById('recents-modal').style.display='none';">
          <h4>${app.toUpperCase()}</h4>
          <p style="color:#94a3b8; font-size:12px;">Active in background</p>
          <button class="clear-task-btn" style="background:#334155;" onclick="event.stopPropagation(); removeTask(${idx})">Close</button>
        </div>
      `;
    });
  }
  recents.style.display = 'flex';
}

function removeTask(idx) {
  activeTasks.splice(idx, 1);
  navRecents();
}

function clearAllTasks() {
  activeTasks = [];
  navRecents();
  closeApp();
}

// 3. App Opener
function openApp(appName) {
  const win = document.getElementById('app-window');
  const winHdr = document.getElementById('win-hdr');
  const title = document.getElementById('window-title');
  const content = document.getElementById('window-content');
  if (!win || !title || !content) return;

  if (!activeTasks.includes(appName)) {
    activeTasks.push(appName);
  }

  win.style.display = 'flex';

  if (appName === 'camera') {
    winHdr.style.display = 'none';
    content.style.padding = '0';
    const lastThumb = localStorage.getItem('nexus_last_photo') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" fill="%23334155"><rect width="52" height="52"/></svg>';
    content.innerHTML = `
      <div class="cam-wrapper">
        <!-- Top Toolbar -->
        <div class="cam-top-bar">
          <button class="cam-top-btn" onclick="toggleFlash(this)">⚡</button>
          <button class="cam-top-btn" onclick="alert('HDR: Auto Active')">HDR</button>
          <button class="cam-top-btn" onclick="alert('Google Lens Scanner...')">⛶</button>
          <button class="cam-top-btn" onclick="closeApp()">✕</button>
        </div>

        <!-- Viewfinder -->
        <div class="cam-viewfinder">
          <video id="cam-feed" autoplay playsinline muted></video>
          <div id="cam-flash-effect" style="position:absolute; inset:0; background:white; opacity:0; pointer-events:none; transition:opacity 0.12s;"></div>

          <!-- Side Icons -->
          <div class="cam-side-controls">
            <div class="cam-circle-icon" onclick="toggleCamFilter()">🔘</div>
            <div class="cam-circle-icon" onclick="alert('Retouch / Beauty: AI 50%')">✨</div>
          </div>

          <!-- Zoom 1x / 2x -->
          <div class="cam-zoom-bar">
            <button class="cam-zoom-btn active" id="z1-btn" onclick="setZoom(1)">1x</button>
            <button class="cam-zoom-btn" id="z2-btn" onclick="setZoom(2)">2</button>
          </div>
        </div>

        <!-- MORE Fullscreen Panel -->
        <div class="cam-more-panel" id="cam-more-screen">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="font-size:16px;">More Modes</h3>
            <button onclick="setCamMode('PHOTO')" style="background:transparent; border:none; color:var(--yellow); font-size:18px; cursor:pointer;">✕</button>
          </div>
          <div class="more-grid">
            <div class="more-item" onclick="selectMoreMode('PRO')"><div class="more-icon-box">PRO</div><span class="more-label">PRO</span></div>
            <div class="more-item" onclick="selectMoreMode('PANO')"><div class="more-icon-box">🖼️</div><span class="more-label">PANO</span></div>
            <div class="more-item" onclick="selectMoreMode('HI-RES')"><div class="more-icon-box">⊞</div><span class="more-label">HI-RES</span></div>
            <div class="more-item" onclick="selectMoreMode('FILM')"><div class="more-icon-box">🎬</div><span class="more-label">FILM</span></div>
            <div class="more-item" onclick="selectMoreMode('SLO-MO')"><div class="more-icon-box">⏳</div><span class="more-label">SLO-MO</span></div>
            <div class="more-item" onclick="selectMoreMode('TIME-LAPSE')"><div class="more-icon-box">⏱️</div><span class="more-label">TIME-LAPSE</span></div>
            <div class="more-item" onclick="selectMoreMode('DUAL-VIEW')"><div class="more-icon-box">📱</div><span class="more-label">DUAL-VIEW</span></div>
            <div class="more-item" onclick="selectMoreMode('UNDERWATER')"><div class="more-icon-box">🌊</div><span class="more-label">UNDERWATER</span></div>
            <div class="more-item" onclick="selectMoreMode('SCANNER')"><div class="more-icon-box">📄</div><span class="more-label">TEXT SCANNER</span></div>
            <div class="more-item" onclick="selectMoreMode('TILT-SHIFT')"><div class="more-icon-box">🔄</div><span class="more-label">TILT-SHIFT</span></div>
          </div>
        </div>

        <!-- Mode Slider -->
        <div class="cam-mode-slider">
          <span class="cam-mode-item" onclick="setCamMode('STREET')">STREET</span>
          <span class="cam-mode-item" onclick="setCamMode('VIDEO')">VIDEO</span>
          <span class="cam-mode-item active" id="mode-photo" onclick="setCamMode('PHOTO')">PHOTO</span>
          <span class="cam-mode-item" onclick="setCamMode('PORTRAIT')">PORTRAIT</span>
          <span class="cam-mode-item" onclick="setCamMode('MORE')">MORE</span>
        </div>

        <!-- Bottom Shutter & Controls -->
        <div class="cam-bottom-controls">
          <img id="cam-thumb" onclick="openApp('photos')" class="cam-thumb-box" src="${lastThumb}">
          <button onclick="takePhoto()" class="cam-shutter-ring">
            <div class="cam-shutter-fill"></div>
          </button>
          <button onclick="flipCamera()" class="cam-flip-btn">🔄</button>
        </div>
      </div>
      <canvas id="cam-canvas" style="display:none;"></canvas>
    `;
    startCameraFeed();
    return;
  }

  // Standard Header for Other Apps
  winHdr.style.display = 'flex';
  content.style.padding = '18px';

  switch(appName) {
    case 'files':
      title.innerText = "Files";
      content.innerHTML = `
        <div class="settings-container">
          <div class="settings-card" style="padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <h4 style="font-size:15px; font-weight:600;">Device Storage</h4>
              <span style="font-size:12px; color:#38bdf8;">42 GB / 128 GB</span>
            </div>
            <div style="width:100%; height:8px; background:#1e293b; border-radius:4px; overflow:hidden; margin-bottom:12px;">
              <div style="width:33%; height:100%; background:linear-gradient(90deg, #38bdf8, #22c55e);"></div>
            </div>
            <p style="color:#94a3b8; font-size:12px;">86 GB Free Space Available</p>
          </div>

          <div class="settings-card">
            <div class="settings-item" onclick="openFileCategory('Documents')"><div class="item-left"><div class="s-icon" style="background:#0284c7;">📄</div><span class="s-title">Documents</span></div><span class="item-right">24 files ›</span></div>
            <div class="settings-item" onclick="openApp('photos')"><div class="item-left"><div class="s-icon" style="background:#a855f7;">🖼️</div><span class="s-title">Images & Gallery</span></div><span class="item-right">186 photos ›</span></div>
            <div class="settings-item" onclick="openFileCategory('Downloads')"><div class="item-left"><div class="s-icon" style="background:#22c55e;">⬇️</div><span class="s-title">Downloads</span></div><span class="item-right">12 files ›</span></div>
            <div class="settings-item" onclick="openFileCategory('Audio')"><div class="item-left"><div class="s-icon" style="background:#ec4899;">🎵</div><span class="s-title">Audio & Recordings</span></div><span class="item-right">8 tracks ›</span></div>
            <div class="settings-item" onclick="openFileCategory('APKs')"><div class="item-left"><div class="s-icon" style="background:#f59e0b;">📦</div><span class="s-title">Installation Packages (APK)</span></div><span class="item-right">3 files ›</span></div>
          </div>
        </div>
      `;
      break;

    case 'settings':
      title.innerText = "Settings";
      content.innerHTML = `
        <div class="settings-container">
          <div class="settings-card">
            <div class="settings-item" onclick="openNavSettings()">
              <div class="item-left">
                <div class="s-icon" style="background:#6366f1;">🧭</div>
                <div>
                  <div class="s-title">System Navigation</div>
                  <div style="font-size:11px; color:#94a3b8;">${navMode === 'buttons' ? (navLayout === 'right_back' ? 'Buttons (Back on Right)' : 'Buttons (Back on Left)') : 'Gesture Navigation'}</div>
                </div>
              </div>
              <span class="arrow">›</span>
            </div>
          </div>

          <div class="settings-card">
            <div class="settings-item">
              <div class="item-left"><div class="s-icon" style="background:#f59e0b;">✈️</div><span class="s-title">Aeroplane mode</span></div>
              <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            </div>
            <div class="settings-item" onclick="alert('Wi-Fi is scanning...')"><div class="item-left"><div class="s-icon" style="background:#0284c7;">📶</div><span class="s-title">Wi-Fi</span></div><span class="item-right">Off ›</span></div>
            <div class="settings-item" onclick="alert('Bluetooth scanning...')"><div class="item-left"><div class="s-icon" style="background:#2563eb;">ᛒ</div><span class="s-title">Bluetooth</span></div><span class="item-right">Off ›</span></div>
          </div>

          <div class="settings-card">
            <div class="settings-item" onclick="openAboutDevice()"><div class="item-left"><div class="s-icon" style="background:#16a34a;">📱</div><span class="s-title">About device</span></div><span class="item-right">Nexus Alpha ›</span></div>
          </div>
        </div>
      `;
      break;

    case 'photos':
      title.innerText = "Photos";
      const savedImg = localStorage.getItem('nexus_last_photo');
      content.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <h3 style="font-size:16px; color:#94a3b8;">Captured Photos</h3>
          <div id="gallery-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
            ${savedImg ? `
              <div style="position:relative; aspect-ratio:1; border-radius:14px; overflow:hidden; border:1px solid rgba(255,255,255,0.2);">
                <img src="${savedImg}" style="width:100%; height:100%; object-fit:cover;">
              </div>
            ` : '<p style="color:#64748b; grid-column:span 3; text-align:center; padding:40px 0;">No photos captured yet.<br>Open Camera to click photos!</p>'}
          </div>
        </div>
      `;
      break;

    case 'dialer':
      title.innerText = "Phone";
      dialPadStr = '';
      content.innerHTML = `
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
        <textarea oninput="localStorage.setItem('nexus_notes', this.value)" style="width:100%; height:70vh; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px; color:#fff; font-size:16px; outline:none; resize:none;" placeholder="Start typing...">${saved}</textarea>
      `;
      break;

    case 'paint':
      title.innerText = "Paint";
      content.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px; height:100%;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:8px;">
              <button onclick="setPaintColor('#38bdf8')" style="width:28px; height:28px; border-radius:50%; background:#38bdf8; border:none;"></button>
              <button onclick="setPaintColor('#22c55e')" style="width:28px; height:28px; border-radius:50%; background:#22c55e; border:none;"></button>
              <button onclick="setPaintColor('#ef4444')" style="width:28px; height:28px; border-radius:50%; background:#ef4444; border:none;"></button>
              <button onclick="setPaintColor('#ffffff')" style="width:28px; height:28px; border-radius:50%; background:#ffffff; border:none;"></button>
            </div>
            <button onclick="clearCanvas()" class="calc-btn action" style="padding:6px 12px; font-size:12px;">Clear</button>
          </div>
          <canvas id="paint-canvas" style="width:100%; height:62vh; background:#111827; border-radius:18px; b
