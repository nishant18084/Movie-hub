// Boot Transition
window.onload = () => {
    setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => document.getElementById('boot-screen').remove(), 800);
    }, 2500);
};

// Window Management
function openApp(appId) {
    const windowEl = document.getElementById('app-window');
    const contentEl = document.getElementById('window-content');
    const titleEl = document.getElementById('window-title');

    windowEl.classList.add('app-active');
    
    if(appId === 'app-weather') {
        titleEl.innerText = "Weather";
        contentEl.innerHTML = "<h1>32°C</h1><p>Sunny and Clear</p>";
    } else if(appId === 'app-notes') {
        titleEl.innerText = "Notes";
        contentEl.innerHTML = "<textarea style='width:100%; height:200px; background:transparent; color:white;'>Write something here...</textarea>";
    }
}

function closeApp() {
    document.getElementById('app-window').classList.remove('app-active');
}

// Time
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('live-clock').innerText = timeStr;
    document.getElementById('live-status-time').innerText = timeStr;
}
setInterval(updateTime, 1000);
updateTime();
