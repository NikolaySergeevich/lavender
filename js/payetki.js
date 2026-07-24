(function () {
    'use strict';

    const pagePath = window.location.pathname;
    const heroImage = document.getElementById('payetki-hero-image');
    const heroSwitches = document.querySelectorAll('[data-hero-image]');
    const modal = document.getElementById('payetki-modal');
    const modalDialog = modal?.querySelector('[role="document"]');
    const modalClose = modal?.querySelector('[data-modal-close]');
    const modalColor = document.getElementById('payetki-modal-color');
    const forms = document.querySelectorAll('.payetki-form');
    let lastFocusedElement = null;
    window.__lavdragonMessengerTrackingInitialized = true;

    function trackYandexGoal(goal, params) {
        if (typeof window.ym === 'function') {
            window.ym(109623826, 'reachGoal', goal, params || {});
        }
    }

    function pushGenerateLeadEvent(form) {
        const selectedColor = form.querySelector('[name="selected_color"]')?.value || 'Не определился';
        const eventData = {
            event: 'generate_lead',
            lead_source: 'payetki_landing',
            form_name: 'payetki_booking_form',
            selected_color: selectedColor,
            page_path: pagePath
        };

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(eventData);
        console.info('dataLayer generate_lead:', eventData);
    }

    function trackMessengerClick(link) {
        const href = link.getAttribute('href') || '';
        const eventData = {
            event: 'messenger_click',
            messenger: href.includes('t.me/') ? 'telegram' : 'instagram',
            click_location: link.getAttribute('data-analytics-location') || 'unknown',
            link_url: href,
            page_path: pagePath
        };

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(eventData);
        console.info('dataLayer messenger_click:', eventData);
        trackYandexGoal('telegram_click', { href: href, location: eventData.click_location });
    }

    document.addEventListener('click', function (event) {
        if (!(event.target instanceof Element)) return;
        const messengerLink = event.target.closest('a[href*="t.me/"], a[href*="instagram.com/"], a[href*="instagr.am/"]');
        if (messengerLink) trackMessengerClick(messengerLink);

        const phoneLink = event.target.closest('a[href^="tel:"]');
        if (phoneLink) {
            const phoneEvent = {
                event: 'phone_click',
                click_location: phoneLink.getAttribute('data-analytics-location') || 'unknown',
                link_url: phoneLink.getAttribute('href') || '',
                page_path: pagePath
            };
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(phoneEvent);
            trackYandexGoal('phone_click', {
                href: phoneEvent.link_url,
                location: phoneEvent.click_location
            });
            console.info('dataLayer phone_click:', phoneEvent);
        }
    });

    heroSwitches.forEach(function (button) {
        button.addEventListener('click', function () {
            if (!heroImage) return;

            const nextSource = button.getAttribute('data-hero-image');
            const nextAlt = button.getAttribute('data-hero-alt') || '';
            if (!nextSource || heroImage.getAttribute('src') === nextSource) return;

            heroSwitches.forEach(function (item) {
                item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
            });

            heroImage.classList.add('is-changing');
            const preload = new Image();
            preload.onload = function () {
                heroImage.src = nextSource;
                heroImage.alt = nextAlt;
                requestAnimationFrame(function () {
                    heroImage.classList.remove('is-changing');
                });
            };
            preload.onerror = function () {
                heroImage.classList.remove('is-changing');
            };
            preload.src = nextSource;
        });
    });

    function setFormPagePaths() {
        document.querySelectorAll('[name="page_path"]').forEach(function (field) {
            field.value = pagePath;
        });
    }

    function setMinimumDates() {
        const today = new Date();
        const offset = today.getTimezoneOffset();
        const localToday = new Date(today.getTime() - offset * 60000).toISOString().split('T')[0];
        document.querySelectorAll('input[type="date"]').forEach(function (field) {
            field.min = localToday;
        });
    }

    function openModal(selectedColor, source) {
        if (!modal) return;

        lastFocusedElement = document.activeElement;
        if (modalColor && selectedColor) modalColor.value = selectedColor;
        const sourceField = modal.querySelector('[name="source"]');
        if (sourceField) sourceField.value = source || 'Модальная форма — аренда пайеток';

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('payetki-modal-open');
        modalClose?.focus();
        trackYandexGoal('form_open', {
            source: sourceField?.value || 'Пайетки — модальная форма',
            selected_color: modalColor?.value || 'Не определился'
        });
    }

    function closeModal() {
        if (!modal?.classList.contains('is-open')) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('payetki-modal-open');
        if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
    }

    document.querySelectorAll('[data-open-booking]').forEach(function (button) {
        button.addEventListener('click', function () {
            openModal(
                button.getAttribute('data-color') || 'Не определился',
                button.getAttribute('data-source') || 'CTA — аренда пайеток'
            );
        });
    });

    modalClose?.addEventListener('click', closeModal);
    modal?.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal?.classList.contains('is-open')) {
            closeModal();
        }

        if (event.key !== 'Tab' || !modal?.classList.contains('is-open') || !modalDialog) return;
        const focusable = Array.from(modalDialog.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
        ));
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    async function submitForm(form, submitButton) {
        const originalText = submitButton?.textContent || '';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка…';
        }

        trackYandexGoal('form_submit', {
            source: form.querySelector('[name="source"]')?.value || 'Пайетки — форма',
            selected_color: form.querySelector('[name="selected_color"]')?.value || 'Не определился'
        });

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const result = await response.json();

            if (!response.ok || result.success !== true) {
                throw new Error(result.message || 'Не удалось отправить заявку.');
            }

            pushGenerateLeadEvent(form);
            if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
            trackYandexGoal('lead_submit', {
                source: 'payetki_landing',
                selected_color: form.querySelector('[name="selected_color"]')?.value || 'Не определился'
            });

            form.hidden = true;
            const success = form.parentElement?.querySelector('.payetki-form__success');
            if (success) {
                success.hidden = false;
                success.setAttribute('tabindex', '-1');
                success.focus();
            }
            form.reset();
            setFormPagePaths();
        } catch (error) {
            console.error('Ошибка отправки формы пайеток:', error);
            window.alert(error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    }

    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            submitForm(form, event.submitter || form.querySelector('[type="submit"]'));
        });
    });

    document.querySelectorAll('.payetki-faq details').forEach(function (details) {
        details.addEventListener('toggle', function () {
            if (!details.open) return;
            document.querySelectorAll('.payetki-faq details[open]').forEach(function (other) {
                if (other !== details) other.open = false;
            });
        });
    });

    setFormPagePaths();
    setMinimumDates();
})();
