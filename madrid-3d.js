/* Destino Espanha — experiência cinematográfica Brasil–Madrid. */
(function () {
    'use strict';

    const DURATION = 25;
    const PHASE_STARTS = [0, 5, 9, 14, 19];
    const PUZZLE_COLUMNS = 8;
    const PUZZLE_ROWS = 5;
    const phases = [
        {
            eyebrow: 'Brasil → Madrid',
            title: 'Sua jornada começa antes do embarque.',
            body: 'Do Brasil ao horizonte real de Madrid, cada decisão entra em uma rota planejada para você.',
            image: '/visuals/madrid-skyline-real.webp',
            imageAlt: 'Panorama real de Madrid durante o pôr do sol',
            credit: 'Andres Garcia · Unsplash',
            creditUrl: 'https://unsplash.com/photos/city-with-high-rise-buildings-under-orange-and-gray-skies-during-sunset-_SWgYuWS9wY',
        },
        {
            eyebrow: 'Destino MAD',
            title: 'Madrid recebe o primeiro capítulo.',
            body: 'A chegada pelo aeroporto Madrid-Barajas conecta passagens, documentos e estratégia no mesmo planejamento.',
            image: '/visuals/madrid-airport-t4-real.webp',
            imageAlt: 'Fotografia real do Terminal 4 do aeroporto Madrid-Barajas',
            credit: 'Roberto Arias · Unsplash',
            creditUrl: 'https://unsplash.com/photos/people-walking-inside-the-building-t5XnKFVaDxo',
        },
        {
            eyebrow: 'Puerta de Alcalá',
            title: 'Cada etapa encontra o seu lugar.',
            body: 'Como os fragmentos desta porta histórica, documentos, passagens e preparação se encaixam em uma jornada completa.',
            image: '/visuals/madrid-puerta-alcala-real.webp',
            imageAlt: 'Fotografia real da Puerta de Alcalá ao entardecer',
            credit: 'Javier Perez Montes · Wikimedia Commons · CC BY-SA 4.0',
            creditUrl: 'https://commons.wikimedia.org/wiki/File:Anocheciendo_-_Puerta_de_Alcala_-_Madrid_01.jpg',
        },
        {
            eyebrow: 'Madrid em movimento',
            title: 'Atravesse a cidade com clareza.',
            body: 'A Gran Vía representa uma mudança em movimento: acompanhamento próximo, decisões claras e destino definido.',
            image: '/visuals/madrid-gran-via-real.webp',
            imageAlt: 'Fotografia real da Gran Vía de Madrid ao anoitecer',
            credit: 'Alev Takil · Unsplash',
            creditUrl: 'https://unsplash.com/photos/vehicles-of-road-beside-concrete-buildings-at-night-e8k2llHEiE0',
        },
        {
            eyebrow: 'Quilômetro Zero',
            title: 'O seu projeto começa aqui.',
            body: 'Da primeira análise ao desembarque, a Destino Espanha conecta cada parte da sua mudança.',
            image: '/visuals/madrid-skyline-real.webp',
            imageAlt: 'Panorama real do centro de Madrid iluminado pelo pôr do sol',
            credit: 'Andres Garcia · Unsplash',
            creditUrl: 'https://unsplash.com/photos/city-with-high-rise-buildings-under-orange-and-gray-skies-during-sunset-_SWgYuWS9wY',
        },
    ];

    const root = document.getElementById('madrid-experience');
    if (!root) return;

    const elements = {
        photo: document.getElementById('phase-photo'),
        photoStage: document.getElementById('real-photo-stage'),
        puzzle: document.getElementById('photo-puzzle'),
        puzzleGrid: document.getElementById('puzzle-grid'),
        globe: document.getElementById('flight-globe'),
        flightAnimation: document.getElementById('flight-animation'),
        sparks: document.getElementById('assembly-sparks'),
        eyebrow: document.getElementById('story-eyebrow'),
        title: document.getElementById('story-title'),
        body: document.getElementById('story-body'),
        madCode: document.getElementById('mad-code'),
        services: document.getElementById('service-stack'),
        credit: document.getElementById('photo-credit'),
        progress: document.getElementById('progress-fill'),
        phaseDots: document.getElementById('phase-dots'),
        previous: document.getElementById('previous-phase'),
        next: document.getElementById('next-phase'),
        restart: document.getElementById('restart-experience'),
        pause: document.getElementById('pause-experience'),
        pauseIcon: document.getElementById('pause-icon'),
        pauseCopy: document.getElementById('pause-copy'),
    };

    let phase = 0;
    let paused = false;
    let wheelLock = 0;
    let touchStart = null;
    let animationFrame = 0;
    let timeline = { startedAt: performance.now(), pausedAt: 0, pausedTotal: 0 };

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    function buildPuzzle() {
        if (!elements.puzzleGrid) return;
        const fragment = document.createDocumentFragment();
        for (let index = 0; index < PUZZLE_COLUMNS * PUZZLE_ROWS; index += 1) {
            const column = index % PUZZLE_COLUMNS;
            const row = Math.floor(index / PUZZLE_COLUMNS);
            const tile = document.createElement('span');
            tile.className = 'photo-tile';
            tile.style.setProperty('--scatter-x', `${((((index * 47) % 19) - 9) * 8)}px`);
            tile.style.setProperty('--scatter-y', `${((((index * 31) % 17) - 8) * 7)}px`);
            tile.style.setProperty('--scatter-z', `${120 + ((index * 83) % 520)}px`);
            tile.style.setProperty('--rotation', `${((index * 29) % 74) - 37}deg`);
            tile.style.setProperty('--delay', `${(index % 12) * 34}ms`);
            tile.style.left = `${column * (100 / PUZZLE_COLUMNS)}%`;
            tile.style.top = `${row * (100 / PUZZLE_ROWS)}%`;
            tile.style.width = `calc(${100 / PUZZLE_COLUMNS}% + 1px)`;
            tile.style.height = `calc(${100 / PUZZLE_ROWS}% + 1px)`;
            tile.style.backgroundImage = "url('/visuals/madrid-puerta-alcala-real.webp')";
            tile.style.backgroundSize = `${PUZZLE_COLUMNS * 100}% ${PUZZLE_ROWS * 100}%`;
            tile.style.backgroundPosition = `${(column / (PUZZLE_COLUMNS - 1)) * 100}% ${(row / (PUZZLE_ROWS - 1)) * 100}%`;
            fragment.appendChild(tile);
        }
        elements.puzzleGrid.appendChild(fragment);
    }

    function buildSparks() {
        if (!elements.sparks) return;
        for (let index = 0; index < 24; index += 1) {
            const spark = document.createElement('span');
            const alternate = index % 3 === 0;
            spark.style.left = alternate ? `${76 - index * 1.7}%` : `${34 + index * 2.35}%`;
            spark.style.top = alternate ? `${72 - index * 2.1}%` : `${20 + index * 2.4}%`;
            spark.style.width = `${2 + index * 0.08}px`;
            spark.style.height = `${2 + index * 0.08}px`;
            spark.style.animationDelay = `${index * -0.17}s`;
            elements.sparks.appendChild(spark);
        }
    }

    function buildDots() {
        phases.forEach((item, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = String(index + 1).padStart(2, '0');
            button.setAttribute('aria-label', `Ir para a cena ${index + 1}: ${item.eyebrow}`);
            button.addEventListener('click', () => jumpToPhase(index));
            elements.phaseDots.appendChild(button);
        });
    }

    function restartFlight() {
        if (typeof elements.flightAnimation?.beginElement === 'function') {
            elements.flightAnimation.beginElement();
        }
    }

    function renderPhase(nextPhase) {
        phase = clamp(nextPhase, 0, phases.length - 1);
        const current = phases[phase];
        root.className = `experience-shell phase-${phase}`;
        elements.photo.className = `phase-photo phase-photo-${phase}`;
        elements.photo.style.backgroundImage = `url('${current.image}')`;
        elements.photoStage.setAttribute('aria-label', current.imageAlt);
        elements.puzzle.classList.toggle('is-assembled', phase === 2);
        elements.globe.hidden = phase !== 0;
        if (phase === 0) window.requestAnimationFrame(restartFlight);
        elements.eyebrow.textContent = current.eyebrow;
        elements.title.textContent = current.title;
        elements.body.textContent = current.body;
        elements.madCode.classList.toggle('is-visible', phase === 1);
        elements.services.classList.toggle('is-visible', phase === 2 || phase === 3);
        elements.credit.href = current.creditUrl;
        elements.credit.textContent = `Foto real: ${current.credit} ↗`;
        elements.phaseDots.setAttribute('aria-label', `Cena ${phase + 1} de ${phases.length}`);
        [...elements.phaseDots.children].forEach((button, index) => {
            button.classList.toggle('is-active', index === phase);
            if (index === phase) button.setAttribute('aria-current', 'step');
            else button.removeAttribute('aria-current');
        });
        elements.previous.disabled = phase === 0;
        elements.next.disabled = phase === phases.length - 1;
        const prefetch = new Image();
        prefetch.src = phases[(phase + 1) % phases.length].image;
    }

    function updatePauseButton() {
        elements.pauseIcon.textContent = paused ? '▶' : 'Ⅱ';
        elements.pauseCopy.textContent = paused ? 'Continuar' : 'Pausar';
        elements.pause.setAttribute('aria-label', paused ? 'Continuar experiência' : 'Pausar experiência');
    }

    function jumpToPhase(requestedPhase) {
        const nextPhase = clamp(requestedPhase, 0, phases.length - 1);
        const now = performance.now();
        timeline = { startedAt: now - PHASE_STARTS[nextPhase] * 1000, pausedAt: 0, pausedTotal: 0 };
        paused = false;
        elements.progress.style.transform = `scaleX(${PHASE_STARTS[nextPhase] / DURATION})`;
        renderPhase(nextPhase);
        updatePauseButton();
    }

    function togglePause() {
        const now = performance.now();
        if (paused) {
            timeline.pausedTotal += now - timeline.pausedAt;
            paused = false;
        } else {
            timeline.pausedAt = now;
            paused = true;
        }
        updatePauseButton();
    }

    function animate(now) {
        const effectiveNow = paused ? timeline.pausedAt : now;
        const elapsed = (effectiveNow - timeline.startedAt - timeline.pausedTotal) / 1000;
        const time = ((elapsed % DURATION) + DURATION) % DURATION;
        const activePhase = time < 5 ? 0 : time < 9 ? 1 : time < 14 ? 2 : time < 19 ? 3 : 4;
        if (activePhase !== phase) renderPhase(activePhase);
        elements.progress.style.transform = `scaleX(${clamp(time / DURATION)})`;
        animationFrame = window.requestAnimationFrame(animate);
    }

    function handlePointerMove(event) {
        const rect = root.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        root.style.setProperty('--photo-x', `${(-x * 9).toFixed(2)}px`);
        root.style.setProperty('--photo-y', `${(-y * 6).toFixed(2)}px`);
        root.style.setProperty('--far-x', `${(x * 4).toFixed(2)}px`);
        root.style.setProperty('--far-y', `${(y * 3).toFixed(2)}px`);
        root.style.setProperty('--near-x', `${(x * 8).toFixed(2)}px`);
        root.style.setProperty('--near-y', `${(y * 5).toFixed(2)}px`);
        root.style.setProperty('--puzzle-x', `${(-x * 12).toFixed(2)}px`);
        root.style.setProperty('--puzzle-y', `${(-y * 7).toFixed(2)}px`);
        root.style.setProperty('--puzzle-rotation', `${(-x * 1.7).toFixed(2)}deg`);
    }

    function resetPointer() {
        ['--photo-x', '--photo-y', '--far-x', '--far-y', '--near-x', '--near-y', '--puzzle-x', '--puzzle-y'].forEach((property) => root.style.setProperty(property, '0px'));
        root.style.setProperty('--puzzle-rotation', '0deg');
    }

    buildPuzzle();
    buildSparks();
    buildDots();
    renderPhase(0);
    updatePauseButton();

    elements.restart.addEventListener('click', () => jumpToPhase(0));
    elements.pause.addEventListener('click', togglePause);
    elements.previous.addEventListener('click', () => jumpToPhase(phase - 1));
    elements.next.addEventListener('click', () => jumpToPhase(phase + 1));
    root.addEventListener('pointermove', handlePointerMove, { passive: true });
    root.addEventListener('pointerleave', resetPointer);
    root.addEventListener('wheel', (event) => {
        const now = performance.now();
        const dominantDelta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
        if (Math.abs(dominantDelta) < 24 || now - wheelLock < 650) return;
        wheelLock = now;
        jumpToPhase(phase + (dominantDelta > 0 ? 1 : -1));
    }, { passive: true });
    root.addEventListener('touchstart', (event) => {
        const touch = event.changedTouches[0];
        touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
    }, { passive: true });
    root.addEventListener('touchend', (event) => {
        const touch = event.changedTouches[0];
        if (!touchStart || !touch) return;
        const deltaX = touchStart.x - touch.clientX;
        const deltaY = touchStart.y - touch.clientY;
        const dominantDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
        touchStart = null;
        if (Math.abs(dominantDelta) >= 44) jumpToPhase(phase + (dominantDelta > 0 ? 1 : -1));
    }, { passive: true });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.cancelAnimationFrame(animationFrame);
        paused = true;
        timeline.pausedAt = performance.now();
        renderPhase(2);
        elements.progress.style.transform = `scaleX(${PHASE_STARTS[2] / DURATION})`;
        updatePauseButton();
    } else {
        animationFrame = window.requestAnimationFrame(animate);
    }
}());
