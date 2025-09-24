// Accessibility JavaScript Enhancements

// Keyboard Navigation
document.addEventListener('DOMContentLoaded', function() {
    
    // Skip Link Functionality
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content ID if not exists
    const mainContent = document.querySelector('.hero-section') || document.querySelector('main');
    if (mainContent) {
        mainContent.id = 'main-content';
        mainContent.setAttribute('tabindex', '-1');
    }
    
    // Enhanced Keyboard Navigation for Project Cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const link = card.querySelector('.view-project');
        if (link) {
            // Make entire card clickable
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View project: ${card.querySelector('h3').textContent}`);
            
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
            
            card.addEventListener('click', function(e) {
                if (e.target === card || e.target.closest('.project-info')) {
                    link.click();
                }
            });
        }
    });
    
    // ARIA Live Region for Announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'announcements';
    document.body.appendChild(liveRegion);
    
    // Announce page changes for SPA-like behavior
    window.announceToScreenReader = function(message) {
        liveRegion.textContent = message;
        setTimeout(() => liveRegion.textContent = '', 1000);
    };
    
    // Focus Management
    let lastFocusedElement = null;
    
    // Trap focus in modal if present
    window.trapFocus = function(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
            
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        firstFocusableElement.focus();
    };
    
    // Modal Functions
    window.openModal = function(modalId) {
        lastFocusedElement = document.activeElement;
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.setAttribute('aria-hidden', 'false');
            modal.style.display = 'flex';
            trapFocus(modal);
            announceToScreenReader('Modal opened');
        }
    };
    
    window.closeModal = function() {
        const openModal = document.querySelector('.modal[aria-hidden="false"]');
        if (openModal) {
            openModal.setAttribute('aria-hidden', 'true');
            openModal.style.display = 'none';
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
            announceToScreenReader('Modal closed');
        }
    };
    
    // Add ARIA labels to navigation
    const nav = document.querySelector('.nav-container');
    if (nav) {
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Main navigation');
    }
    
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.setAttribute('role', 'menubar');
        navLinks.querySelectorAll('a').forEach(link => {
            link.setAttribute('role', 'menuitem');
        });
    }
    
    // Add ARIA labels to sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        const heading = section.querySelector('h1, h2');
        if (heading) {
            const headingId = `section-heading-${index}`;
            heading.id = headingId;
            section.setAttribute('aria-labelledby', headingId);
        }
    });
    
    // Enhanced form validation (if forms are present)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.setAttribute('novalidate', ''); // Use custom validation
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // Add ARIA attributes
            const label = form.querySelector(`label[for="${input.id}"]`);
            if (label) {
                input.setAttribute('aria-describedby', `${input.id}-description`);
            }
            
            // Real-time validation
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            validateForm(this);
        });
    });
    
    function validateField(field) {
        const errorContainer = document.getElementById(`${field.id}-error`);
        let isValid = true;
        let errorMessage = '';
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = `${field.getAttribute('aria-label') || field.name} is required`;
        }
        
        if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        
        if (errorContainer) {
            if (!isValid) {
                errorContainer.textContent = errorMessage;
                field.setAttribute('aria-invalid', 'true');
                field.classList.add('error');
            } else {
                errorContainer.textContent = '';
                field.setAttribute('aria-invalid', 'false');
                field.classList.remove('error');
            }
        }
        
        return isValid;
    }
    
    function clearFieldError(field) {
        const errorContainer = document.getElementById(`${field.id}-error`);
        if (errorContainer) {
            errorContainer.textContent = '';
            field.setAttribute('aria-invalid', 'false');
            field.classList.remove('error');
        }
    }
    
    function validateForm(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        let isFormValid = true;
        
        fields.forEach(field => {
            if (!validateField(field)) {
                isFormValid = false;
            }
        });
        
        if (isFormValid) {
            announceToScreenReader('Form submitted successfully');
            // Handle form submission
        } else {
            announceToScreenReader('Please correct the errors in the form');
            // Focus first invalid field
            const firstInvalidField = form.querySelector('[aria-invalid="true"]');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Smooth scroll with reduced motion consideration
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                target.scrollIntoView({
                    behavior: prefersReducedMotion ? 'auto' : 'smooth',
                    block: 'start'
                });
                target.focus();
            }
        });
    });
    
    // Announce route changes (for SPA-like behavior)
    let currentPath = window.location.pathname;
    setInterval(() => {
        if (window.location.pathname !== currentPath) {
            currentPath = window.location.pathname;
            const pageTitle = document.title;
            announceToScreenReader(`Navigated to ${pageTitle}`);
        }
    }, 100);
    
    // High contrast detection
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
    }
    
    // Reduced motion detection
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }
    
    console.log('✅ Accessibility enhancements loaded');
});