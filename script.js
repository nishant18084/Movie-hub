// Auto/Tap Fullscreen Trigger
function launchFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

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

// 2. Search Filter
function filterApps() {
  const q = document.getElementById('app-search').value.toLowerCase();
  document.querySelectorAll('#home-grid .app-item').forEach(item => {
    const label = item.querySelector('.label').innerText.toLowerCase();
    item.style.display = label.includes(q) ? 'flex' : 'none';
  });
}

// 3. App Window Manager
function openApp(appName) {
  const win = document.getElementById('app-window');
  const title = document.getElementById('window-title');
  const content = document.getElementById('window-content');
  if (!win || !title || !content) return;

  win.style.display = 'flex';

  if (appName === 'photos') {
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
  } else if (appName === 'settings') {
    title.innerText = "Settings";
    content.innerHTML = `
      <div class="settings-container">
        <div class="settings-card">
          <div class="settings-item">
            <div class="item-left"><div class="s-icon" style="background:#f59e0b;">✈️</div><span class="s-title">Aeroplane mode</span></div>
            <label class="switch"><input type="checkbox"><span class="slider"></span></label>
          </div>
          <div class="settings-item" onclick="alert('Wi-Fi is scanning...')">
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
        </div>

        <div class="settings-card">
          <div class="settings-item" onclick="alert('Display: Dark Mode Active | 120Hz')">
            <div class="item-left"><div class="s-icon" style="background:#eab308;">☀️</div><span class="s-title">Display & brightness</span></div>
            <div class="item-right"><span class="arrow">›</span></div>
          </div>
          <div class="settings-item" onclick="alert('Sound: Normal Mode')">
            <div class="item-left"><div class="s-icon" style="background:#22c55e;">🔔</div><span class="s-title">Sound & vibration</span></div>
            <div class="item-right"><span class="arrow">›</span></div>
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
  } else if (appName === 'camera') {
    title.innerText = "Camera";
    const lastThumb = localStorage.getItem('nexus_last_photo') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" fill="%23334155"><rect width="52" height="52"/></svg>';
    content.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between;">
        <div style="position:relative; width:100%; height:62vh; background:#000; border-radius:24px; overflow:hidden;">
          <video id="cam-feed" autoplay playsinline muted style="width:100%; height:100%; object-fit:cover;"></video>
          <div id="cam-flash" style="position:absolute; inset:0; background:white; opacity:0; pointer-events:none; transition:opacity 0.15s;"></div>
        </div>
        <canvas id="cam-canvas" style="display:none;"></canvas>
        <div style="display:flex; justify-content:space-around; align-items:center; padding:16px 10px;">
          <img id="cam-thumb" onclick="openApp('photos')" style="width:52px; height:52px; border-radius:14px; object-fit:cover; border:2px solid rgba(255,255,255,0.2); background:#1e293b; cursor:pointer;" src="${lastThumb}">
          <button onclick="takePhoto()" style="width:72px; height:72px; border-radius:50%; border:4px solid #fff; background:transparent; padding:3px; cursor:pointer;">
            <div style="width:100%; height:100%; background:#fff; border-radius:50%;"></div>
          </button>
          <button onclick="flipCamera()" style="width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; font-size:22px; cursor:pointer;">🔄</button>
        </div>
      </div>
    `;
    startCameraFeed();
  } else if (appName === 'dialer') {
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
        <div class="dial-btn" onclick="if(dialPadStr) window.location.href='tel:'+dialPadStr" style="background:#22c55e;">📞</div>
        <div></div>
      </div>
    `;
  } else if (appName === 'calc') {
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
  } else if (appName === 'notes') {
    title.innerText = "Quick Notes";
    const saved = localStorage.getItem('nexus_notes') || '';
    content.innerHTML = `
      <textarea oninput="localStorage.setItem('nexus_notes', this.value)" style="width:100%; height:70vh; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px; color:#fff; font-size:16px; outline:none; resize:none;" placeholder="Start typing...">${saved}</textarea>
    `;
  } else if (appName === 'weather') {
    title.innerText = "Weather";
    content.innerHTML = `
      <div style="text-align:center; padding:30px 0;">
        <h2 style="font-size:36px; margin-bottom:4px;">29°C</h2>
        <p style="color:#38bdf8; font-size:18px;">Partly Cloudy</p>
        <p style="color:#94a3b8; margin-top:8px;">Humidity: 65% • Wind: 12 km/h</p>
      </div>
    `;
  } else if (appName === 'watch') {
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
  }
}

function closeApp() {
  const win = document.getElementById('app-window');
  if (win) win.style.display = 'none';
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
  if (swTimer) clearInterval(swTimer);
  isSwRunning = false;
}

// 4. Camera Actions
function startCameraFeed() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode } })
      .then(stream => {
        mediaStream = stream;
        const v = document.getElementById('cam-feed');
        if (v) v.srcObject = stream;
      })
      .catch(() => alert("Camera permission allow karein."));
  }
}

function flipCamera() {
  currentFacingMode = (currentFacingMode === "environment") ? "user" : "environment";
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
  }
  startCameraFeed();
}

function takePhoto() {
  const v = document.getElementById('cam-feed');
  const c = document.getElementById('cam-canvas');
  const t = document.getElementById('cam-thumb');
  const f = document.getElementById('cam-flash');
  if (v && c) {
    if (f) { f.style.opacity = '0.9'; setTimeout(() => f.style.opacity = '0', 120); }
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext('2d');
    if (currentFacingMode === "user") { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const imgData = c.toDataURL('image/png');
    
    // Save to localStorage for Photos app
    localStorage.setItem('nexus_last_photo', imgData);
    if (t) t.src = imgData;
  }
}

// 5. Dialer
function dialDigit(d) {
  dialPadStr += d;
  const el = document.getElementById('dial-number');
  if (el) el.innerText = dialPadStr;
}
function dialClear() {
  dialPadStr = dialPadStr.slice(0, -1);
  const el = document.getElementById('dial-number');
  if (el) el.innerText = dialPadStr;
}

// 6. About Device
function openAboutDevice() {
  const c = document.getElementById('window-content');
  document.getElementById('window-title').innerText = "About device";
  c.innerHTML = `
    <div class="settings-container">
      <div class="settings-card">
        <div class="settings-item"><span class="s-title">Device name</span><span class="item-right" style="color:#38bdf8; font-weight:600;">Nexus Alpha</span></div>
        <div class="settings-item"><span class="s-title">Processor</span><span class="item-right">MediaTek Dimensity 7400</span></div>
        <div class="settings-item"><span class="s-title">RAM</span><span class="item-right">8.00 GB</span></div>
        <div class="settings-item"><span class="s-title">Storage</span><span class="item-right">128 GB</span></div>
      </div>
      <button onclick="openApp('settings')" class="calc-btn action" style="width:100%; margin-top:10px;">← Back to Settings</button>
    </div>
  `;
}

// 7. Calculator Engine
function calcAction(val) {
  const d = document.getElementById('calc-display');
  if (!d) return;
  if (val === 'C') {
    calcBuffer = '';
    d.innerText = '0';
  } else if (val === 'DEL') {
    calcBuffer = calcBuffer.slice(0, -1);
    d.innerText = calcBuffer || '0';
  } else if (val === '=') {
    try {
      calcBuffer = String(eval(calcBuffer));
      d.innerText = calcBuffer;
    } catch {
      d.innerText = 'Error';
      calcBuffer = '';
    }
  } else {
    calcBuffer += val;
    d.innerText = calcBuffer;
  }
}

// 8. Stopwatch
function toggleSw() {
  const b = document.getElementById('sw-btn');
  if (!isSwRunning) {
    const start = Date.now() - swElapsed;
    swTimer = setInterval(() => {
      swElapsed = Date.now() - start;
      const m = Math.floor(swElapsed / 60000);
      const s = Math.floor((swElapsed % 60000) / 1000);
      const ms = Math.floor((swElapsed % 1000) / 10);
      const d = document.getElementById('sw-display');
      if (d) d.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }, 10);
    if (b) { b.innerText = 'Stop'; b.style.background = '#ef4444'; }
    isSwRunning = true;
  } else {
    clearInterval(swTimer);
    if (b) { b.innerText = 'Start'; b.style.background = '#22c55e'; }
    isSwRunning = false;
  }
}

function resetSw() {
  clearInterval(swTimer);
  swElapsed = 0;
  isSwRunning = false;
  const d = document.getElementById('sw-display');
  const b = document.getElementById('sw-btn');
  if (d) d.innerText = '00:00.00';
  if (b) { b.innerText = 'Start'; b.style.background = '#22c55e'; }
}
