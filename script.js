// Clock Engine
function syncTime() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const timeStr = h + ':' + m;
  const dateStr = days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];

  const elTop = document.getElementById('top-time');
  const elClock = document.getElementById('main-clock');
  const elDate = document.getElementById('main-date');
  const elLockClock = document.getElementById('lock-big-clock');
  const elLockDate = document.getElementById('lock-date-display');
  const elLockTop = document.getElementById('lock-status-time');

  if (elTop) elTop.innerText = timeStr;
  if (elClock) elClock.innerText = timeStr;
  if (elDate) elDate.innerText = dateStr;
  if (elLockClock) elLockClock.innerText = timeStr;
  if (elLockDate) elLockDate.innerText = dateStr;
  if (elLockTop) elLockTop.innerText = timeStr;
}
syncTime();
setInterval(syncTime, 1000);

let calcBuffer = '';
let dialPadStr = '';
let mediaStream = null;

// Load Wallpaper on Start
window.addEventListener('DOMContentLoaded', () => {
  const savedWp = localStorage.getItem('nexus_wallpaper');
  if (savedWp) {
    document.body.style.backgroundImage = `url(${savedWp})`;
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) lockScreen.style.backgroundImage = `url(${savedWp})`;
  }
});

// Unlock Screen
function unlockDevice() {
  const ls = document.getElementById('lock-screen');
  if (ls) {
    ls.style.transform = 'translateY(-100%)';
    ls.style.opacity = '0';
    setTimeout(() => { ls.style.display = 'none'; }, 350);
  }
}

function lockDeviceNow() {
  const ls = document.getElementById('lock-screen');
  if (ls) {
    ls.style.display = 'flex';
    setTimeout(() => {
      ls.style.transform = 'translateY(0)';
      ls.style.opacity = '1';
    }, 10);
  }
  closeApp();
}

// Power Options
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

// Wallpaper Handler (Home & Lock Screen Both)
function setSystemWallpaper(url) {
  document.body.style.backgroundImage = `url(${url})`;
  const lockScreen = document.getElementById('lock-screen');
  if (lockScreen) lockScreen.style.backgroundImage = `url(${url})`;
  localStorage.setItem('nexus_wallpaper', url);
  alert('Wallpaper applied to Home Screen & Lock Screen!');
  openApp('settings');
}

function handleCustomWallpaperUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => setSystemWallpaper(e.target.result);
    reader.readAsDataURL(file);
  }
}

// Open App Manager
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
          <button onclick="takeSnapshotPhoto()" style="width:72px; height:72px; border-radius:50%; border:4px solid #fff; background:transparent; padding:4px; cursor:pointer;"><div style="width:100%; height:100%; background:#fff; border-radius:50%;"></div></button>
          <button onclick="startCamera()" style="width:50px; height:50px; border-radius:50%; background:#222; border:1px solid #444; color:#fff; font-size:20px; cursor:pointer;">🔄</button>
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
    case 'settings':
      const isFull = !!document.fullscreenElement;
      body.innerHTML = `
        <div class="card">
          <h4 style="color:#38bdf8; margin-bottom:8px;">Display & Wallpaper</h4>
          <div class="card-item" onclick="toggleFullscreenMode()">
            <div><b>Full Screen Mode</b><p style="font-size:12px; color:#94a3b8;">Immersive view</p></div>
            <span style="color:#38bdf8; font-weight:bold;">${isFull ? 'ON' : 'OFF'} ›</span>
          </div>
          <div style="padding:10px 0;">
            <b>Set Wallpaper (Home & Lock Screen)</b>
            <div style="display:flex; gap:8px; margin-top:8px;">
              <button onclick="setSystemWallpaper('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800')" class="calc-btn action" style="flex:1; font-size:12px; padding:8px;">Cyber</button>
              <button onclick="setSystemWallpaper('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800')" class="calc-btn action" style="flex:1; font-size:12px; padding:8px;">Nature</button>
              <button onclick="setSystemWallpaper('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800')" class="calc-btn action" style="flex:1; font-size:12px; padding:8px;">Space</button>
            </div>
            <label style="display:block; margin-top:8px; text-align:center; background:#334155; padding:10px; border-radius:12px; cursor:pointer; font-size:13px;">
              📁 Upload Photo from Phone
              <input type="file" accept="image/*" style="display:none;" onchange="handleCustomWallpaperUpload(event)">
            </label>
          </div>
        </div>

        <div class="card">
          <h4 style="color:#38bdf8; margin-bottom:8px;">Lock Screen</h4>
          <div class="card-item" onclick="lockDeviceNow()">
            <div><b>Lock Device Now</b><p style="font-size:12px; color:#94a3b8;">Show Big Clock Lock Screen</p></div>
            <span style="color:#f59e0b; font-weight:bold;">Lock 🔒 ›</span>
          </div>
        </div>

        <div class="card">
          <div class="card-item" onclick="showPowerMenu()">
            <div><b style="color:#ef4444;">Power & Restart Options</b><p style="font-size:12px; color:#94a3b8;">Reboot or shut down</p></div>
            <span style="color:#ef4444; font-weight:bold;">Menu ›</span>
          </div>
        </div>
      `;
      break;

    case 'photos':
      const savedPhoto = localStorage.getItem('nexus_last_photo');
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <h3 style="font-size:15px; color:#94a3b8;">Saved Photos</h3>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
            ${savedPhoto ? `
              <div style="position:relative; aspect-ratio:1; border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.2);">
                <img src="${savedPhoto}" style="width:100%; height:100%; object-fit:cover;">
              </div>
            ` : '<p style="color:#64748b; grid-column:span 3; text-align:center; padding:40px 0;">No photos clicked yet.<br>Open Camera to take photos!</p>'}
          </div>
          ${savedPhoto ? `<button onclick="localStorage.removeItem('nexus_last_photo'); openApp('photos')" class="calc-btn action" style="padding:12px; font-size:13px; border-radius:16px;">Clear Gallery</button>` : ''}
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
      body.innerHTML = `<textarea oninput="localStorage.setItem('nexus_notes', this.value)" style="width:100%; height:60vh; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:16px; color:#fff; font-size:16px; resize:none;" placeholder="Write notes...">${savedNotes}</textarea>`;
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

function takeSnapshotPhoto() {
  const v = document.getElementById('cam-feed-view');
  const c = document.getElementById('cam-canvas-snap');
  if (v && c) {
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext('2d');
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const data = c.toDataURL('image/png');
    localStorage.setItem('nexus_last_photo', data);
    alert('Photo saved to Photos app!');
  }
}

function calcKey(k) {
  const v = document.getElementById('calc-view');
  if (k === 'C') { calcBuffer = ''; v.innerText = '0'; }
  else if (k === 'DEL') { calcBuffer = calcBuffer.slice(0, -1); v.innerText = calcBuffer || '0'; }
  else if (k === '=') { try { calcBuffer = String(eval(calcBuffer)); v.innerText = calcBuffer; } catch(e) { v.innerText = 'Error'; calcBuffer = ''; } }
  else { calcBuffer += k; v.innerText = calcBuffer; }
}
