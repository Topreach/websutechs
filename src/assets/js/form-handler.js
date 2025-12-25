// Form Handler JavaScript
class FormHandler {
    constructor() {
        this.forms = [];
        this.init();
    }
    
    init() {
        // Initialize all forms on the page
        this.forms = document.querySelectorAll('form');
        this.forms.forEach(form => this.setupForm(form));
        
        // Setup multi-step forms
        this.setupMultiStepForms();
        
        // Setup file uploads
        this.setupFileUploads();
        
        console.log(`Form handler initialized with ${this.forms.length} forms`);
    }
    
    setupForm(form) {
        // Prevent duplicate handler attachment
        if (form.dataset.handlerAttached === 'true') {
            console.log('Form handler already attached, skipping:', form.id || form.name);
            return;
        }
        form.dataset.handlerAttached = 'true';
        
        // Add honeypot field
        this.addHoneypot(form);
        
        // Add timestamp
        this.addTimestamp(form);
        
        // Add form validation
        this.addValidation(form);
        
        // Handle submission (only once)
        form.addEventListener('submit', (e) => this.handleSubmit(e, form), { once: false });
    }
    
    setupMultiStepForms() {
        const multiStepForms = document.querySelectorAll('.multi-step-form');
        
        multiStepForms.forEach(form => {
            const steps = form.querySelectorAll('.form-step');
            const nextButtons = form.querySelectorAll('.next-step');
            const prevButtons = form.querySelectorAll('.prev-step');
            
            let currentStep = 0;
            
            // Initialize
            this.showStep(form, currentStep);
            
            // Next button
            nextButtons.forEach(button => {
                button.addEventListener('click', () => {
                    if (this.validateStep(form, currentStep)) {
                        currentStep++;
                        this.showStep(form, currentStep);
                        this.updateProgress(form, currentStep, steps.length);
                    }
                });
            });
            
            // Previous button
            prevButtons.forEach(button => {
                button.addEventListener('click', () => {
                    currentStep--;
                    this.showStep(form, currentStep);
                    this.updateProgress(form, currentStep, steps.length);
                });
            });
        });
    }
    
    setupFileUploads() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const files = e.target.files;
                const maxSize = 10 * 1024 * 1024; // 10MB
                const allowedTypes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];
                
                // Validate each file
                for (let file of files) {
                    // Check size
                    if (file.size > maxSize) {
                        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                        input.value = '';
                        return;
                    }
                    
                    // Check type
                    if (!allowedTypes.includes(file.type)) {
                        alert(`File "${file.name}" has unsupported format. Please upload PDF, JPEG, PNG, GIF, or DOC files.`);
                        input.value = '';
                        return;
                    }
                }
                
                // Show file names
                this.showFileNames(input, files);
            });
        });
    }
    
    addHoneypot(form) {
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.display = 'none';
        honeypot.className = 'hp-field';
        honeypot.setAttribute('aria-hidden', 'true');
        honeypot.setAttribute('tabindex', '-1');
        form.appendChild(honeypot);
    }
    
    addTimestamp(form) {
        const timestamp = document.createElement('input');
        timestamp.type = 'hidden';
        timestamp.name = 'timestamp';
        timestamp.value = Date.now();
        form.appendChild(timestamp);
    }
    
    addValidation(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', () => this.validateField(input));
            
            // Clear error on input
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.clearError(input);
                }
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        
        // Clear previous error
        this.clearError(field);
        
        // Required validation
        if (field.hasAttribute('required') && !value) {
            this.showError(field, 'This field is required');
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(field, 'Please enter a valid email address');
                return false;
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleaned = value.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleaned)) {
                this.showError(field, 'Please enter a valid phone number');
                return false;
            }
        }
        
        // URL validation
        if (field.type === 'url' && value) {
            try {
                new URL(value);
            } catch {
                this.showError(field, 'Please enter a valid URL');
                return false;
            }
        }
        
        // Min length validation
        const minLength = field.getAttribute('minlength');
        if (minLength && value.length < parseInt(minLength)) {
            this.showError(field, `Minimum ${minLength} characters required`);
            return false;
        }
        
        // Max length validation
        const maxLength = field.getAttribute('maxlength');
        if (maxLength && value.length > parseInt(maxLength)) {
            this.showError(field, `Maximum ${maxLength} characters allowed`);
            return false;
        }
        
        return true;
    }
    
    validateStep(form, stepIndex) {
        const step = form.querySelectorAll('.form-step')[stepIndex];
        if (!step) return true;
        
        const inputs = step.querySelectorAll('[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    showError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        // Scroll to error if needed
        const rect = errorElement.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    clearError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    showStep(form, stepIndex) {
        const steps = form.querySelectorAll('.form-step');
        
        steps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
                step.style.display = 'block';
            } else {
                step.classList.remove('active');
                step.style.display = 'none';
            }
        });
    }
    
    updateProgress(form, currentStep, totalSteps) {
        const progress = form.querySelector('.form-progress');
        if (progress) {
            const percent = (currentStep / (totalSteps - 1)) * 100;
            progress.style.width = percent + '%';
        }
        
        const stepIndicator = form.querySelector('.step-indicator');
        if (stepIndicator) {
            stepIndicator.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
        }
    }
    
    showFileNames(input, files) {
        // Remove previous file display
        const existingDisplay = input.nextElementSibling;
        if (existingDisplay && existingDisplay.classList.contains('file-display')) {
            existingDisplay.remove();
        }
        
        if (files.length === 0) return;
        
        const fileDisplay = document.createElement('div');
        fileDisplay.className = 'file-display';
        
        const fileList = document.createElement('ul');
        fileList.style.marginTop = '8px';
        fileList.style.fontSize = '0.875rem';
        
        Array.from(files).forEach(file => {
            const listItem = document.createElement('li');
            listItem.style.marginBottom = '4px';
            listItem.style.display = 'flex';
            listItem.style.alignItems = 'center';
            listItem.style.gap = '8px';
            
            const icon = document.createElement('i');
            icon.className = this.getFileIcon(file.type);
            
            const fileName = document.createElement('span');
            fileName.textContent = `${file.name} (${this.formatFileSize(file.size)})`;
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.style.background = 'none';
            removeBtn.style.border = 'none';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.color = 'var(--danger-color)';
            removeBtn.addEventListener('click', () => {
                input.value = '';
                fileDisplay.remove();
            });
            
            listItem.appendChild(icon);
            listItem.appendChild(fileName);
            listItem.appendChild(removeBtn);
            fileList.appendChild(listItem);
        });
        
        fileDisplay.appendChild(fileList);
        input.parentNode.appendChild(fileDisplay);
    }
    
    getFileIcon(fileType) {
        if (fileType.includes('image/')) return 'fas fa-image';
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('word')) return 'fas fa-file-word';
        if (fileType.includes('excel')) return 'fas fa-file-excel';
        return 'fas fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async handleSubmit(event, form) {
        event.preventDefault();
        event.stopPropagation(); // Stop event from bubbling
        
        // AGGRESSIVE duplicate prevention
        if (form.dataset.submitting === 'true') {
            console.log('❌ Form already submitting, BLOCKING duplicate submission');
            return false;
        }
        
        // Also check if form was recently submitted (within 5 seconds)
        const lastSubmitTime = form.dataset.lastSubmitTime;
        if (lastSubmitTime && (Date.now() - parseInt(lastSubmitTime)) < 5000) {
            console.log('❌ Form submitted too recently, BLOCKING duplicate');
            return false;
        }
        
        form.dataset.submitting = 'true';
        form.dataset.lastSubmitTime = Date.now().toString();
        
        // Disable form completely
        form.style.pointerEvents = 'none';
        form.style.opacity = '0.7';
        
        // Check honeypot
        const honeypot = form.querySelector('.hp-field');
        if (honeypot && honeypot.value) {
            console.log('Bot detected by honeypot');
            form.dataset.submitting = 'false';
            // Don't submit, but show success to confuse bots
            this.showSuccess(form, 'Form submitted successfully');
            return;
        }
        
        // Check submission time (if less than 2 seconds, likely bot)
        const timestamp = form.querySelector('input[name="timestamp"]');
        if (timestamp) {
            const submitTime = Date.now();
            const startTime = parseInt(timestamp.value);
            if (submitTime - startTime < 2000) {
                console.log('Form submitted too quickly');
                // Still allow, but log for monitoring
            }
        }
        
        // Validate all fields
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            // Scroll to first error
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            form.dataset.submitting = 'false';
            return;
        }
        
        // Show loading state - prevent any error messages until we get a definitive response
        const submitButton = form.querySelector('button[type="submit"]');
        const originalContent = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Hide any previous error messages
        const previousErrors = form.querySelectorAll('.error-message, .form-error');
        previousErrors.forEach(err => err.remove());
        
        // Add a loading overlay to prevent multiple clicks
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'form-loading-overlay';
        loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;';
        loadingOverlay.innerHTML = '<div style="text-align: center;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #1a365d;"></i><p style="margin-top: 1rem;">Sending your message...</p></div>';
        
        const formContainer = form.closest('.form-container') || form.parentElement;
        const formPosition = form.getBoundingClientRect();
        if (formContainer) {
            formContainer.style.position = 'relative';
            formContainer.appendChild(loadingOverlay);
        }
        
        try {
            // Prepare form data
            const formData = new FormData(form);
            const data = {};
            
            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                // Skip honeypot and timestamp fields
                if (key === 'website' || key === 'timestamp') continue;
                
                if (data[key]) {
                    // Convert to array if multiple values
                    if (!Array.isArray(data[key])) {
                        data[key] = [data[key]];
                    }
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }
            
            // Determine API endpoint
            let endpoint = form.getAttribute('action') || '/api/contact/submit';
            if (form.id === 'buyerInquiryForm') endpoint = '/api/inquiries/buyer';
            if (form.id === 'sellerInquiryForm') endpoint = '/api/inquiries/seller';
            if (form.id === 'mandateApplicationForm') endpoint = '/api/inquiries/mandate';
            
            // Send to API with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Remove loading overlay
            if (loadingOverlay.parentElement) {
                loadingOverlay.remove();
            }
            
            const result = await response.json();
            
            // Check HTTP status and result
            if (response.ok && result.success) {
                // Success - show success message
                this.showSuccess(form, result);
                
                // Track conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        'event_category': 'Form',
                        'event_label': form.id || 'form',
                        'value': 1
                    });
                }
            } else {
                // Handle different error scenarios
                let errorMessage = result.message || 'Submission failed';
                
                // If it's a duplicate submission, treat it as success (message was already received)
                if (result.duplicate) {
                    this.showSuccess(form, {
                        message: 'Your message was already received successfully!',
                        messageId: 'Already Processed'
                    });
                    return;
                }
                
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            
            // Remove loading overlay
            if (loadingOverlay.parentElement) {
                loadingOverlay.remove();
            }
            
            // Only show error if it's a real error (not abort/timeout)
            if (error.name === 'AbortError') {
                this.showErrorFallback(form, 'Request timed out. Please check your connection and try again.');
            } else {
                // Fallback: Show error and suggest email
                this.showErrorFallback(form, error.message);
            }
            
            // Reset button and submission flag
            submitButton.disabled = false;
            submitButton.innerHTML = originalContent;
            form.dataset.submitting = 'false';
        }
    }
    
    showSuccess(form, result) {
        form.innerHTML = `
            <div class="form-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Successfully Submitted!</h3>
                <p>${result.message || 'Thank you for your submission.'}</p>
                
                ${result.inquiryId ? `
                    <div class="reference-number">
                        <p><strong>Reference Number:</strong></p>
                        <div class="ref-id">${result.inquiryId}</div>
                    </div>
                ` : ''}
                
                ${result.nextSteps ? `
                    <div class="next-steps">
                        <h4>What happens next?</h4>
                        <ul>
                            ${result.nextSteps.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="success-actions">
                    <button type="button" class="btn btn-primary" onclick="location.reload()">
                        Submit Another
                    </button>
                    <a href="/" class="btn btn-outline">
                        Return to Home
                    </a>
                </div>
                
                <div class="contact-info">
                    <p><strong>Need immediate assistance?</strong></p>
                    <p>Email: <a href="mailto:contact@websutech.com">contact@websutech.com</a></p>
                    <p>Phone: +1 (555) 123-4567</p>
                </div>
            </div>
        `;
        
        // Add some CSS for the success state
        const style = document.createElement('style');
        style.textContent = `
            .form-success {
                text-align: center;
                padding: 2rem;
                background: linear-gradient(135deg, #f7fafc, #e2e8f0);
                border-radius: var(--radius-lg);
                animation: fadeIn 0.5s ease-out;
            }
            
            .success-icon {
                font-size: 4rem;
                color: var(--success-color);
                margin-bottom: 1rem;
            }
            
            .reference-number {
                background: white;
                padding: 1rem;
                border-radius: var(--radius-md);
                margin: 1rem 0;
                border: 2px solid var(--success-color);
            }
            
            .ref-id {
                font-family: monospace;
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--primary-color);
                letter-spacing: 1px;
            }
            
            .next-steps {
                text-align: left;
                background: white;
                padding: 1.5rem;
                border-radius: var(--radius-md);
                margin: 1.5rem 0;
            }
            
            .next-steps h4 {
                color: var(--primary-color);
                margin-bottom: 1rem;
            }
            
            .next-steps ul {
                list-style: disc;
                padding-left: 1.5rem;
            }
            
            .next-steps li {
                margin-bottom: 0.5rem;
                color: var(--dark-gray);
            }
            
            .success-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin: 2rem 0;
            }
            
            .contact-info {
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid var(--gray);
                font-size: 0.9rem;
                color: var(--dark-gray);
            }
            
            .contact-info a {
                color: var(--primary-color);
                font-weight: 600;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    showErrorFallback(form, errorMessage) {
        const errorHTML = `
            <div class="form-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3>Submission Failed</h3>
                <p>${errorMessage || 'There was an error submitting your form.'}</p>
                <p>Please try one of these alternatives:</p>
                
                <div class="alternative-options">
                    <div class="option">
                        <h4>Email Us Directly</h4>
                        <a href="mailto:contact@websutech.com" class="btn btn-primary">
                            <i class="fas fa-envelope"></i> Send Email
                        </a>
                    </div>
                    
                    <div class="option">
                        <h4>Call Us</h4>
                        <a href="tel:+15551234567" class="btn btn-secondary">
                            <i class="fas fa-phone"></i> +1 (555) 123-4567
                        </a>
                    </div>
                </div>
                
                <div class="retry-section">
                    <p>Or try submitting again:</p>
                    <button type="button" class="btn btn-outline" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            </div>
        `;
        
        form.innerHTML = errorHTML;
        
        // Add CSS for error state
        const style = document.createElement('style');
        style.textContent = `
            .form-error {
                text-align: center;
                padding: 2rem;
                background: linear-gradient(135deg, #fff5f5, #fed7d7);
                border-radius: var(--radius-lg);
                animation: fadeIn 0.5s ease-out;
            }
            
            .error-icon {
                font-size: 4rem;
                color: var(--danger-color);
                margin-bottom: 1rem;
            }
            
            .alternative-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            }
            
            .option {
                background: white;
                padding: 1.5rem;
                border-radius: var(--radius-md);
                border: 1px solid var(--gray);
            }
            
            .option h4 {
                margin-bottom: 1rem;
                color: var(--primary-color);
            }
            
            .retry-section {
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid var(--gray);
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formHandler = new FormHandler();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}