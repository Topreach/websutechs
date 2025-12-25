// Main JavaScript File
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Websutech main.js loaded');
    
    // Mobile Menu Toggle
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileDropdownBtns = document.querySelectorAll('.mobile-dropdown-btn');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Mobile Dropdown Toggle
    mobileDropdownBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const content = this.nextElementSibling;
            content.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    });
    
    // Close mobile menu when clicking outside or on a link
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.navbar') && !event.target.closest('.mobile-menu')) {
            if (navToggle) navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Close mobile menu when clicking a link
        if (event.target.closest('.mobile-menu a')) {
            if (navToggle) navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (navToggle) navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Header scroll effect
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navToggle) navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Form handling is done by form-handler.js
    // Only add basic validation if form-handler.js is not loaded
    // Wait a bit to ensure form-handler.js has loaded
    setTimeout(() => {
        if (typeof FormHandler === 'undefined' && typeof formHandler === 'undefined') {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                // Basic validation
                const inputs = this.querySelectorAll('input[required], textarea[required], select[required]');
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('error');
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.textContent = 'This field is required';
                        input.parentNode.appendChild(errorMsg);
                    } else {
                        input.classList.remove('error');
                        const errorMsg = input.parentNode.querySelector('.error-message');
                        if (errorMsg) errorMsg.remove();
                    }
                });
                
                if (!isValid) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                    return;
                }
                
                // Simulate API call
                try {
                    const formData = new FormData(this);
                    const data = Object.fromEntries(formData);
                    
                    // Determine API endpoint based on form ID or action
                    let endpoint = '/.netlify/functions/contact';
                    if (this.id === 'buyerInquiryForm') endpoint = '/.netlify/functions/buyer-inquiry';
                    if (this.id === 'sellerInquiryForm') endpoint = '/.netlify/functions/seller-inquiry';
                    
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Show success message
                        this.innerHTML = `
                            <div class="form-success">
                                <div class="success-icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <h3>Successfully Submitted!</h3>
                                <p>${result.message}</p>
                            ${result.inquiryId ? `<p><strong>Reference:</strong> ${result.inquiryId}</p>` : ''}
                            ${result.nextSteps ? `
                                <div class="next-steps">
                                    <h4>Next Steps:</h4>
                                    <ul>
                                        ${result.nextSteps.map(step => `<li>${step}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            <button type="button" class="btn btn-primary" onclick="location.reload()">
                                Submit Another
                            </button>
                        </div>
                    `;
                    
                    // Track conversion
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submission', {
                            'event_category': 'Form',
                            'event_label': this.id || 'form'
                        });
                    }
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert('Failed to submit form. Please try again or contact us directly.');
                
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    });
    }
    }, 100); // Small delay to let form-handler.js load first
    
    // Product card animations
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'custom-tooltip';
            tooltipEl.textContent = tooltipText;
            document.body.appendChild(tooltipEl);
            
            const rect = this.getBoundingClientRect();
            tooltipEl.style.position = 'fixed';
            tooltipEl.style.left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2) + 'px';
            tooltipEl.style.top = (rect.top - tooltipEl.offsetHeight - 10) + 'px';
            tooltipEl.style.opacity = '1';
            
            this._tooltipElement = tooltipEl;
        });
        
        tooltip.addEventListener('mouseleave', function() {
            if (this._tooltipElement) {
                this._tooltipElement.remove();
            }
        });
    });
    
    // Initialize date pickers if any
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            const today = new Date().toISOString().split('T')[0];
            input.value = today;
        }
    });
    
    // Initialize select dropdowns with search if needed
    const selectElements = document.querySelectorAll('select');
    selectElements.forEach(select => {
        if (select.options.length > 10) {
            select.setAttribute('data-searchable', 'true');
        }
    });
    
    // Add CSS for tooltips
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
        .custom-tooltip {
            position: absolute;
            background: var(--primary-color);
            color: white;
            padding: 8px 12px;
            border-radius: var(--radius-sm);
            font-size: 0.875rem;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            max-width: 200px;
            text-align: center;
            box-shadow: var(--shadow-md);
        }
        
        .custom-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: var(--primary-color) transparent transparent transparent;
        }
        
        .error-message {
            color: var(--danger-color);
            font-size: 0.875rem;
            margin-top: 4px;
        }
        
        input.error, textarea.error, select.error {
            border-color: var(--danger-color) !important;
        }
        
        .form-success {
            text-align: center;
            padding: 2rem;
            background: var(--light-gray);
            border-radius: var(--radius-lg);
        }
        
        .success-icon {
            font-size: 4rem;
            color: var(--success-color);
            margin-bottom: 1rem;
        }
        
        .next-steps {
            text-align: left;
            background: white;
            padding: 1rem;
            border-radius: var(--radius-md);
            margin: 1rem 0;
        }
        
        .next-steps ul {
            list-style: disc;
            padding-left: 1.5rem;
            margin-top: 0.5rem;
        }
        
        .next-steps li {
            margin-bottom: 0.5rem;
            color: var(--dark-gray);
        }
    `;
    document.head.appendChild(tooltipStyle);
    
    // Test API connection
    testAPI();

    // Product detail modal handling: intercept product "View Details" links and show modal
    initProductDetailModal();
});

function initProductDetailModal() {
    // Delegate clicks on .btn-link that point to product detail html files under /products/
    document.addEventListener('click', async function (e) {
        const link = e.target.closest('.btn-link');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || !href.includes('products') || !href.endsWith('.html')) return;

        e.preventDefault();
        openProductModal(href);
    });

    // Close handlers
    const modal = document.getElementById('productDetailModal');
    if (!modal) return;
    const closeBtn = document.getElementById('productDetailClose');
    closeBtn.addEventListener('click', closeProductModal);
    modal.addEventListener('click', function(ev) {
        if (ev.target === modal) closeProductModal();
    });
    document.addEventListener('keydown', function(ev) {
        if (ev.key === 'Escape') closeProductModal();
    });
}

async function openProductModal(href) {
    const modal = document.getElementById('productDetailModal');
    const contentEl = document.getElementById('productDetailContent');
    if (!modal || !contentEl) return;

    contentEl.innerHTML = '<div style="text-align:center; padding:2rem 1rem; color:var(--dark-gray);">Loading...</div>';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    try {
        const resp = await fetch(href);
        if (!resp.ok) throw new Error('Failed to load details');
        const text = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // Prefer product hero and overview section if present
        const hero = doc.querySelector('.product-hero') || doc.querySelector('.page-hero');
        const overview = doc.querySelector('#overview') || doc.querySelector('.section');

        let html = '';
        if (hero) html += `<div class="modal-hero">${hero.innerHTML}</div>`;
        if (overview) html += `<div class="modal-overview">${overview.innerHTML}</div>`;
        if (!html) html = `<div style="padding:1rem;">No preview available. <a href="${href}">Open page</a></div>`;

        contentEl.innerHTML = html + `<div style="text-align:right; margin-top:1rem;"><a href="${href}" class="btn btn-outline" target="_blank">Open full page</a></div>`;
    } catch (err) {
        console.error('Product modal error', err);
        contentEl.innerHTML = `<div style="padding:1rem; color:var(--danger-color);">Unable to load details. <a href="${href}">Open page</a></div>`;
    }
}

function closeProductModal() {
    const modal = document.getElementById('productDetailModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

async function testAPI() {
    try {
        const response = await fetch('/.netlify/functions/contact', {
            method: 'GET'
        });
        console.log('✅ Netlify Functions available');
    } catch (error) {
        console.log('⚠️  API not available, running in static mode');
    }
}

// Make functions available globally
window.initMainJS = function() {
    console.log('Main JS initialized');
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initMainJS };
}