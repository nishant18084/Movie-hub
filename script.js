// Clock Engine
function syncTime() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const timeStr = h + ':' + m;
  const dateStr = days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();

  const elTop = document.getElementById('top-time');
  const elClock = document.getElementById('main-clock');
  const elDate = document.getElementById('main-date');
  if (elTop) elTop.innerText = timeStr;
  if (elClock) elClock.innerText = timeStr;
  if (elDate) elDate.innerText = dateStr;
}
syncTime();
setInterval(syncTime, 1000);

let calcBuffer = '';
let dialPadStr = '';
let mediaStream = null;

// Power Menu
function showPowerMenu() { document.getElementById('power-overlay').style.display = 'flex'; }
function hidePowerMenu() { document.getElementById('power-overlay').style.display = 'none'; }
function restartDevice() {
  hidePowerMenu();
  document.body.style.opacity = '0';
  setTimeout(() => window.location.reload(), 400);
}
function powerOffDevice() {
  hidePowerMenu();
  document.body.innerHTML = `
    <div style="height:100vh; background:#000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#475569;">
      <h2 style="font-size:20px; font-weight:600; margin-bottom:16px;">Nexus OS Powered Off</h2>
      <button onclick="window.location.reload()" style="background:#38bdf8; border:none; padding:12px 28px; border-radius:30px; font-weight:bold; color:#000; cursor:pointer;">Turn On Device</button>
    </div>
  `;
}

// Fullscreen API
function toggleFullscreenMode() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
  openApp('settings');
}

function openApp(name) {
  const modal = document.getElementById('app-modal');
  const hdr = document.getElementById('modal-hdr');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  modal.style.display = 'flex';
  title.innerText = name.toUpperCase();

  if (name === 'camera') {
    hdr.style.display = 'none';
    body.style.padding = '0';
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
          <div style="width:50px;"></div>
          <button onclick="alert('Photo Saved!')" style="width:72px; height:72px; border-radius:50%; border:4px solid #fff; background:transparent; padding:4px; cursor:pointer;"><div style="width:100%; height:100%; background:#fff; border-radius:50%;"></div></button>
          <button onclick="startCamera()" style="width:50px; height:50px; border-radius:50%; background:#222; border:1px solid #444; color:#fff; font-size:20px; cursor:pointer;">🔄</button>
        </div>
      </div>
    `;
    startCamera();
    return;
  }

  hdr.style.display = 'flex';
  body.style.padding = '18px';

  switch(name) {
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
              <p style="font-size:12px; color:#94a3b8;">Shutdown, reboot system</p>
            </div>
            <span style="color:#ef4444; font-weight:bold;">Menu ›</span>
          </div>
        </div>
        <div class="card">
          <div class="card-item"><span>Device Model</span><b style="color:#38bdf8;">Nexus Alpha</b></div>
          <div class="card-item"><span>OS Version</span><b style="color:#22c55e;">Android 15 / Realme UI 6.0</b></div>
          <div class="card-item"><span>Processor</span><b>MediaTek Dimensity 7400</b></div>
          <div class="card-item"><span>RAM</span><b>8.00 GB</b></div>
          <div class="card-item"><span>Storage</span><b>128 GB</b></div>
        </div>
      `;
      break;

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

    case 'notes':
      const savedNotes = localStorage.getItem('nexus_notes') || '';
      body.innerHTML = `<textarea oninput="localStorage.setItem('nexus_notes', this.value)" style="width:100%; height:60vh; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:16px; color:#fff; font-size:16px; resize:none;" placeholder="Write your notes here...">${savedNotes}</textarea>`;
      break;

    case 'files':
      body.innerHTML = `
        <div class="card">
          <h4 style="color:#38bdf8;">Storage Details</h4>
          <p style="font-size:12px; color:#94a3b8; margin-top:4px;">42 GB / 128 GB Used (86 GB Free)</p>
        </div>
        <div class="card">
          <div class="card-item"><span>📄 Documents</span><span>24 files ›</span></div>
          <div class="card-item" onclick="openApp('photos')"><span>🖼️ Images</span><span>186 photos ›</span></div>
          <div class="card-item"><span>⬇️ Downloads</span><span>12 files ›</span></div>
          <div class="card-item"><span>🎵 Audio Tracks</span><span>8 tracks ›</span></div>
        </div>
      `;
      break;

    case 'drivers':
      body.innerHTML = `
        <div class="card">
          <h4 style="color:#38bdf8;">Hardware Status</h4>
          <p style="font-size:12px; color:#94a3b8; margin-top:4px;">Kernel Drivers Active</p>
        </div>
        <div class="card">
          <div class="card-item"><span>📷 Camera Sensor</span><b style="color:#22c55e;">Sony IMX890 (Online)</b></div>
          <div class="card-item"><span>🎙️ Audio DAC</span><b style="color:#22c55e;">48kHz Hi-Res</b></div>
          <div class="card-item"><span>⚡ GPU Pipeline</span><b style="color:#22c55e;">120Hz Native</b></div>
          <div class="card-item"><span>📶 5G Modem</span><b style="color:#22c55e;">Connected</b></div>
        </div>
      `;
      break;

    default:
      body.innerHTML = `<div style="text-align:center; padding:50px 0;"><h2>${name}</h2><p style="color:#94a3b8; margin-top:8px;">Running smoothly on Nexus OS.</p></div>`;
  }
}

function closeApp() {
  document.getElementById('app-modal').style.display = 'none';
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
}

function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        mediaStream = stream;
        const v = document.getElementById('cam-feed-view');
        if (v) v.srcObject = stream;
      })
      .catch(() => {});
  }
}

function calcKey(k) {
  const v = document.getElementById('calc-view');
  if (k === 'C') { calcBuffer = ''; v.innerText = '0'; }
  else if (k === 'DEL') { calcBuffer = calcBuffer.slice(0, -1); v.innerText = calcBuffer || '0'; }
  else if (k === '=') { try { calcBuffer = String(eval(calcBuffer)); v.innerText = calcBuffer; } catch(e) { v.innerText = 'Error'; calcBuffer = ''; } }
  else { calcBuffer += k; v.innerText = calcBuffer; }
}
