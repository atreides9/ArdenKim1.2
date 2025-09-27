const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            revealOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .project-card, .tool-item').forEach(el => {
    el.classList.add('reveal-element');
    revealOnScroll.observe(el);
});

// Smooth scrolling with offset for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        // Handle scroll to top
        if (targetId === '#top') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const navHeight = document.querySelector('.nav-container').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translateY(${scroll * 0.3}px)`;
    }
});

document.querySelectorAll('.tool-bar').forEach(bar => {
    const level = bar.getAttribute('data-level');
    bar.style.width = `${level}%`;
});

// Dark Mode Toggle Functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }
    
    init() {
        // Set initial theme
        this.setTheme(this.currentTheme, false);
        
        // Add event listener to toggle button
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Add keyboard support for accessibility
            this.themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }
        
        // Listen for system preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (this.currentTheme === 'auto') {
                    this.setTheme('auto', true);
                }
            });
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme, true);
    }
    
    setTheme(theme, animate = true) {
        this.currentTheme = theme;
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Apply theme to body
        const isDark = this.getEffectiveTheme() === 'dark';
        
        if (animate) {
            // Add transition class for smooth animation
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            
            // Remove transition after animation completes
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        }
        
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Update button aria-label for accessibility
        if (this.themeToggle) {
            const label = isDark ? '라이트 모드로 전환' : '다크 모드로 전환';
            this.themeToggle.setAttribute('aria-label', label);
        }
        
        // Update navigation background for current theme
        this.updateNavigationBackground();
    }
    
    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return this.currentTheme;
    }
    
    updateNavigationBackground() {
        const nav = document.querySelector('.nav-container');
        const isDark = this.getEffectiveTheme() === 'dark';
        
        if (!nav) return;
        
        if (isDark) {
            nav.style.background = 'rgba(18, 18, 18, 0.95)';
        } else {
            const scrollPosition = window.scrollY;
            if (scrollPosition > 100) {
                nav.style.background = 'rgba(239, 239, 239, 0.95)';
            } else {
                nav.style.background = 'rgba(239, 239, 239, 0.85)';
            }
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Remove preload class to enable transitions
    document.body.classList.remove('preload');
    document.documentElement.classList.remove('dark-mode-loading');
    
    const themeManager = new ThemeManager();
    
    // Update navigation background on scroll (only for light mode)
    window.addEventListener('scroll', () => {
        if (!document.body.classList.contains('dark-mode')) {
            themeManager.updateNavigationBackground();
        }
    });

    // In-page navigation scroll spy
    const sections = document.querySelectorAll('.project-section[id]');
    const navLinks = document.querySelectorAll('.in-page-nav a');

    if (sections.length > 0 && navLinks.length > 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    let activeLink = document.querySelector(`.in-page-nav a[href="#${id}"]`);
                    
                    navLinks.forEach(link => link.classList.remove('active'));
                    
                    if (activeLink) {
                        activeLink.classList.add('active');
                        // Also highlight the parent link if it's a sub-item
                        let parentUl = activeLink.closest('ul');
                        if (parentUl && parentUl.parentElement.tagName === 'LI') {
                            parentUl.parentElement.querySelector('a').classList.add('active');
                        }
                    }
                }
            });
        }, {
            rootMargin: '-40% 0px -60% 0px',
            threshold: 0
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // --- In-Page Navigation Click Handling ---
    document.querySelectorAll('.in-page-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Set active class immediately on click
            document.querySelectorAll('.in-page-nav a').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
    
            let parentUl = this.closest('ul');
            if (parentUl && parentUl.parentElement.tagName === 'LI') {
                parentUl.parentElement.querySelector('a').classList.add('active');
            }
    
            // Scroll to target
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
    
            if (targetElement) {
                const navHeight = document.querySelector('.nav-container').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20; // 20px extra offset
    
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Email copy functionality
function copyEmail() {
    const email = 'smkim.designer@gmail.com';
    const button = document.querySelector('.email-copy-btn');
    
    // Use modern clipboard API if available
    if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
            showCopySuccess(button);
        }).catch(() => {
            // Fallback to older method
            fallbackCopyText(email, button);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyText(email, button);
    }
}

function fallbackCopyText(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess(button);
    } catch (err) {
        console.error('Failed to copy email: ', err);
        button.textContent = '복사 실패 ❌';
        setTimeout(() => {
            button.innerHTML = 'smkim.designer@gmail.com 📋';
        }, 2000);
    }
    
    document.body.removeChild(textArea);
}

function showCopySuccess(button) {
    const originalText = button.innerHTML;
    button.classList.add('copied');
    button.textContent = '복사됨! ✅';
    
    setTimeout(() => {
        button.classList.remove('copied');
        button.innerHTML = originalText;
    }, 2000);
}