/* Destino Espanha — interações progressivas, acessíveis e sem dependências. */
(function () {
    'use strict';

    const ADS_ID = 'AW-18239034284';
    const WHATSAPP_CONVERSION = 'AW-18239034284/qeSeCJrL8r4cEKynhvlD';
    const CONSENT_KEY = 'de_cookie_consent_v1';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    document.documentElement.classList.add('js');

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
    };

    window.gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
    });

    function safeStorageGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function safeStorageSet(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch {
            // A escolha continua válida durante a sessão mesmo sem localStorage.
        }
    }

    function loadGoogleTag() {
        if (document.querySelector('script[data-google-tag]')) return;

        const tag = document.createElement('script');
        tag.async = true;
        tag.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`;
        tag.dataset.googleTag = 'true';
        document.head.appendChild(tag);

        window.gtag('js', new Date());
        window.gtag('config', ADS_ID);
    }

    function updateConsent(choice) {
        const accepted = choice === 'accepted';
        window.gtag('consent', 'update', {
            ad_storage: accepted ? 'granted' : 'denied',
            analytics_storage: accepted ? 'granted' : 'denied',
            ad_user_data: accepted ? 'granted' : 'denied',
            ad_personalization: accepted ? 'granted' : 'denied',
        });
        safeStorageSet(CONSENT_KEY, choice);
        document.documentElement.dataset.cookieConsent = choice;
        if (accepted) {
            loadGoogleTag();
            document.dispatchEvent(new CustomEvent('de:consent-accepted'));
        }
    }

    function setupCookieConsent() {
        const savedChoice = safeStorageGet(CONSENT_KEY);
        if (savedChoice === 'accepted' || savedChoice === 'rejected') {
            updateConsent(savedChoice);
        }

        const banner = document.createElement('section');
        banner.className = 'cookie-banner';
        banner.id = 'cookie-consent';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-modal', 'false');
        banner.setAttribute('aria-labelledby', 'cookie-title');
        banner.innerHTML = `
            <div class="cookie-copy">
                <strong id="cookie-title">Você escolhe os cookies</strong>
                <p>Usamos armazenamento necessário para lembrar sua escolha. O Google Ads só é ativado com sua autorização para medir os cliques de conversão.</p>
                <a href="/cookies">Ver política de cookies</a>
            </div>
            <div class="cookie-actions">
                <button type="button" class="btn-cookie-secondary" data-consent="rejected">Recusar opcionais</button>
                <button type="button" class="btn-cookie-primary" data-consent="accepted">Aceitar opcionais</button>
            </div>`;
        document.body.appendChild(banner);

        const closeBanner = () => {
            banner.classList.remove('is-visible');
            banner.setAttribute('aria-hidden', 'true');
        };
        const openBanner = () => {
            banner.classList.add('is-visible');
            banner.removeAttribute('aria-hidden');
            banner.querySelector('button')?.focus({ preventScroll: true });
        };

        banner.addEventListener('click', (event) => {
            const button = event.target.closest('[data-consent]');
            if (!button) return;
            updateConsent(button.dataset.consent);
            closeBanner();
        });

        document.addEventListener('click', (event) => {
            const settings = event.target.closest('[data-cookie-settings]');
            if (!settings) return;
            event.preventDefault();
            openBanner();
        });

        if (savedChoice !== 'accepted' && savedChoice !== 'rejected') {
            window.setTimeout(() => banner.classList.add('is-visible'), 250);
        }
    }

    function setupConversionTracking() {
        let purchaseSent = false;
        const sendPurchaseConversion = () => {
            const purchaseConversion = document.body.dataset.purchaseConversion;
            if (!purchaseConversion || purchaseSent || safeStorageGet(CONSENT_KEY) !== 'accepted') return;
            purchaseSent = true;
            window.gtag('event', 'conversion', {
                send_to: `${ADS_ID}/${purchaseConversion}`,
                value: Number(document.body.dataset.purchaseValue || 0),
                currency: document.body.dataset.purchaseCurrency || 'EUR',
                transaction_id: document.body.dataset.transactionId || '',
            });
        };

        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href*="/whatsapp"], a[href*="wa.me"]');
            if (!link || safeStorageGet(CONSENT_KEY) !== 'accepted') return;

            window.gtag('event', 'conversion', {
                send_to: WHATSAPP_CONVERSION,
                value: 1.0,
                currency: 'EUR',
                transport_type: 'beacon',
            });
        });

        document.addEventListener('de:consent-accepted', sendPurchaseConversion);
        sendPurchaseConversion();
    }

    function setupNavigation() {
        const navbar = document.getElementById('navbar');
        const toggle = document.getElementById('mobile-toggle');
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-overlay');
        const close = document.getElementById('mobile-close');
        if (!navbar) return;

        const updateNavbar = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
        updateNavbar();
        window.addEventListener('scroll', updateNavbar, { passive: true });

        if (!toggle || !menu || !overlay || !close) return;

        const closeMenu = () => {
            menu.classList.remove('active');
            overlay.classList.remove('active');
            menu.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        };
        const openMenu = () => {
            menu.classList.add('active');
            overlay.classList.add('active');
            menu.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.classList.add('menu-open');
            close.focus();
        };

        toggle.addEventListener('click', openMenu);
        close.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
        menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menu.classList.contains('active')) {
                closeMenu();
                toggle.focus();
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (event) => {
                const selector = anchor.getAttribute('href');
                if (!selector || selector === '#') return;
                const target = document.querySelector(selector);
                if (!target) return;
                event.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 12;
                window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
            });
        });
    }

    function setupReveal() {
        const items = [...document.querySelectorAll('.reveal')];
        if (!items.length) return;

        if (reducedMotion.matches || !('IntersectionObserver' in window)) {
            items.forEach((item) => item.classList.add('is-visible'));
            return;
        }

        items.forEach((item) => item.classList.add('reveal-ready'));
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        items.forEach((item) => observer.observe(item));
    }

    function setupParticles() {
        const canvas = document.getElementById('hero-particles');
        if (!canvas || reducedMotion.matches) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        let frame = 0;
        let particles = [];
        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            const count = Math.min(42, Math.max(18, Math.round((width * height) / 26000)));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 0.5 + Math.random() * 1.4,
                vx: (Math.random() - 0.5) * 0.14,
                vy: (Math.random() - 0.5) * 0.1,
                alpha: 0.18 + Math.random() * 0.35,
            }));
        };
        const draw = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            context.clearRect(0, 0, width, height);
            particles.forEach((particle) => {
                particle.x = (particle.x + particle.vx + width) % width;
                particle.y = (particle.y + particle.vy + height) % height;
                context.beginPath();
                context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                context.fillStyle = `rgba(240, 214, 138, ${particle.alpha})`;
                context.fill();
            });
            frame = window.requestAnimationFrame(draw);
        };

        const visibility = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !frame) draw();
            if (!entry.isIntersecting && frame) {
                window.cancelAnimationFrame(frame);
                frame = 0;
            }
        });
        resize();
        draw();
        visibility.observe(canvas);
        window.addEventListener('resize', resize, { passive: true });
    }

    function setupPuzzle() {
        const puzzle = document.getElementById('spain-puzzle');
        if (!puzzle) return;
        const caption = document.getElementById('puzzle-caption');
        const pieces = [...puzzle.querySelectorAll('.puzzle-piece')];

        const activate = (piece) => {
            pieces.forEach((item) => item.classList.toggle('is-active', item === piece));
            if (caption && piece.dataset.label) caption.textContent = piece.dataset.label;
        };
        pieces.forEach((piece) => {
            piece.addEventListener('mouseenter', () => activate(piece));
            piece.addEventListener('focus', () => activate(piece));
            piece.addEventListener('click', () => activate(piece));
        });

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => puzzle.classList.add('is-assembled'));
        });

        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || reducedMotion.matches) return;
        puzzle.addEventListener('pointermove', (event) => {
            const rect = puzzle.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            puzzle.style.setProperty('--puzzle-ry', `${x * 10}deg`);
            puzzle.style.setProperty('--puzzle-rx', `${y * -8}deg`);
        });
        puzzle.addEventListener('pointerleave', () => {
            puzzle.style.setProperty('--puzzle-ry', '0deg');
            puzzle.style.setProperty('--puzzle-rx', '0deg');
        });
    }

    function setupFaq() {
        const items = [...document.querySelectorAll('.faq-item')];
        items.forEach((item, index) => {
            const button = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (!button || !answer) return;
            if (!answer.id) answer.id = `faq-answer-${index + 1}`;
            button.setAttribute('aria-controls', answer.id);
            button.setAttribute('aria-expanded', 'false');

            button.addEventListener('click', () => {
                const opening = button.getAttribute('aria-expanded') !== 'true';
                items.forEach((other) => {
                    const otherButton = other.querySelector('.faq-question');
                    const otherAnswer = other.querySelector('.faq-answer');
                    other.classList.remove('active');
                    otherButton?.setAttribute('aria-expanded', 'false');
                    if (otherAnswer) otherAnswer.style.maxHeight = null;
                });
                if (opening) {
                    item.classList.add('active');
                    button.setAttribute('aria-expanded', 'true');
                    answer.style.maxHeight = `${answer.scrollHeight}px`;
                }
            });
        });
    }

    function setupTabs() {
        const buttons = [...document.querySelectorAll('.tab-btn')];
        const panels = [...document.querySelectorAll('.tab-content')];
        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const target = document.getElementById(`tab-${button.dataset.tab}`);
                buttons.forEach((item) => {
                    const active = item === button;
                    item.classList.toggle('active', active);
                    item.setAttribute('aria-selected', String(active));
                    item.tabIndex = active ? 0 : -1;
                });
                panels.forEach((panel) => {
                    const active = panel === target;
                    panel.classList.toggle('active', active);
                    panel.hidden = !active;
                });
            });
        });
    }

    function setupCardTilt() {
        if (reducedMotion.matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        document.querySelectorAll('[data-tilt]').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                card.style.setProperty('--mx', `${x}px`);
                card.style.setProperty('--my', `${y}px`);
                const rotateX = ((y / rect.height) - 0.5) * -5;
                const rotateY = ((x / rect.width) - 0.5) * 5;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
            });
            card.addEventListener('pointerleave', () => { card.style.transform = ''; });
        });
    }

    function setupCarousel() {
        const wrapper = document.querySelector('.cases-carousel-wrapper');
        const slides = [...document.querySelectorAll('.case-card-small')];
        const previous = document.querySelector('.prev-btn');
        const next = document.querySelector('.next-btn');
        const dotsContainer = document.querySelector('.carousel-dots');
        if (!wrapper || !slides.length || !dotsContainer) return;

        let current = 0;
        const dots = slides.map((slide, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'dot';
            dot.setAttribute('aria-label', `Mostrar perfil ${index + 1}`);
            dot.addEventListener('click', () => scrollTo(index));
            dotsContainer.appendChild(dot);
            return dot;
        });

        const update = (index) => {
            current = Math.max(0, Math.min(index, slides.length - 1));
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === current);
                if (dotIndex === current) dot.setAttribute('aria-current', 'true');
                else dot.removeAttribute('aria-current');
            });
        };
        const scrollTo = (index) => {
            const normalized = (index + slides.length) % slides.length;
            slides[normalized].scrollIntoView({
                behavior: reducedMotion.matches ? 'auto' : 'smooth',
                inline: 'start',
                block: 'nearest',
            });
            update(normalized);
        };

        previous?.addEventListener('click', () => scrollTo(current - 1));
        next?.addEventListener('click', () => scrollTo(current + 1));
        let scrollTimer = 0;
        wrapper.addEventListener('scroll', () => {
            window.clearTimeout(scrollTimer);
            scrollTimer = window.setTimeout(() => {
                const wrapperLeft = wrapper.getBoundingClientRect().left;
                const closest = slides.reduce((best, slide, index) => {
                    const distance = Math.abs(slide.getBoundingClientRect().left - wrapperLeft);
                    return distance < best.distance ? { index, distance } : best;
                }, { index: 0, distance: Number.POSITIVE_INFINITY });
                update(closest.index);
            }, 100);
        }, { passive: true });
        update(0);
    }

    function setupWhatsappFloat() {
        const button = document.getElementById('whatsapp-float');
        if (!button) return;
        const update = () => button.classList.toggle('is-visible', window.scrollY > 360);
        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    function setupExternalLinks() {
        document.querySelectorAll('a[target="_blank"]').forEach((link) => {
            const rel = new Set((link.getAttribute('rel') || '').split(/\s+/u).filter(Boolean));
            rel.add('noopener');
            rel.add('noreferrer');
            link.setAttribute('rel', [...rel].join(' '));
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupCookieConsent();
        setupConversionTracking();
        setupNavigation();
        setupReveal();
        setupParticles();
        setupPuzzle();
        setupFaq();
        setupTabs();
        setupCardTilt();
        setupCarousel();
        setupWhatsappFloat();
        setupExternalLinks();
    });
}());
