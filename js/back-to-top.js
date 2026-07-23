(function () {
    const style = document.createElement('style');
    style.textContent = `
        .back-to-top {
            position: fixed;
            right: 20px;
            bottom: 24px;
            z-index: 55;
            width: 48px;
            height: 48px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(201, 206, 214, 0.95);
            border-radius: 999px;
            color: #08090D;
            background:
                linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.08)),
                #F4F5F7;
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.78),
                inset 0 -1px 0 rgba(8,9,13,0.08),
                0 12px 24px rgba(8,9,13,0.14);
            opacity: 0;
            visibility: hidden;
            transform: translateY(12px);
            transition: opacity 0.24s ease, visibility 0.24s ease, transform 0.24s ease, border-color 0.24s ease, background 0.24s ease;
        }
        .back-to-top.is-visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .back-to-top:hover,
        .back-to-top:focus-visible {
            border-color: rgba(185,167,216,0.95);
            background:
                linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.08)),
                #D9D1E8;
            outline: none;
        }
        .back-to-top svg {
            width: 22px;
            height: 22px;
        }
        @media (max-width: 768px) {
            .back-to-top {
                right: 16px;
                bottom: 86px;
                width: 46px;
                height: 46px;
            }
        }
    `;
    document.head.appendChild(style);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Вернуться наверх страницы');
    button.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
        </svg>
    `;
    document.body.appendChild(button);

    function updateVisibility() {
        button.classList.toggle('is-visible', window.scrollY > 420);
    }

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
})();

(function () {
    if (window.__lavdragonMessengerTrackingInitialized) return;
    window.__lavdragonMessengerTrackingInitialized = true;

    function detectMessenger(url) {
        const normalizedUrl = String(url || '').trim().toLowerCase();

        if (
            normalizedUrl.includes('t.me') ||
            normalizedUrl.includes('telegram.me') ||
            normalizedUrl.startsWith('tg:')
        ) {
            return 'telegram';
        }

        if (
            normalizedUrl.includes('viber.com') ||
            normalizedUrl.startsWith('viber:')
        ) {
            return 'viber';
        }

        if (
            normalizedUrl.includes('wa.me') ||
            normalizedUrl.includes('api.whatsapp.com') ||
            normalizedUrl.startsWith('whatsapp:')
        ) {
            return 'whatsapp';
        }

        if (
            normalizedUrl.includes('instagram.com') ||
            normalizedUrl.includes('instagr.am')
        ) {
            return 'instagram';
        }

        return 'unknown';
    }

    function detectClickLocation(element) {
        const analyticsElement = element.closest('[data-analytics-location]');
        if (analyticsElement) {
            return analyticsElement.getAttribute('data-analytics-location') || 'unknown';
        }

        const locationSelectors = [
            ['#mobile-menu, .mobile-menu', 'mobile_menu'],
            ['[role="dialog"], [id*="modal"], [class*="modal"]', 'modal'],
            ['#sticky-cta, .chat-bubble, .floating-button, .floating-btn', 'floating_button'],
            ['footer', 'footer'],
            ['#contact, .quick-contact, .contact-section', 'quick_contact'],
            ['#portfolio, .portfolio, .portfolio-card', 'portfolio'],
            ['#pricing, .pricing', 'pricing'],
            ['form, .lead-form', 'lead_form'],
            ['header, .seo-hero, #hero, .hero', 'hero'],
            ['nav, #navbar, .seo-nav, .site-header', 'header'],
            ['section', 'quick_contact']
        ];

        for (const [selector, location] of locationSelectors) {
            if (element.closest(selector)) return location;
        }

        return 'unknown';
    }

    document.addEventListener('click', function (event) {
        if (!(event.target instanceof Element)) return;

        const messengerElement = event.target.closest('a[href], [data-messenger-url]');
        if (!messengerElement) return;

        const linkUrl = messengerElement.getAttribute('href') ||
            messengerElement.getAttribute('data-messenger-url') ||
            '';
        const messengerName = detectMessenger(linkUrl);
        if (messengerName === 'unknown') return;

        const messengerClickEvent = {
            event: 'messenger_click',
            messenger: messengerName,
            click_location: detectClickLocation(messengerElement),
            link_url: linkUrl,
            page_path: window.location.pathname
        };

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(messengerClickEvent);
        console.info('dataLayer messenger_click:', messengerClickEvent);
    });
})();
