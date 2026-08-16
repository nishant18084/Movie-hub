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
let mediaStream = null;

function openApp(name) {
  const modal = document.getElementById('app-modal');
  const hdr = document.getElementById('modal-hdr');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  modal.style.display = 'flex';
  hdr.style.display = 'flex';
  title.innerText = name.toUpperCase();

  switch(name) {
    case 'files':
      body.innerHTML = `
        <div class="card">
          <h4 style="color:#38bdf8;">Storage</h4>
          <p style="color:#94a3b8; font-size:12px; margin-top:4px;">42 GB / 128 GB Used</p>
          <div style="width:100%; height:6px; background:#222; border-radius:3px; margin-top:8px; overflow:hidden;">
            <div style="width:33%; height:100%; background:#22c55e;"></div>
          </div>
        </div>
        <div class="card">
          <div class="card-item"><span>📄 Documents</span><span style="color:#94a3b8;">24 files ›</span></div>
          <div class="card-item" onclick="openApp('photos')"><span>🖼️ Gallery</span><span style="color:#94a3b8;">186 photos ›</span></div>
          <div class="card-item"><span>⬇️ Downloads</span><span style="color:#94a3b8;">12 files ›</span></div>
          <div class="card-item"><span>🎵 Audio</span><span style="color:#94a3b8;">8 tracks ›</span></div>
        </div>
      `;
      break;

    case 'drivers':
      body.innerHTML = `
        <div class="card">
          <h4 style="color:#38bdf8;">Hardware Status</h4>
          <p style="font-size:12px; color:#94a3b8; margin-top:4px;">Kernel 5.10 Active</p>
        </div>
        <div class="card">
          <div class="card-item"><span>📷 Camera Sensor</span><b style="color:#22c55e;">Online</b></div>
          <div class="card-item"><span>🎙️ Audio Driver</span><b style="color:#22c55e;">48kHz Ready</b></div>
          <div class="card-item"><span>⚡ GPU Pipeline</span><b style="color:#22c55e;">120Hz Native</b></div>
          <div class="card-item"><span>📶 5G Modem</span><b style="color:#22c55e;">Connected</b></div>
        </div>
      `;
      break;

    case 'calc':
      calcBuffer = '';
      body.innerHTML = `
        <div class="calc-screen" id="calc-view">0</div>
        <div class="calc-grid">
          <button class="calc-btn" onclick="calcKey('C')">C</button>
          <button class="calc-btn" onclick="calcKey('DEL')">⌫</button>
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
        </div>
      `;
      break;

    case 'notes':
      const saved = localStorage.getItem('nexus_notes') || '';
      body.innerHTML = `<textarea oninput="localStorage.setItem('nexus_notes', this.value)" style="width:100%; height:60vh; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px; color:#fff; font-size:16px; resize:none;" placeholder="Type notes...">${saved}</textarea>`;
      break;

    case 'camera':
      body.innerHTML = `
        <div style="width:100%; height:55vh; background:#000; border-radius:18px; display:flex; align-items:center; justify-content:center; color:#94a3b8; border:1px solid rgba(255,255,255,0.1);">
          📷 Camera Viewfinder Active
        </div>
        <div style="text-align:center; margin-top:20px;">
          <button onclick="alert('Photo Captured!')" style="width:65px; height:65px; border-radius:50%; border:4px solid #fff; background:#fff; cursor:pointer;"></button>
        </div>
      `;
      break;

    case 'settings':
      body.innerHTML = `
        <div class="card">
          <div class="card-item"><span>Device Name</span><b style="color:#38bdf8;">Nexus Alpha</b></div>
          <div class="card-item"><span>Processor</span><b>MediaTek Dimensity 7400</b></div>
          <div class="card-item"><span>RAM</span><b>8.00 GB</b></div>
          <div class="card-item"><span>Storage</span><b>128 GB</b></div>
        </div>
      `;
      break;

    default:
      body.innerHTML = `
        <div style="text-align:center; padding:60px 0;">
          <h2>${name}</h2>
          <p style="color:#94a3b8; margin-top:8px;">Running smoothly on Nexus OS.</p>
        </div>
      `;
  }
}

function closeApp() {
  document.getElementById('app-modal').style.display = 'none';
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
}

function calcKey(k) {
  const v = document.getElementById('calc-view');
  if (k === 'C') { calcBuffer = ''; v.innerText = '0'; }
  else if (k === 'DEL') { calcBuffer = calcBuffer.slice(0, -1); v.innerText = calcBuffer || '0'; }
  else if (k === '=') { try { calcBuffer = String(eval(calcBuffer)); v.innerText = calcBuffer; } catch(e) { v.innerText = 'Error'; calcBuffer = ''; } }
  else { calcBuffer += k; v.innerText = calcBuffer; }
}
