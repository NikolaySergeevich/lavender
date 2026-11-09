(function () {
    'use strict';

    // Set to false to remove both seasonal effects on every page.
    const CHRISTMAS_EFFECTS_ENABLED = true;
    if (!CHRISTMAS_EFFECTS_ENABLED || window.__lavdragonChristmasInitialized) return;
    window.__lavdragonChristmasInitialized = true;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse) and (max-height: 500px) and (max-width: 1199px)');
    const tablet = window.matchMedia('(max-width: 1199px)');
    const lightDevice = navigator.connection?.saveData || navigator.hardwareConcurrency <= 2;
    let snowfall = null;
    let currentProfile = '';

    function hatMarkup(id) {
        return `<svg class="christmas-brand-hat" viewBox="0 0 100 84" aria-hidden="true" focusable="false">
            <defs>
                <linearGradient id="${id}-red" x1="0" y1="0" x2="1" y2="1">
                    <stop stop-color="#f05553"/><stop offset=".42" stop-color="#d72b39"/><stop offset="1" stop-color="#a7132c"/>
                </linearGradient>
                <linearGradient id="${id}-fur" x1="0" y1="0" x2="0" y2="1">
                    <stop stop-color="#fff"/><stop offset=".55" stop-color="#fffdf9"/><stop offset="1" stop-color="#dce4ea"/>
                </linearGradient>
                <radialGradient id="${id}-pom" cx=".35" cy=".28" r=".75">
                    <stop stop-color="#fff"/><stop offset=".62" stop-color="#fffdf9"/><stop offset="1" stop-color="#d0dae3"/>
                </radialGradient>
            </defs>
            <path d="M17 66Q20 43 31 25C44 8 62 12 75 25Q84 33 85 51L77 55Q71 36 62 34Q63 49 68 65Z"
                fill="url(#${id}-red)" stroke="#8f2030" stroke-width="1"/>
            <path d="M31 29Q23 45 23 61M40 22Q49 16 60 20" fill="none" stroke="#ff9b89" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M62 34Q50 42 53 63L68 65Q62 47 62 34Z" fill="#8d142b" opacity=".3"/>
            <path d="M61 34Q69 30 77 42" fill="none" stroke="#95142b" stroke-opacity=".5" stroke-width="1.8"/>
            <ellipse cx="42" cy="74" rx="29" ry="3" fill="#253649" opacity=".12"/>
            <path d="M15 60Q14 56 19 56Q23 52 27 55Q32 52 36 55Q41 52 46 55Q51 52 55 56Q61 54 64 58Q70 57 71 62Q75 65 71 69Q72 74 67 74Q63 78 58 75Q53 78 49 75Q44 78 40 75Q34 78 30 75Q25 78 21 74Q15 76 14 71Q10 68 13 65Z"
                fill="url(#${id}-fur)" stroke="#cbd5df" stroke-width=".7"/>
            <path d="M19 61Q26 58 32 61M39 60Q47 58 53 62M59 62L65 64" fill="none" stroke="#fff" stroke-width="2.7" stroke-linecap="round"/>
            <g class="christmas-hat-pompon">
                <path d="M82 46L85 51" fill="none" stroke="#fff9f3" stroke-width="3" stroke-linecap="round"/>
                <path d="M84 49Q89 47 92 51Q97 52 96 57Q100 62 96 65Q96 70 91 71Q87 75 83 71Q77 72 76 67Q72 64 75 59Q74 54 79 53Q80 49 84 49Z"
                    fill="url(#${id}-pom)" stroke="#ced9e2" stroke-width=".65"/>
                <path d="M80 57Q84 52 89 55" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
            </g>
        </svg>`;
    }

    function decorateBrands() {
        const links = document.querySelectorAll('#navbar a, .seo-nav a, .topbar a.brand');
        let hatIndex = 0;
        links.forEach((link) => {
            if (!/^(?:lav\s*dragon|love\s*dragon)$/i.test(link.textContent.trim())
                || link.querySelector('.christmas-brand-last-letter')) return;
            const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
            let lastText = null;
            while (walker.nextNode()) {
                if (walker.currentNode.textContent.trim()) lastText = walker.currentNode;
            }
            const match = lastText?.textContent.match(/n(?=\s*$)/i);
            if (!match) return;

            // Only wrap the existing final letter. Text, accessible name and link are unchanged.
            const letterNode = lastText.splitText(match.index);
            letterNode.splitText(1);
            const letter = document.createElement('span');
            letter.className = 'christmas-brand-last-letter';
            if (letterNode.data === 'N') letter.classList.add('christmas-brand-last-letter--capital');
            letterNode.replaceWith(letter);
            letter.appendChild(letterNode);
            letter.insertAdjacentHTML('beforeend', hatMarkup(`christmas-hat-${++hatIndex}`));
        });
    }

    function snowflakePath(variant) {
        // Six identical radial arms. Branches are real vector paths, not text glyphs.
        const segments = [[[0, 0], [0, -17]]];
        if (variant !== 2) {
            segments.push([[-5, -11], [0, -7], [5, -11]]);
            segments.push([[-4, -16], [0, -12], [4, -16]]);
        } else {
            segments.push([[-4, -14], [0, -10], [4, -14]]);
        }
        if (variant === 1) segments.push([[0, -5], [3, -2], [0, 0], [-3, -2], [0, -5]]);
        return Array.from({ length: 6 }, (_, arm) => {
            const angle = arm * Math.PI / 3;
            return segments.map((segment) => segment.map(([x, y], index) => {
                const px = 20 + x * Math.cos(angle) - y * Math.sin(angle);
                const py = 20 + x * Math.sin(angle) + y * Math.cos(angle);
                return `${index ? 'L' : 'M'}${px.toFixed(2)} ${py.toFixed(2)}`;
            }).join('')).join('');
        }).join('');
    }

    const shapes = [0, 1, 2].map((variant) => {
        const path = snowflakePath(variant);
        return `<svg class="christmas-snowflake" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
            <path d="${path}" fill="none" stroke="#8da6b8" stroke-width="2.9" stroke-opacity=".8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="${path}" fill="none" stroke="#f9fdff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    });

    function syncSnowfall() {
        const profile = reducedMotion.matches ? 'off'
            : mobile.matches || lightDevice ? 'mobile' : tablet.matches ? 'tablet' : 'desktop';
        if (profile === currentProfile) return;
        currentProfile = profile;
        snowfall?.remove();
        snowfall = null;
        if (profile === 'off') return;

        const counts = { desktop: [6, 15, 7], tablet: [4, 10, 4], mobile: [2, 6, 2] }[profile];
        const layers = counts.flatMap((count, layer) => Array(count).fill(layer));
        const phases = layers.map((_, index) => (index + Math.random()) / layers.length);
        for (let i = layers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [layers[i], layers[j]] = [layers[j], layers[i]];
            const phaseIndex = Math.floor(Math.random() * (i + 1));
            [phases[i], phases[phaseIndex]] = [phases[phaseIndex], phases[i]];
        }
        snowfall = document.createElement('div');
        snowfall.className = 'christmas-snowfall';
        snowfall.dataset.profile = profile;
        snowfall.setAttribute('aria-hidden', 'true');
        snowfall.setAttribute('inert', '');
        const fragment = document.createDocumentFragment();
        const ranges = [
            { size: [10, 14], duration: [14, 22], opacity: [0.45, 0.58] },
            { size: [16, 22], duration: [11, 18], opacity: [0.58, 0.74] },
            { size: [24, 32], duration: [9, 15], opacity: [0.62, 0.8] }
        ];
        const random = ([min, max]) => min + Math.random() * (max - min);
        layers.forEach((layer, index) => {
            const range = ranges[layer];
            const duration = random(range.duration) * (profile === 'mobile' ? 1.18 : 1);
            const flake = document.createElement('span');
            flake.className = 'christmas-snowfall__fall';
            flake.dataset.depth = ['far', 'middle', 'near'][layer];
            const vars = {
                '--snow-x': `${((index + 0.25 + Math.random() * 0.5) / layers.length * 100).toFixed(2)}%`,
                '--snow-size': `${random(range.size).toFixed(1)}px`,
                '--snow-opacity': random(range.opacity).toFixed(2),
                '--snow-duration': `${duration.toFixed(2)}s`,
                '--snow-delay': `${(-phases[index] * duration).toFixed(2)}s`,
                '--snow-drift': `${(profile === 'mobile' ? 6 + Math.random() * 6 : 8 + Math.random() * 14).toFixed(1)}px`,
                '--snow-sway-duration': `${(4 + Math.random() * 3).toFixed(2)}s`,
                '--snow-spin-duration': `${(24 + Math.random() * 18).toFixed(2)}s`
            };
            Object.entries(vars).forEach(([key, value]) => flake.style.setProperty(key, value));
            flake.innerHTML = `<span class="christmas-snowfall__drift">${shapes[index % shapes.length]}</span>`;
            fragment.appendChild(flake);
        });
        snowfall.appendChild(fragment);
        document.body.appendChild(snowfall);
    }

    function syncVisibility() {
        document.documentElement.classList.toggle('christmas-effects-paused', document.hidden);
    }

    function init() {
        decorateBrands();
        syncSnowfall();
        syncVisibility();
        [mobile, tablet, reducedMotion].forEach((query) => query.addEventListener('change', syncSnowfall));
        document.addEventListener('visibilitychange', syncVisibility);
    }

    // Deferred script runs after parsing. Register after seo-page.js has registered its header setup.
    if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
