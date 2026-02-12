// ============================================
// PHASE 1 - BASIC FUNCTIONALITY
// ============================================

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('active');
        });
    }

    // Form submission handling (basic)
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            console.log('Form submitted:', data);

            // Show success message (basic for now)
            alert('Thank you! We will be in touch soon.');

            // Reset form
            contactForm.reset();
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu if open
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                }
            }
        });
    });

    // ============================================
    // PHASE 4 - SCROLL ANIMATIONS
    // ============================================

    // Intersection Observer for scroll-based animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                // Unobserve after animation to prevent re-triggering
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe offer sections
    document.querySelectorAll('.offer-text, .offer-visual').forEach(el => {
        observer.observe(el);
    });

    // Observe and stagger process steps
    const processSteps = document.querySelectorAll('.process-step');
    processSteps.forEach((step, index) => {
        step.classList.add(`animate-delay-${index + 1}`);
        observer.observe(step);
    });

    // Observe contact section
    const contactContent = document.querySelector('.contact-content');
    if (contactContent) {
        observer.observe(contactContent);
    }

    // Observe section titles
    document.querySelectorAll('.section-title').forEach(el => {
        observer.observe(el);
    });

    // Add hover-lift class to interactive cards
    document.querySelectorAll('.offer-text, .process-step').forEach(el => {
        el.classList.add('hover-lift');
    });

    // ============================================
    // ACCESSIBILITY - REDUCED MOTION
    // ============================================

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        // Disable animations for accessibility
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.style.animation = 'none';
            el.style.opacity = '1';
        });
    }
});
