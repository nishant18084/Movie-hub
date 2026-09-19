// Clock Engine
function syncTimeNow() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const timeStr = `${h}:${m}`;
  const dateStr = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;

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
syncTimeNow();
setInterval(syncTimeNow, 1000);

let calcBuffer = '';
let mediaStream = null;

// Load Wallpaper
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const splash = document.getElementById('hello-splash');
    if (splash) splash.remove();
  }, 1900);

  const savedWp = localStorage.getItem('nexus_wallpaper');
  if (savedWp) {
    document.body.style.backgroundImage = `url(${savedWp})`;
    const ls = document.getElementById('lock-screen');
    if (ls) ls.style.backgroundImage = `url(${savedWp})`;
  }
});

// Unlock Screen
function unlockDeviceNow() {
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
  closeAllModals();
}

function closeAllModals() {
  closeApp();
  closePhoneApp();
}

// Audio Tone Generator for Dialpad
let audioCtx = null;
function playBeep(freq = 440) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {}
}

// Phone App Logic
let currentDialedNumber = '';
const tones = { '1': 697, '2': 770, '3': 852, '4': 697, '5': 770, '6': 852, '7': 941, '8': 770, '9': 852, '0': 941, '*': 697, '#': 941 };

function openPhoneApp() {
  closeApp();
  document.getElementById('phone-app-window').style.display = 'flex';
  renderRecentsList();
}

function closePhoneApp() {
  document.getElementById('phone-app-window').style.display = 'none';
}

function pressKey(key) {
  playBeep(tones[key] || 440);
  currentDialedNumber += key;
  document.getElementById('dial-input').innerText = currentDialedNumber;
}

function deleteKey() {
  currentDialedNumber = currentDialedNumber.slice(0, -1);
  document.getElementById('dial-input').innerText = currentDialedNumber;
}

function switchPhoneTab(tab) {
  const keypad = document.getElementById('phone-keypad-view');
  const recents = document.getElementById('phone-recents-view');
  const kBtn = document.getElementById('tab-dialer-btn');
  const rBtn = document.getElementById('tab-recents-btn');

  if (tab === 'keypad') {
    keypad.style.display = 'flex';
    recents.style.display = 'none';
    kBtn.classList.add('active');
    rBtn.classList.remove('active');
  } else {
    keypad.style.display = 'none';
    recents.style.display = 'flex';
    rBtn.classList.add('active');
    kBtn.classList.remove('active');
    renderRecentsList();
  }
}

// Call Calling Handlers
let callTimerInterval = null;
let callSeconds = 0;

function startCall(target) {
  if (!target) target = 'Customer Support';
  document.getElementById('live-caller-name').innerText = target;
  document.getElementById('live-call-status').innerText = 'Calling...';
  document.getElementById('active-call-overlay').style.display = 'flex';

  saveCallToRecents(target);

  setTimeout(() => {
    document.getElementById('live-call-status').innerText = '00:00';
    callSeconds = 0;
    clearInterval(callTimerInterval);
    callTimerInterval = setInterval(() => {
      callSeconds++;
      const m = String(Math.floor(callSeconds / 60)).padStart(2, '0');
      const s = String(callSeconds % 60).padStart(2, '0');
      document.getElementById('live-call-status').innerText = `${m}:${s}`;
    }, 1000);
  }, 2000);
}

function endOngoingCall() {
  clearInterval(callTimerInterval);
  document.getElementById('live-call-status').innerText = 'Call Ended';
  setTimeout(() => {
    document.getElementById('active-call-overlay').style.display = 'none';
  }, 500);
}

function toggleMute() { document.getElementById('mute-btn').classList.toggle('active'); }
function toggleSpeaker() { document.getElementById('speaker-btn').classList.toggle('active'); }

function saveCallToRecents(num) {
  const logs = JSON.parse(localStorage.getItem('nexus_call_logs') || '[]');
  logs.unshift({
    number: num,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: 'Today'
  });
  localStorage.setItem('nexus_call_logs', JSON.stringify(logs.slice(0, 20)));
}

function renderRecentsList() {
  const list = document.getElementById('recents-list');
  if (!list) return;
  list.innerHTML = '';
  const logs = JSON.parse(localStorage.getItem('nexus_call_logs') || '[]');
  if (logs.length === 0) {
    list.innerHTML = '<p style="color:var(--muted); text-align:center; padding:30px;">No recent calls</p>';
    return;
  }
  logs.forEach(item => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); padding:12px 16px; border-radius:14px;';
    row.innerHTML = `
      <div>
        <b style="font-size:15px; color:#fff;">${item.number}</b>
        <p style="font-size:12px; color:var(--muted); margin-top:2px;">↗ Outgoing • ${item.time}</p>
      </div>
      <button onclick="startCall('${item.number}')" style="background:none; border:none; color:var(--green); font-size:18px; cursor:pointer;">📞</button>
    `;
    list.appendChild(row);
  });
}

// System Apps
function openApp(name) {
  closePhoneApp();
  const modal = document.getElementById('app-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  modal.style.display = 'flex';
  title.innerText = name.toUpperCase();

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
            <b>Set Wallpaper (Home & Lock)</b>
            <div style="display:flex; gap:8px; margin-top:8px;">
              <button onclick="setSystemWallpaper('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800')" class="calc-btn action" style="flex:1; font-size:12px; padding:8px;">Cyber</button>
              <button onclick="setSystemWallpaper('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800')" class="calc-btn action" style="flex:1; font-size:12px; padding:8px;">Nature</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-item" onclick="lockDeviceNow()">
            <div><b>Lock Device Now</b></div>
            <span style="color:#f59e0b; font-weight:bold;">Lock 🔒 ›</span>
          </div>
          <div class="card-item" onclick="showPowerMenu()">
            <div><b style="color:#ef4444;">Power Menu</b></div>
            <span style="color:#ef4444; font-weight:bold;">Menu ›</span>
          </div>
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
        </div>
      `;
      break;

    case 'notes':
      const savedNotes = localStorage.getItem('nexus_notes') || '';
      body.innerHTML = `<textarea oninput="localStorage.setItem('nexus_notes', this.value)" style="width:100%; height:60vh; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:16px; color:#fff; font-size:16px; resize:none;" placeholder="Write notes...">${savedNotes}</textarea>`;
      break;

    default:
      body.innerHTML = `<div style="text-align:center; padding:40px 0;"><p>${name} is running smoothly.</p></div>`;
  }
}

function closeApp() { document.getElementById('app-modal').style.display = 'none'; }

function calcKey(k) {
  const v = document.getElementById('calc-view');
  if (k === 'C') { calcBuffer = ''; v.innerText = '0'; }
  else if (k === 'DEL') { calcBuffer = calcBuffer.slice(0, -1); v.innerText = calcBuffer || '0'; }
  else if (k === '=') { try { calcBuffer = String(eval(calcBuffer)); v.innerText = calcBuffer; } catch(e) { v.innerText = 'Error'; calcBuffer = ''; } }
  else { calcBuffer += k; v.innerText = calcBuffer; }
}

function showPowerMenu() { document.getElementById('power-overlay').style.display = 'flex'; }
function hidePowerMenu() { document.getElementById('power-overlay').style.display = 'none'; }
function restartDevice() { hidePowerMenu(); document.body.style.opacity = '0'; setTimeout(() => window.location.reload(), 300); }
function powerOffDevice() {
  hidePowerMenu();
  document.body.innerHTML = `<div style="height:100vh; background:#000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#475569;"><h2>Nexus OS Powered Off</h2><button onclick="window.location.reload()" style="margin-top:16px; background:#38bdf8; border:none; padding:12px 28px; border-radius:30px; font-weight:bold; cursor:pointer;">Turn On Device</button></div>`;
}

function toggleFullscreenMode() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen().catch(() => {});
  openApp('settings');
}

function setSystemWallpaper(url) {
  document.body.style.backgroundImage = `url(${url})`;
  const ls = document.getElementById('lock-screen');
  if (ls) ls.style.backgroundImage = `url(${url})`;
  localStorage.setItem('nexus_wallpaper', url);
  alert('Wallpaper applied!');
  openApp('settings');
}
