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
