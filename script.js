/* ========================================
   DESTINO ESPANHA — JavaScript
   Particles, 3D Tilt, Counters, Animations
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==============================
    // 0. INITIALIZE LENIS SMOOTH SCROLL
    // ==============================
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Integrate Lenis with GSAP ScrollTrigger ticker
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ==============================
    // 1. PARTICLE SYSTEM (Hero)
    // ==============================
    const canvas = document.getElementById('hero-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.hue = Math.random() > 0.7 ? 43 : 220; // gold or blue
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                    this.reset();
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 70%, 65%, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Create particles
        const particleCount = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Draw connections between close particles
        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(212, 168, 83, ${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawConnections();
            animationId = requestAnimationFrame(animateParticles);
        }
        animateParticles();

        // Pause when not visible
        const heroObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationId) animateParticles();
                } else {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            });
        });
        heroObserver.observe(canvas);
    }

    // ==============================
    // 2. NAVBAR SCROLL
    // ==============================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // ==============================
    // 3. MOBILE MENU
    // ==============================
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileClose = document.getElementById('mobile-close');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function openMenu() {
        mobileMenu.classList.add('active');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileToggle.addEventListener('click', openMenu);
    mobileClose.addEventListener('click', closeMenu);
    mobileOverlay.addEventListener('click', closeMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    // ==============================
    // 4. GSAP SCROLL REVEAL & STAGGER ANIMATIONS
    // ==============================
    // General reveals (non-grid items)
    const generalReveals = document.querySelectorAll('.reveal:not(.step-card):not(.card):not(.avulso-item):not(.guia-card)');
    generalReveals.forEach((el) => {
        gsap.fromTo(el, 
            { opacity: 0, y: 40, transition: 'none' },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                ease: 'power2.out',
                clearProps: 'transition',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Staggered reveals for grid contents (reveals cards one by one)
    const gridReveals = [
        { grid: '.steps-grid', item: '.step-card' },
        { grid: '.cards-grid', item: '.card' },
        { grid: '.avulsos-grid', item: '.avulso-item' },
        { grid: '.guias-grid', item: '.guia-card' }
    ];

    gridReveals.forEach(g => {
        const gridEl = document.querySelector(g.grid);
        if (gridEl) {
            const items = gridEl.querySelectorAll(g.item);
            // Remove CSS reveal classes to hand control over to GSAP stagger
            items.forEach(item => item.classList.remove('reveal'));

            gsap.fromTo(items,
                { opacity: 0, y: 40, transition: 'none' },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: 'power2.out',
                    clearProps: 'transition',
                    scrollTrigger: {
                        trigger: gridEl,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    });

    // ==============================
    // 5. GSAP STATS COUNTER ANIMATION
    // ==============================
    const counters = document.querySelectorAll('.stat-number[data-target]');
    const statsSection = document.querySelector('.stats-bar');
    
    if (statsSection && counters.length > 0) {
        ScrollTrigger.create({
            trigger: statsSection,
            start: 'top 90%',
            onEnter: () => {
                counters.forEach(counter => {
                    const target = +counter.dataset.target;
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 1.8,
                        ease: 'power2.out',
                        onUpdate: () => {
                            counter.textContent = Math.round(obj.val);
                        }
                    });
                });
            }
        });
    }

    // ==============================
    // 5.5 HERO PARALLAX
    // ==============================
    const heroSection = document.getElementById('inicio');
    if (heroSection) {
        const badge = heroSection.querySelector('.hero-badge');
        const title = heroSection.querySelector('h1');
        const sub = heroSection.querySelector('.hero-sub');
        const buttons = heroSection.querySelector('.hero-buttons');
        const canvasParticles = document.getElementById('hero-particles');

        if (badge) gsap.to(badge, { yPercent: 30, ease: 'none', scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true } });
        if (title) gsap.to(title, { yPercent: 20, ease: 'none', scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true } });
        if (sub) gsap.to(sub, { yPercent: 15, ease: 'none', scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true } });
        if (buttons) gsap.to(buttons, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true } });
        if (canvasParticles) gsap.to(canvasParticles, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true } });
    }

    // ==============================
    // 6. FAQ ACCORDION
    // ==============================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close others
            faqItems.forEach(other => {
                if (other !== item && other.classList.contains('active')) {
                    other.classList.remove('active');
                    other.querySelector('.faq-answer').style.maxHeight = null;
                }
            });
            // Toggle current
            item.classList.toggle('active');
            const answer = item.querySelector('.faq-answer');
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = null;
            }
        });
    });

    // ==============================
    // 6.5 SERVICES TABS NAVIGATION
    // ==============================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Deactivate all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Activate clicked
            btn.classList.add('active');

            // Deactivate all tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            // Activate target tab content
            const activeContent = document.getElementById(`tab-${targetTab}`);
            if (activeContent) {
                activeContent.classList.add('active');

                // Animate items within the active tab
                const items = activeContent.querySelectorAll('.avulso-item');
                gsap.fromTo(items, 
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
                );

                // Refresh ScrollTrigger since the section height changed
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 100);
            }
        });
    });

    // ==============================
    // 7. 3D TILT & LIQUID GLASS EFFECT
    // ==============================
    const interactiveCards = document.querySelectorAll('.glass-card, .avulso-item, .guia-card, [data-tilt]');
    
    interactiveCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set variables for Liquid Glass glow gradient tracker
            card.style.setProperty('--mx', `${x}px`);
            card.style.setProperty('--my', `${y}px`);

            // Apply 3D tilt if the element has data-tilt attribute
            if (card.hasAttribute('data-tilt')) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            if (card.hasAttribute('data-tilt')) {
                card.style.transform = '';
            }
        });
    });

    // ==============================
    // 8. SMOOTH SCROLL FOR ANCHOR LINKS (LENIS)
    // ==============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                closeMenu(); // Close mobile menu if open
                
                const navHeight = navbar.offsetHeight;
                const targetPos = targetEl.offsetTop - navHeight - 10;
                
                lenis.scrollTo(targetPos);
            }
        });
    });

    // ==============================
    // 9. WHATSAPP FLOAT ANIMATION
    // ==============================
    const whatsappFloat = document.getElementById('whatsapp-float');
    if (whatsappFloat) {
        // Show/hide based on scroll
        let floatVisible = false;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400 && !floatVisible) {
                whatsappFloat.style.opacity = '1';
                whatsappFloat.style.transform = 'scale(1)';
                floatVisible = true;
            } else if (window.scrollY <= 400 && floatVisible) {
                whatsappFloat.style.opacity = '0';
                whatsappFloat.style.transform = 'scale(0.5)';
                floatVisible = false;
            }
        });
        // Start hidden
        whatsappFloat.style.opacity = '0';
        whatsappFloat.style.transform = 'scale(0.5)';
        whatsappFloat.style.transition = '0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    // ==============================
    // 10. TESTIMONIALS CAROUSEL
    // ==============================
    const carouselContainer = document.querySelector('.cases-carousel-container');
    const wrapper = document.querySelector('.cases-carousel-wrapper');
    const track = document.querySelector('.cases-carousel-track');
    const slides = document.querySelectorAll('.case-card-small');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (wrapper && slides.length > 0) {
        let currentIndex = 0;
        const totalSlides = slides.length;
        const gap = 24; // Definido no CSS (.cases-carousel-track gap: 24px)
        let autoplayInterval;

        // 1. Criar os dots de navegação dinamicamente
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                scrollToSlide(i);
                stopAutoplay();
                startAutoplay();
            });
            dotsContainer.appendChild(dot);
        }

        const dots = dotsContainer.querySelectorAll('.dot');

        // Retorna a largura real de um card (incluindo o gap)
        function getSlideWidth() {
            if (slides.length === 0) return 0;
            return slides[0].offsetWidth + gap;
        }

        // Função para rolar até o slide específico
        function scrollToSlide(index) {
            if (index < 0) index = 0;
            if (index >= totalSlides) index = totalSlides - 1;
            
            currentIndex = index;
            const targetScroll = index * getSlideWidth();
            wrapper.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
            updateDots(index);
        }

        // Atualizar classe ativa dos dots
        function updateDots(activeIndex) {
            dots.forEach((dot, idx) => {
                if (idx === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // 2. Setas de Navegação (Prev / Next)
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex < totalSlides - 1) {
                    scrollToSlide(currentIndex + 1);
                } else {
                    scrollToSlide(0); // Volta ao início
                }
                stopAutoplay();
                startAutoplay();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    scrollToSlide(currentIndex - 1);
                } else {
                    scrollToSlide(totalSlides - 1); // Vai pro final
                }
                stopAutoplay();
                startAutoplay();
            });
        }

        // 3. Sincronizar dots quando rolar manualmente (arrastar ou scroll nativo)
        let scrollTimeout;
        wrapper.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const slideWidth = getSlideWidth();
                if (slideWidth > 0) {
                    const activeIndex = Math.round(wrapper.scrollLeft / slideWidth);
                    currentIndex = activeIndex;
                    updateDots(activeIndex);
                }
            }, 100);
        });

        // 4. Autoplay Inteligente
        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                if (currentIndex < totalSlides - 1) {
                    scrollToSlide(currentIndex + 1);
                } else {
                    scrollToSlide(0);
                }
            }, 5000); // 5 segundos
        }

        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }

        // Pausa no Hover e foco
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoplay);
            carouselContainer.addEventListener('mouseleave', startAutoplay);
            carouselContainer.addEventListener('focusin', stopAutoplay);
            carouselContainer.addEventListener('focusout', startAutoplay);
        }

        // Inicializar Autoplay
        startAutoplay();

        // 5. Suporte a Arrastar (Drag to Scroll) no Desktop
        let isDown = false;
        let startX;
        let scrollLeftVal;

        wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            wrapper.style.cursor = 'grabbing';
            startX = e.pageX - wrapper.offsetLeft;
            scrollLeftVal = wrapper.scrollLeft;
            stopAutoplay();
        });

        wrapper.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                wrapper.style.cursor = 'grab';
                startAutoplay();
            }
        });

        wrapper.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                wrapper.style.cursor = 'grab';
                startAutoplay();
                // Ajusta para o slide mais próximo depois de soltar
                setTimeout(() => {
                    const slideWidth = getSlideWidth();
                    if (slideWidth > 0) {
                        const index = Math.round(wrapper.scrollLeft / slideWidth);
                        scrollToSlide(index);
                    }
                }, 50);
            }
        });

        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 1.5; // Fator de sensibilidade
            wrapper.scrollLeft = scrollLeftVal - walk;
        });

        // Ajustar layout e dots em caso de redimensionamento da janela
        window.addEventListener('resize', () => {
            scrollToSlide(currentIndex);
        });
    }

    // ==============================
    // 6. GOOGLE ADS CONVERSION TRACKING
    // ==============================
    const waLinks = document.querySelectorAll('a[href*="wa.me"]');
    waLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    'send_to': 'AW-18239034284/qeSeCJrL8r4cEKynhvlD',
                    'value': 1.0,
                    'currency': 'EUR'
                });
            }
        });
    });
});
