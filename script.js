/* ================================================
   AxionCo — Smooth Scroll & Reveal Animations
   ================================================ */

; (function () {
    'use strict';

    // ---- Utilities ----
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const isMobile = () => window.innerWidth <= 700;

    // ---- DOM Refs ----
    const intro = $('#intro');
    const header = $('#site-header');
    const menuBtn = $('#menu-toggle');
    const overlay = $('#mobile-nav-overlay');
    const form = $('#contact-form');

    // ============================
    // 1. STICKY HEADER — show after scrolling past intro
    // ============================
    let headerVisible = false;

    function handleHeaderVisibility() {
        const introBottom = intro.getBoundingClientRect().bottom;
        const shouldShow = introBottom < 40;

        if (shouldShow && !headerVisible) {
            header.classList.add('visible');
            intro.classList.add('intro--shrunk');
            headerVisible = true;
        } else if (!shouldShow && headerVisible) {
            header.classList.remove('visible');
            intro.classList.remove('intro--shrunk');
            headerVisible = false;
        }
    }

    // ============================
    // 2. SCROLL-TRIGGERED REVEALS
    // ============================
    function initRevealObserver() {
        const revealEls = $$('.reveal-up, .reveal-line, .reveal-slide');

        if (!revealEls.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    const delay = parseInt(el.dataset.delay || '0', 10) * 120; // stagger ms

                    setTimeout(() => {
                        el.classList.add('revealed');
                    }, delay);

                    observer.unobserve(el);
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        revealEls.forEach((el) => observer.observe(el));
    }

    // ============================
    // 3. SMOOTH SCROLL for nav links
    // ============================
    function initSmoothScroll() {
        $$('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const target = $(link.getAttribute('href'));
                if (!target) return;

                e.preventDefault();

                // Close mobile nav if open
                if (overlay.classList.contains('open')) {
                    closeMobileNav();
                }

                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    // ============================
    // 4. MOBILE NAV TOGGLE
    // ============================
    function openMobileNav() {
        overlay.classList.add('open');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        overlay.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', () => {
        const isOpen = overlay.classList.contains('open');
        isOpen ? closeMobileNav() : openMobileNav();
    });

    $$('.mobile-nav__link').forEach((link) => {
        link.addEventListener('click', closeMobileNav);
    });

    // ============================
    // 5. AUTOMATIONS CARD — Connection line canvas animation
    // ============================
    function initAutomationsCanvas() {
        const canvas = $('.automations-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId;
        let time = 0;

        function resize() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }

        function drawNode(x, y, r) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(217, 119, 6, ${0.3 + 0.2 * Math.sin(time * 0.02)})`;
            ctx.fill();
        }

        function drawLine(x1, y1, x2, y2) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(217, 119, 6, ${0.2 + 0.15 * Math.sin(time * 0.03)})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            ctx.lineDashOffset = -time * 0.5;
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function tick() {
            const w = canvas.width / window.devicePixelRatio;
            const h = canvas.height / window.devicePixelRatio;
            ctx.clearRect(0, 0, w, h);

            // Three nodes
            const nodes = [
                { x: w * 0.2, y: h * 0.3 },
                { x: w * 0.5, y: h * 0.7 },
                { x: w * 0.8, y: h * 0.35 },
            ];

            // Lines
            drawLine(nodes[0].x, nodes[0].y, nodes[1].x, nodes[1].y);
            drawLine(nodes[1].x, nodes[1].y, nodes[2].x, nodes[2].y);
            drawLine(nodes[2].x, nodes[2].y, nodes[0].x, nodes[0].y);

            // Nodes
            nodes.forEach((n) => drawNode(n.x, n.y, 4));

            time++;
            animId = requestAnimationFrame(tick);
        }

        // Only run when visible
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    resize();
                    tick();
                } else {
                    cancelAnimationFrame(animId);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(canvas.parentElement);
        window.addEventListener('resize', resize);
    }

    // ============================
    // 5b. SERVICES NODE-PULSE CANVAS
    // ============================
    function initServicesNodeCanvas() {
        if (isMobile()) return;

        const canvas = $('.services__node-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId;
        let time = 0;

        function resize() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        }

        function drawPulseNode(x, y, r) {
            const alpha = 0.15 + 0.12 * Math.sin(time * 0.015 + x * 0.01);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(217, 119, 6, ${alpha})`;
            ctx.fill();
        }

        function drawFaintLine(x1, y1, x2, y2) {
            const alpha = 0.05 + 0.04 * Math.sin(time * 0.02);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(217, 119, 6, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }

        // Scatter some nodes
        const nodeCount = 12;
        let nodes = [];

        function seedNodes() {
            const w = canvas.width / window.devicePixelRatio;
            const h = canvas.height / window.devicePixelRatio;
            nodes = Array.from({ length: nodeCount }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: 2 + Math.random() * 3,
            }));
        }

        function tick() {
            const w = canvas.width / window.devicePixelRatio;
            const h = canvas.height / window.devicePixelRatio;
            ctx.clearRect(0, 0, w, h);

            // Lines between nearby nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    if (Math.sqrt(dx * dx + dy * dy) < 250) {
                        drawFaintLine(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    }
                }
            }

            // Nodes
            nodes.forEach((n) => drawPulseNode(n.x, n.y, n.r));

            time++;
            animId = requestAnimationFrame(tick);
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    resize();
                    seedNodes();
                    tick();
                } else {
                    cancelAnimationFrame(animId);
                }
            },
            { threshold: 0.05 }
        );

        observer.observe(canvas.parentElement);
        window.addEventListener('resize', () => { resize(); seedNodes(); });
    }

    // ============================
    // 5c. CTA SECTION REVEAL (for glow pulse)
    // ============================
    function initContactReveal() {
        const contact = $('#contact');
        if (!contact) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    contact.classList.add('revealed-section');
                    observer.unobserve(contact);
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(contact);
    }

    // ============================
    // 6. CONTACT FORM SUBMISSION
    // ============================
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = new FormData(form);
        const payload = Object.fromEntries(data.entries());

        // Simple mailto fallback
        const subject = encodeURIComponent(`New inquiry from ${payload.brand_name}`);
        const body = encodeURIComponent(
            `Brand: ${payload.brand_name}\nPhone: ${payload.phone}\nEmail: ${payload.email}\n\nMessage:\n${payload.message}`
        );

        // Show success state
        form.innerHTML = `
      <div class="form-success revealed">
        <h3>Thank you!</h3>
        <p>We'll be in touch within 24 hours to start your growth journey.</p>
      </div>
    `;

        // Also open mailto
        window.location.href = `mailto:hello@axionco.com?subject=${subject}&body=${body}`;
    });

    // ============================
    // 7. PARALLAX BACKGROUND (desktop only)
    // ============================
    function initParallax() {
        if (isMobile()) return;

        const shapes = $$('.shape');
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                shapes.forEach((shape, i) => {
                    const speed = 0.02 + i * 0.01;
                    shape.style.transform = `translateY(${-scrollY * speed}px)`;
                });
                ticking = false;
            });
        });
    }

    // ============================
    // INIT
    // ============================
    function init() {
        handleHeaderVisibility();
        window.addEventListener('scroll', handleHeaderVisibility, { passive: true });

        initRevealObserver();
        initSmoothScroll();
        initAutomationsCanvas();
        initServicesNodeCanvas();
        initContactReveal();
        initParallax();
    }

    // Run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
