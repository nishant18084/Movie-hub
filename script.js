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

            <div class="settings-item" onclick="alert('Wi-Fi settings')">
              <div class="item-left">
                <div class="s-icon" style="background:#0284c7;">📶</div>
                <span class="s-title">Wi-Fi</span>
              </div>
              <div class="item-right"><span>Off</span><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Bluetooth settings')">
              <div class="item-left">
                <div class="s-icon" style="background:#2563eb;">ᛒ</div>
                <span class="s-title">Bluetooth</span>
              </div>
              <div class="item-right"><span>Off</span><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Mobile network settings')">
              <div class="item-left">
                <div class="s-icon" style="background:#16a34a;">⇅</div>
                <span class="s-title">Mobile network</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Device Connect')">
              <div class="item-left">
                <div class="s-icon" style="background:#0ea5e9;">🔗</div>
                <span class="s-title">Device Connect</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

          <!-- Group 2: Display & Personalisation -->
          <div class="settings-card">
            <div class="settings-item" onclick="alert('Personalisation settings')">
              <div class="item-left">
                <div class="s-icon" style="background:#ea580c;">🎨</div>
                <span class="s-title">Home screen, Lock screen & style</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Display settings')">
              <div class="item-left">
                <div class="s-icon" style="background:#eab308;">☀️</div>
                <span class="s-title">Display & brightness</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

          <!-- Group 3: Sound & Notifications -->
          <div class="settings-card">
            <div class="settings-item" onclick="alert('Sound settings')">
              <div class="item-left">
                <div class="s-icon" style="background:#22c55e;">🔔</div>
                <span class="s-title">Sound & vibration</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Notification settings')">
              <div class="item-left">
                <div class="s-icon" style="background:#0284c7;">💬</div>
                <span class="s-title">Notifications & Quick Settings</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

          <!-- Group 4: Privacy & Safety -->
          <div class="settings-card">
            <div class="settings-item" onclick="alert('Security settings')">
              <div class="item-left">
                <div class="s-icon" style="background:#2563eb;">🛡️</div>
                <span class="s-title">Security and privacy</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Safety & emergency')">
              <div class="item-left">
                <div class="s-icon" style="background:#dc2626;">🆘</div>
                <span class="s-title">Safety & emergency</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Location settings')">
              <div class="item-left">
                <div class="s-icon" style="background:#eab308;">📍</div>
                <span class="s-title">Location</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Digital wellbeing')">
              <div class="item-left">
                <div class="s-icon" style="background:#0ea5e9;">👤</div>
                <span class="s-title">Digital Wellbeing & parental controls</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

          <!-- Group 5: Apps & Battery -->
          <div class="settings-card">
            <div class="settings-item" onclick="alert('Apps list')">
              <div class="item-left">
                <div class="s-icon" style="background:#16a34a;">🎛️</div>
                <span class="s-title">Apps</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Battery details')">
              <div class="item-left">
                <div class="s-icon" style="background:#22c55e;">🔋</div>
                <span class="s-title">Battery</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Accessibility settings')">
              <div class="item-left">
                <div class="s-icon" style="background:#ea580c;">🚶</div>
                <span class="s-title">Accessibility & convenience</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

          <!-- Group 6: System & Device Info -->
          <div class="settings-card">
            <div class="settings-item" onclick="alert('System update: Up to date')">
              <div class="item-left">
                <div class="s-icon" style="background:#64748b;">⚙️</div>
                <span class="s-title">System & update</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="openAboutDevice()">
              <div class="item-left">
                <div class="s-icon" style="background:#16a34a;">📱</div>
                <span class="s-title">About device</span>
              </div>
              <div class="item-right"><span>Nexus Alpha</span><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Users & accounts')">
              <div class="item-left">
                <div class="s-icon" style="background:#2563eb;">👥</div>
                <span class="s-title">Users & accounts</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Google services')">
              <div class="item-left">
                <div class="s-icon" style="background:#0284c7;">G</div>
                <span class="s-title">Google</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('realme Lab features')">
              <div class="item-left">
                <div class="s-icon" style="background:#0284c7;">⚗️</div>
                <span class="s-title">realme Lab</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>

            <div class="settings-item" onclick="alert('Help & Feedback')">
              <div class="item-left">
                <div class="s-icon" style="background:#ea580c;">📖</div>
                <span class="s-title">Help & feedback</span>
              </div>
              <div class="item-right"><span class="arrow">›</span></div>
            </div>
          </div>

        </div>
      `;function openAboutDevice() {
  const content = document.getElementById('window-content');
  const title = document.getElementById('window-title');
  title.innerText = "About device";
  content.innerHTML = `
    <div class="settings-container">
      <div class="settings-card">
        <div class="settings-item">
          <span class="s-title">Device name</span>
          <span class="item-right" style="color:#38bdf8; font-weight:600;">Nexus Alpha</span>
        </div>
        <div class="settings-item">
          <span class="s-title">Model</span>
          <span class="item-right">RMX_2026</span>
        </div>
        <div class="settings-item">
          <span class="s-title">Processor</span>
          <span class="item-right">Octa-Core 5G</span>
        </div>
        <div class="settings-item">
          <span class="s-title">RAM</span>
          <span class="item-right">8.00 GB</span>
        </div>
        <div class="settings-item">
          <span class="s-title">Storage</span>
          <span class="item-right">128 GB (86 GB Free)</span>
        </div>
        <div class="settings-item">
          <span class="s-title">Android Version</span>
          <span class="item-right">15</span>
        </div>
      </div>
      <button onclick="openApp('settings')" class="calc-btn action" style="width:100%; margin-top:10px;">← Back to Settings</button>
    </div>
  `;
      }

      break;
