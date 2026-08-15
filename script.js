// 1. Boot Screen & Animation Handling
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const boot = document.getElementById('boot-screen');
    const os = document.getElementById('main-os');
    boot.classList.add('boot-fadeout');
    os.classList.add('os-visible');
    setTimeout(() => boot.remove(), 800);
  }, 2500);
});

// 2. Real-time Status and Date
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  
  document.getElementById('live-status-time').innerText = timeStr;
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

// 4. App Drawer Management
function toggleDrawer() {
  const drawer = document.getElementById('app-drawer');
  drawer.classList.toggle('drawer-active');
}

// 5. Dynamic Search Filter
function filterApps() {
  const query = document.getElementById('app-search').value.toLowerCase();
  const appItems = document.querySelectorAll('#home-grid .app-item');
  
  appItems.forEach(item => {
    const label = item.querySelector('.label').innerText.toLowerCase();
    item.style.display = label.includes(query) ? 'flex' : 'none';
  });
}

// 6. Application Window & Logic Engine
function openApp(appName) {
  const win = document.getElementById('app-window');
  const title = document.getElementById('window-title');
  const content = document.getElementById('window-content');

  win.classList.add('window-active');

  switch(appName) {
    case 'settings':
      title.innerText = "Settings";
      content.innerHTML = `
        <div class="settings-group">
          <div class="setting-row">
            <span>Device Name</span>
            <strong style="color:#38bdf8;">Nexus Alpha</strong>
          </div>
          <div class="setting-row">
            <span>OS Version</span>
            <span>Nexus OS 2.0</span>
          </div>
          <div class="setting-row">
            <span>Storage</span>
            <span>128 GB Free</span>
          </div>
        </div>
        <div class="settings-group">
          <div class="setting-row">
            <span>Theme Accent</span>
            <button onclick="changeTheme('#38bdf8')" style="background:#38bdf8; width:24px; height:24px; border-radius:50%; border:none;"></button>
            <button onclick="changeTheme('#22c55e')" style="background:#22c55e; width:24px; height:24px; border-radius:50%; border:none;"></button>
            <button onclick="changeTheme('#f59e0b')" style="background:#f59e0b; width:24px; height:24px; border-radius:50%; border:none;"></button>
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
        <p style="color:#94a3b8; font-size:12px; margin-bottom:8px;">Auto-saves to browser storage:</p>
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
  document.getElementById('app-window').classList.remove('window-active');
  if (swTimer) clearInterval(swTimer);
  isSwRunning = false;
}

// 7. Calculator Engine
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

// 8. Notes Storage
function saveNote() {
  const val = document.getElementById('note-input').value;
  localStorage.setItem('nexus_notes', val);
}

// 9. Stopwatch Engine
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

// 10. Accent Theme Swatcher
function changeTheme(color) {
  document.querySelector('.os-badge').style.color = color;
  document.querySelector('.fs-btn').style.color = color;
}
