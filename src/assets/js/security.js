// Security JavaScript
class SecurityManager {
    constructor() {
        this.botDetected = false;
        this.init();
    }
    
    init() {
        this.detectBots();
        this.addFormProtection();
        this.preventInspection();
        this.addCopyProtection();
        this.rateLimitForms();
        this.monitorActivity();
        
        console.log('🔒 Security manager initialized');
    }
    
    detectBots() {
        // Check user agent for bot indicators
        const userAgent = navigator.userAgent.toLowerCase();
        const botIndicators = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
            'python', 'java', 'php', 'ruby', 'perl', 'go-http-client',
            'okhttp', 'requests', 'scrapy', 'headless', 'phantomjs',
            'selenium', 'puppeteer', 'playwright'
        ];
        
        if (botIndicators.some(indicator => userAgent.includes(indicator))) {
            this.botDetected = true;
            this.logSuspiciousActivity('Bot detected by user agent: ' + userAgent);
        }
        
        // Check for automation tools
        if (typeof window.__nightmare !== 'undefined' ||
            typeof window._selenium !== 'undefined' ||
            typeof window.callPhantom !== 'undefined') {
            this.botDetected = true;
            this.logSuspiciousActivity('Automation tool detected');
        }
        
        // Check screen properties
        if (screen.width === 0 || screen.height === 0 ||
            (screen.width < 200 && screen.height < 200)) {
            this.botDetected = true;
            this.logSuspiciousActivity('Suspicious screen size: ' + screen.width + 'x' + screen.height);
        }
        
        // Check for headless browser
        this.detectHeadless();
    }
    
    detectHeadless() {
        // Check for headless browser indicators
        const tests = {
            // Chrome headless
            chrome: () => {
                if (!window.chrome) return false;
                if (navigator.plugins.length === 0) return true;
                if (navigator.languages.length === 0) return true;
                return false;
            },
            
            // Firefox headless
            firefox: () => {
                if (!window.InstallTrigger) return false;
                if (navigator.plugins.length === 0) return true;
                return false;
            },
            
            // WebDriver property
            webdriver: () => {
                return navigator.webdriver === true;
            },
            
            // Languages property
            languages: () => {
                return navigator.languages === undefined;
            },
            
            // Permissions API
            permissions: () => {
                if (!navigator.permissions) return false;
                return new Promise(resolve => {
                    navigator.permissions.query({ name: 'notifications' })
                        .then(permissionStatus => {
                            if (permissionStatus.state === 'prompt' && 
                                Notification.permission === 'denied') {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        })
                        .catch(() => resolve(false));
                });
            }
        };
        
        // Run tests
        let headlessDetected = false;
        
        // Synchronous tests
        if (tests.chrome() || tests.firefox() || tests.webdriver() || tests.languages()) {
            headlessDetected = true;
        }
        
        // Async test
        if (tests.permissions) {
            tests.permissions().then(isHeadless => {
                if (isHeadless) {
                    headlessDetected = true;
                    this.logSuspiciousActivity('Headless browser detected');
                }
            });
        }
        
        if (headlessDetected) {
            this.botDetected = true;
        }
    }
    
    addFormProtection() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add honeypot field
            const honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = 'website';
            honeypot.style.cssText = 'position: absolute; left: -9999px;';
            honeypot.setAttribute('aria-hidden', 'true');
            honeypot.setAttribute('tabindex', '-1');
            form.appendChild(honeypot);
            
            // Add time-based token
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'security_token';
            tokenInput.value = this.generateToken();
            form.appendChild(tokenInput);
            
            // Add submission timestamp
            const timestampInput = document.createElement('input');
            timestampInput.type = 'hidden';
            timestampInput.name = 'submission_time';
            timestampInput.value = Date.now();
            form.appendChild(timestampInput);
            
            // Add mouse movement detection
            let mouseMoved = false;
            document.addEventListener('mousemove', () => {
                mouseMoved = true;
            });
            
            form.addEventListener('submit', (e) => {
                // Check honeypot
                if (honeypot.value) {
                    e.preventDefault();
                    this.logSuspiciousActivity('Form submission blocked by honeypot');
                    this.showFakeSuccess(form);
                    return false;
                }
                
                // Check token
                const currentToken = tokenInput.value;
                const expectedToken = this.generateToken();
                if (currentToken !== expectedToken) {
                    e.preventDefault();
                    this.logSuspiciousActivity('Invalid security token');
                    return false;
                }
                
                // Check submission time (if less than 1 second, likely bot)
                const submitTime = Date.now();
                const startTime = parseInt(timestampInput.value);
                if (submitTime - startTime < 1000) {
                    this.logSuspiciousActivity('Form submitted too quickly: ' + (submitTime - startTime) + 'ms');
                    // Still allow, but log it
                }
                
                // Check if mouse moved (basic human interaction)
                if (!mouseMoved) {
                    this.logSuspiciousActivity('Form submitted without mouse movement');
                    // Still allow, but log it
                }
                
                // Rate limiting check
                if (!this.checkRateLimit(form)) {
                    e.preventDefault();
                    alert('Please wait before submitting another form.');
                    return false;
                }
                
                // Update rate limit
                this.updateRateLimit(form);
            });
        });
    }
    
    generateToken() {
        const timestamp = Math.floor(Date.now() / 1000 / 60); // Change every minute
        const secret = 'websutech-security-' + timestamp;
        return btoa(secret).replace(/=/g, '');
    }
    
    showFakeSuccess(form) {
        // Show fake success to confuse bots
        form.innerHTML = `
            <div class="fake-success">
                <h3>Thank You!</h3>
                <p>Your form has been submitted successfully.</p>
                <p>We will contact you shortly.</p>
            </div>
        `;
        
        // Add some styling
        const style = document.createElement('style');
        style.textContent = `
            .fake-success {
                text-align: center;
                padding: 2rem;
                background: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 0.25rem;
                color: #155724;
            }
        `;
        document.head.appendChild(style);
    }
    
    preventInspection() {
        // Disable right-click on sensitive elements
        const sensitiveElements = document.querySelectorAll('.price, .contact-info, [data-sensitive], input[type="email"]');
        
        sensitiveElements.forEach(el => {
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
            
            // Prevent text selection
            el.style.userSelect = 'none';
            el.style.webkitUserSelect = 'none';
            el.style.msUserSelect = 'none';
        });
        
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
        document.addEventListener('keydown', (e) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+J
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+U
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
        });
        
        // Disable view source
        Object.defineProperty(document, 'onselectstart', {
            get: function() {},
            set: function() {}
        });
    }
    
    addCopyProtection() {
        // Add copyright notice on copy
        document.addEventListener('copy', (e) => {
            const selection = window.getSelection().toString();
            if (selection.length > 50) {
                const copyright = `\n\n---\nSource: Websutech (https://websutech.com)\n© ${new Date().getFullYear()} Websutech. All rights reserved.\n\n`;
                e.clipboardData.setData('text/plain', selection + copyright);
                e.preventDefault();
                
                // Show notification
                this.showCopyNotification();
            }
        });
        
        // Prevent drag and drop of images
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });
    }
    
    showCopyNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 10px 20px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-copyright"></i>
            <span>Content copied with copyright notice</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    rateLimitForms() {
        this.rateLimits = new Map();
        
        // Clean up old entries every minute
        setInterval(() => {
            const now = Date.now();
            for (const [key, timestamps] of this.rateLimits.entries()) {
                const recent = timestamps.filter(time => now - time < 300000); // 5 minutes
                if (recent.length === 0) {
                    this.rateLimits.delete(key);
                } else {
                    this.rateLimits.set(key, recent);
                }
            }
        }, 60000);
    }
    
    checkRateLimit(form) {
        const key = form.id || form.action || 'default';
        const now = Date.now();
        const timestamps = this.rateLimits.get(key) || [];
        
        // Remove timestamps older than 5 minutes
        const recent = timestamps.filter(time => now - time < 300000);
        
        // Check rate: maximum 3 submissions per 5 minutes
        if (recent.length >= 3) {
            return false;
        }
        
        return true;
    }
    
    updateRateLimit(form) {
        const key = form.id || form.action || 'default';
        const now = Date.now();
        const timestamps = this.rateLimits.get(key) || [];
        
        timestamps.push(now);
        this.rateLimits.set(key, timestamps);
    }
    
    monitorActivity() {
        // Track rapid clicks (bot-like behavior)
        let clickCount = 0;
        let lastClickTime = 0;
        
        document.addEventListener('click', (e) => {
            const now = Date.now();
            
            if (now - lastClickTime < 100) { // Less than 100ms between clicks
                clickCount++;
                
                if (clickCount > 10) { // More than 10 rapid clicks
                    this.botDetected = true;
                    this.logSuspiciousActivity('Rapid clicking detected: ' + clickCount + ' clicks');
                }
            } else {
                clickCount = 0;
            }
            
            lastClickTime = now;
        });
        
        // Track mouse movement patterns
        let mousePositions = [];
        let lastPosition = { x: 0, y: 0 };
        
        document.addEventListener('mousemove', (e) => {
            const position = { x: e.clientX, y: e.clientY };
            mousePositions.push(position);
            
            // Keep only last 50 positions
            if (mousePositions.length > 50) {
                mousePositions.shift();
            }
            
            // Check for linear movement (bot-like)
            if (mousePositions.length >= 10) {
                const isLinear = this.checkLinearMovement(mousePositions);
                if (isLinear) {
                    this.logSuspiciousActivity('Linear mouse movement detected (possible bot)');
                }
            }
            
            lastPosition = position;
        });
        
        // Track keyboard patterns
        let keystrokes = [];
        
        document.addEventListener('keydown', (e) => {
            keystrokes.push({
                key: e.key,
                time: Date.now(),
                code: e.code
            });
            
            // Keep only last 100 keystrokes
            if (keystrokes.length > 100) {
                keystrokes.shift();
            }
            
            // Check for rapid typing
            if (keystrokes.length >= 10) {
                const recent = keystrokes.slice(-10);
                const times = recent.map(k => k.time);
                const intervals = [];
                
                for (let i = 1; i < times.length; i++) {
                    intervals.push(times[i] - times[i - 1]);
                }
                
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                
                if (avgInterval < 50) { // Less than 50ms between keystrokes
                    this.logSuspiciousActivity('Rapid typing detected: ' + avgInterval.toFixed(2) + 'ms average');
                }
            }
        });
    }
    
    checkLinearMovement(positions) {
        // Simple check for linear movement
        if (positions.length < 3) return false;
        
        const dx1 = positions[1].x - positions[0].x;
        const dy1 = positions[1].y - positions[0].y;
        
        for (let i = 2; i < positions.length; i++) {
            const dx2 = positions[i].x - positions[i - 1].x;
            const dy2 = positions[i].y - positions[i - 1].y;
            
            // Check if direction is similar
            const angle1 = Math.atan2(dy1, dx1);
            const angle2 = Math.atan2(dy2, dx2);
            const angleDiff = Math.abs(angle1 - angle2);
            
            if (angleDiff > 0.1) { // More than 0.1 radian difference
                return false;
            }
        }
        
        return true;
    }
    
    logSuspiciousActivity(message) {
        console.warn('🔒 Security Alert:', message);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'security_alert', {
                'event_category': 'Security',
                'event_label': message,
                'non_interaction': true
            });
        }
        
        // Send to server if API is available
        this.reportToServer({
            type: 'security_alert',
            message: message,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            botDetected: this.botDetected
        });
    }
    
    async reportToServer(data) {
        try {
            await fetch('/api/security/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (error) {
            // Silent fail - it's okay if logging fails
        }
    }
    
    // Utility functions for frontend use
    static validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }
    
    static validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(String(phone).replace(/[\s\-\(\)]/g, ''));
    }
    
    static obfuscateEmail(email) {
        if (!email || !email.includes('@')) return email;
        
        const [local, domain] = email.split('@');
        const obfuscatedLocal = local.length > 2 
            ? local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1)
            : local;
        
        return obfuscatedLocal + '@' + domain;
    }
    
    static generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        // Ensure at least one of each required character type
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
        password += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 26));
        password += '0123456789'.charAt(Math.floor(Math.random() * 10));
        password += '!@#$%^&*'.charAt(Math.floor(Math.random() * 8));
        
        // Fill the rest
        for (let i = 4; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Shuffle
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
}

// Initialize security manager
document.addEventListener('DOMContentLoaded', () => {
    window.securityManager = new SecurityManager();
    
    // Make utility functions available globally
    window.WebsutechSecurity = {
        validateEmail: SecurityManager.validateEmail,
        validatePhone: SecurityManager.validatePhone,
        obfuscateEmail: SecurityManager.obfuscateEmail,
        generatePassword: SecurityManager.generatePassword
    };
    
    console.log('🔒 Security utilities available as window.WebsutechSecurity');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}