(function () {
    'use strict';

    // The form, gallery and FAQ continue to use seo-page.js and seo-lightbox.js.
    const menu = document.querySelector('.new-year-nav-menu');
    menu?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => { menu.open = false; });
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu?.open) {
            menu.open = false;
            menu.querySelector('summary').focus();
        }
    });

    if (!('IntersectionObserver' in window)
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.body.classList.add('new-year-motion');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.new-year-page .reveal').forEach((item) => observer.observe(item));
})();
