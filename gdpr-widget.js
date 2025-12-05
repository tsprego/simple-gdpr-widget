(function() {
    // --- ROBUST CONFIGURATION DEFAULTS ---
    const defaults = {
        logo: '', 
        theme: 1, // 1 to 10
        privacyPolicyUrl: '#',
        cookieName: 'gdpr_consent_timestamp',
        validityHours: 24
    };

    // Merge user config with defaults
    const config = Object.assign({}, defaults, window.GDPR_CONFIG || {});

    // --- 1. THEME ENGINE (10 TEMPLATES) ---
    // We generate CSS dynamically based on the chosen ID
    const themes = {
        1:  { bg: '#ffffff', text: '#333333', btn: '#007bff', btnText: '#fff', border: '1px solid #ddd' }, // Default Light
        2:  { bg: '#222222', text: '#ffffff', btn: '#4caf50', btnText: '#fff', border: 'none' },           // Dark Mode
        3:  { bg: '#2c3e50', text: '#ecf0f1', btn: '#e74c3c', btnText: '#fff', border: 'none' },           // Midnight Red
        4:  { bg: '#f8f9fa', text: '#343a40', btn: '#343a40', btnText: '#fff', border: '3px solid #333' }, // Brutalist
        5:  { bg: '#e3f2fd', text: '#0d47a1', btn: '#1565c0', btnText: '#fff', border: '1px solid #90caf9' }, // Blue Breeze
        6:  { bg: '#fff3e0', text: '#e65100', btn: '#ef6c00', btnText: '#fff', border: '1px solid #ffcc80' }, // Orange Sunset
        7:  { bg: '#f1f8e9', text: '#33691e', btn: '#558b2f', btnText: '#fff', border: '1px solid #dcedc8' }, // Forest
        8:  { bg: '#673ab7', text: '#fff',    btn: '#ffd740', btnText: '#000', border: 'none' },           // Royal Purple
        9:  { bg: '#000000', text: '#00ff00', btn: '#00ff00', btnText: '#000', border: '1px solid #00ff00' }, // Hacker Terminal
        10: { bg: '#ffffff', text: '#555',    btn: '#ddd',    btnText: '#333', border: '1px solid #eee' }  // Minimalist Grey
    };

    const selectedTheme = themes[config.theme] || themes[1];

    // --- 2. LOGIC: CHECK TIMESTAMP ---
    function checkConsent() {
        const cookie = getCookie(config.cookieName);
        if (cookie) {
            const consentTime = parseInt(cookie, 10);
            const now = Date.now();
            const hoursElapsed = (now - consentTime) / (1000 * 60 * 60);
            
            // If consent is less than 24 hours old, do nothing (User is happy)
            if (hoursElapsed < config.validityHours) {
                return; 
            }
        }
        // Otherwise, show the widget
        initWidget();
    }

    // --- 3. AUTO-DETECT COOKIES ---
    function getRunningCookies() {
        if (!document.cookie) return ['No cookies detected yet.'];
        return document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(Boolean);
    }

    // --- 4. RENDER UI ---
    function initWidget() {
        // Inject CSS
        const style = document.createElement('style');
        style.innerHTML = `
            #gdpr-box {
                position: fixed; bottom: 20px; right: 20px; max-width: 350px;
                background: ${selectedTheme.bg}; color: ${selectedTheme.text};
                border: ${selectedTheme.border}; padding: 20px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 99999;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                border-radius: 8px; animation: slideIn 0.5s ease-out;
            }
            #gdpr-box h4 { margin: 0 0 10px 0; font-size: 16px; display: flex; align-items: center; }
            #gdpr-box img.gdpr-logo { height: 24px; margin-right: 10px; }
            #gdpr-box p { font-size: 13px; margin-bottom: 15px; line-height: 1.4; }
            #gdpr-box .gdpr-btn {
                background: ${selectedTheme.btn}; color: ${selectedTheme.btnText};
                border: none; padding: 10px 20px; border-radius: 4px;
                cursor: pointer; font-weight: bold; width: 100%;
            }
            #gdpr-box .gdpr-details { font-size: 11px; margin-top: 10px; opacity: 0.8; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 5px; }
            @keyframes slideIn { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `;
        document.head.appendChild(style);

        // Create HTML
        const box = document.createElement('div');
        box.id = 'gdpr-box';
        
        const logoHTML = config.logo ? `<img src="${config.logo}" class="gdpr-logo">` : '';
        const detectedCookies = getRunningCookies();

        box.innerHTML = `
            <h4>${logoHTML} Privacy & Cookies</h4>
            <p>We use cookies to enhance your experience. This permission lasts for ${config.validityHours} hours.</p>
            <button id="gdpr-accept" class="gdpr-btn">Accept & Continue</button>
            <div class="gdpr-details">
                <strong>Detected Cookies:</strong> ${detectedCookies.join(', ')}
            </div>
        `;

        document.body.appendChild(box);

        // Event Listener
        document.getElementById('gdpr-accept').onclick = function() {
            setConsentCookie();
            box.style.opacity = '0';
            setTimeout(() => box.remove(), 500);
        };
    }

    // --- HELPER FUNCTIONS ---
    function setConsentCookie() {
        const d = new Date();
        d.setTime(d.getTime() + (config.validityHours * 60 * 60 * 1000));
        let expires = "expires="+ d.toUTCString();
        // We store the current timestamp as the value
        document.cookie = config.cookieName + "=" + Date.now() + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkConsent);
    } else {
        checkConsent();
    }

})();
