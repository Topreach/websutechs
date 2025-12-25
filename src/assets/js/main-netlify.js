// Updated main.js for Netlify deployment
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Websutech main.js loaded');
    
    // Mobile Menu Toggle
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Form handling for Netlify
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            try {
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
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
                    this.innerHTML = `
                        <div class="form-success">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h3>Successfully Submitted!</h3>
                            <p>${result.message}</p>
                            ${result.inquiryId ? `<p><strong>Reference:</strong> ${result.inquiryId}</p>` : ''}
                            <button type="button" class="btn btn-primary" onclick="location.reload()">
                                Submit Another
                            </button>
                        </div>
                    `;
                } else {
                    throw new Error(result.error || 'Submission failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert('Failed to submit form. Please try again or contact us directly.');
                
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    });
    
    console.log('✅ Netlify functions ready');
});

window.initMainJS = function() {
    console.log('Main JS initialized');
};