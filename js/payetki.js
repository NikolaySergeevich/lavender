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

    const OFFER_CONTEXTS = {
        special_offer_consultation: {
            offerType: 'special_offer_consultation',
            offerName: 'Подбор специального предложения',
            offerValue: 'manager_selects_best_offer',
            availableOfferTypes: 'early_booking_gift,bundle_discount,available_date_offer',
            formTitle: 'Узнайте, какое предложение доступно для вашего события',
            formDescription: 'Укажите дату и расскажите, что планируете оформить. Менеджер проверит условия раннего бронирования, комплексного заказа и доступность выбранной даты.',
            submitLabel: 'Получить предложение',
            requiresEventDate: true
        }
    };

    function setFormFieldValue(form, name, value) {
        const field = form?.querySelector(`[name="${name}"]`);
        if (field) field.value = value || '';
    }

    function getLocalDate(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
        if (!match) return null;
        const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        if (
            date.getFullYear() !== Number(match[1])
            || date.getMonth() !== Number(match[2]) - 1
            || date.getDate() !== Number(match[3])
        ) {
            return null;
        }
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function getEarlyBookingEligibility(value) {
        const eventDate = getLocalDate(value);
        if (!eventDate) return '';
        const today = new Date();
        const threshold = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        threshold.setDate(threshold.getDate() + 30);
        return eventDate >= threshold ? 'yes' : 'no';
    }

    function syncOfferDateContext(form, showMessage) {
        const dateValue = form?.querySelector('[name="date"]')?.value || '';
        const isSpecialOffer = form?.dataset.specialOfferConsultation === 'true';
        const isOfferDateRequired = form?.dataset.offerRequiresEventDate === 'true';
        const status = form?.querySelector('.payetki-form__offer-status');
        setFormFieldValue(form, 'event_date', dateValue);
        setFormFieldValue(form, 'early_booking_eligible', isSpecialOffer
            ? getEarlyBookingEligibility(dateValue)
            : '');

        if (!status) return;
        status.textContent = '';
        status.dataset.state = '';
        if (isSpecialOffer && dateValue) {
            if (getEarlyBookingEligibility(dateValue) === 'yes') {
                status.textContent = 'Дата позволяет проверить возможность подарочного декора. Менеджер уточнит состав оформления и доступность декора.';
                status.dataset.state = 'success';
            } else {
                status.textContent = 'До мероприятия меньше 30 дней. Менеджер проверит комплексное предложение и условия на свободную дату.';
                status.dataset.state = 'notice';
            }
        } else if (isOfferDateRequired && showMessage && !dateValue) {
            status.textContent = 'Укажите дату мероприятия, чтобы проверить условия предложения.';
            status.dataset.state = 'notice';
        }
    }

    function applyServerOfferContext(form, offerContext) {
        if (!form || !offerContext || typeof offerContext !== 'object') return;
        [
            'offer_type',
            'offer_name',
            'offer_value',
            'available_offer_types',
            'offer_page',
            'offer_location',
            'event_date',
            'requested_services',
            'early_booking_eligible'
        ].forEach(function (name) {
            if (Object.prototype.hasOwnProperty.call(offerContext, name)) {
                setFormFieldValue(form, name, String(offerContext[name] ?? ''));
            }
        });
    }

    function isTrackedOffer(offerType) {
        return offerType === 'special_offer_consultation';
    }

    function pushOfferEvent(eventName, context) {
        if (!isTrackedOffer(context?.offerType)) return;
        const eventData = {
            event: eventName,
            offer_type: context.offerType,
            offer_page: context.offerPage || pagePath,
            page_path: pagePath
        };
        if (context.offerName) eventData.offer_name = context.offerName;
        if (context.offerLocation) eventData.offer_location = context.offerLocation;
        if (context.offerValue) eventData.offer_value = context.offerValue;
        if (context.availableOfferTypes) eventData.available_offer_types = context.availableOfferTypes;
        if (context.target) eventData.target = context.target;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(eventData);
        console.info(`dataLayer ${eventName}:`, eventData);
    }

    function observeSpecialOffer(block) {
        if (!block || !('IntersectionObserver' in window)) return;
        let timer = null;
        const offerObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (block.dataset.offerViewed === 'true') return;
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    if (timer) return;
                    block.dataset.offerVisible = 'true';
                    timer = window.setTimeout(function () {
                        if (block.dataset.offerVisible !== 'true' || block.dataset.offerViewed === 'true') return;
                        block.dataset.offerViewed = 'true';
                        pushOfferEvent('offer_view', {
                            offerType: block.dataset.offerType,
                            offerName: block.dataset.offerName,
                            offerValue: block.dataset.offerValue,
                            offerPage: pagePath,
                            offerLocation: block.dataset.offerLocation,
                            availableOfferTypes: block.dataset.availableOfferTypes
                        });
                        offerObserver.unobserve(block);
                    }, 1000);
                } else {
                    block.dataset.offerVisible = 'false';
                    if (timer) {
                        window.clearTimeout(timer);
                        timer = null;
                    }
                }
            });
        }, { threshold: [0, 0.5] });
        offerObserver.observe(block);
    }

    function trackYandexGoal(goal, params) {
        if (typeof window.ym === 'function') {
            window.ym(109623826, 'reachGoal', goal, params || {});
        }
    }

    function pushGenerateLeadEvent(form) {
        const selectedColor = form.querySelector('[name="selected_color"]')?.value || 'Не определился';
        const selectedProject = form.querySelector('[name="selected_project"]')?.value || 'Стена из пайеток';
        const eventData = {
            event: 'generate_lead',
            lead_source: 'payetki_landing',
            form_name: 'payetki_booking_form',
            selected_color: selectedColor,
            selected_project: selectedProject,
            form_location: form.querySelector('[name="form_location"]')?.value || 'payetki_project_page',
            page_path: pagePath
        };
        const offerType = form.querySelector('[name="offer_type"]')?.value || '';
        const offerName = form.querySelector('[name="offer_name"]')?.value || '';
        const offerValue = form.querySelector('[name="offer_value"]')?.value || '';
        const availableOfferTypes = form.querySelector('[name="available_offer_types"]')?.value || '';
        const offerPage = form.querySelector('[name="offer_page"]')?.value || '';
        const offerLocation = form.querySelector('[name="offer_location"]')?.value || '';
        const eventDate = form.querySelector('[name="event_date"]')?.value || '';
        const earlyBookingEligible = form.querySelector('[name="early_booking_eligible"]')?.value || '';
        const requestedServices = form.querySelector('[name="requested_services"]')?.value || '';
        if (offerType) {
            eventData.offer_type = offerType;
            eventData.offer_name = offerName;
            eventData.offer_value = offerValue;
            eventData.available_offer_types = availableOfferTypes;
            eventData.offer_page = offerPage;
            eventData.offer_location = offerLocation;
            eventData.event_date = eventDate;
            eventData.requested_services = requestedServices;
            eventData.early_booking_eligible = earlyBookingEligible;
        }

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

    function setProjectContext() {
        document.querySelectorAll('.payetki-form').forEach(function (form) {
            const projectUrl = form.querySelector('[name="project_url"]');
            if (projectUrl) projectUrl.value = window.location.href;
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

    function openModal(selectedColor, source, formLocation, context = {}) {
        if (!modal) return;

        lastFocusedElement = document.activeElement;
        const modalForm = modal.querySelector('.payetki-form');
        const modalSuccess = modal.querySelector('.payetki-form__success');
        const modalTitle = modal.querySelector('#payetki-modal-title');
        const modalDescription = modal.querySelector('.payetki-modal__heading p');
        const modalSubmitButton = modalForm?.querySelector('[type="submit"]');
        const modalDate = modalForm?.querySelector('[name="date"]');
        if (modalColor && selectedColor) modalColor.value = selectedColor;
        setFormFieldValue(modalForm, 'source', source || 'Модальная форма — аренда пайеток');
        setFormFieldValue(modalForm, 'form_location', formLocation || 'payetki_project_page');
        setFormFieldValue(modalForm, 'offer_type', context.offerType || '');
        setFormFieldValue(modalForm, 'offer_name', context.offerName || '');
        setFormFieldValue(modalForm, 'offer_value', context.offerValue || '');
        setFormFieldValue(modalForm, 'available_offer_types', context.availableOfferTypes || '');
        setFormFieldValue(modalForm, 'offer_page', context.offerPage || '');
        setFormFieldValue(modalForm, 'offer_location', context.offerLocation || '');
        setFormFieldValue(modalForm, 'event_date', '');
        setFormFieldValue(modalForm, 'early_booking_eligible', '');
        setFormFieldValue(modalForm, 'product_type', context.productType || 'Стена из пайеток');
        setFormFieldValue(modalForm, 'selected_project', context.selectedProject || 'Стена из пайеток');
        setFormFieldValue(modalForm, 'project_id', context.projectId || 'payetki-wall');
        setFormFieldValue(modalForm, 'project_category', context.projectCategory || 'Аренда пайеток');
        setFormFieldValue(modalForm, 'project_url', context.projectUrl || window.location.href);
        modalForm.dataset.specialOfferConsultation = context.offerType === 'special_offer_consultation' ? 'true' : 'false';
        modalForm.dataset.offerRequiresEventDate = context.requiresEventDate === true ? 'true' : 'false';
        const modalServices = modalForm?.querySelector('[name="requested_services"]');
        if (modalServices) modalServices.value = context.requestedServices || 'Пока не определились';
        if (modalDate) {
            modalDate.value = '';
            modalDate.required = true;
        }
        if (modalTitle) modalTitle.textContent = context.formTitle || 'Проверить свободную дату';
        if (modalDescription) {
            modalDescription.textContent = context.formDescription
                || 'Укажите контакты, дату и цвет — уточним доступность и поможем с комплектацией.';
        }
        if (modalSubmitButton) modalSubmitButton.textContent = context.submitLabel || 'Проверить дату';
        modalForm.hidden = false;
        if (modalSuccess) modalSuccess.hidden = true;
        syncOfferDateContext(modalForm, context.requiresEventDate === true);

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('payetki-modal-open');
        modalClose?.focus();
        trackYandexGoal('form_open', {
            source: modalForm?.querySelector('[name="source"]')?.value || 'Пайетки — модальная форма',
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
            const offerType = button.getAttribute('data-offer-type') || '';
            const baseContext = OFFER_CONTEXTS[offerType] || {};
            const context = {
                ...baseContext,
                offerType,
                offerName: button.getAttribute('data-offer-name') || baseContext.offerName || '',
                offerValue: button.getAttribute('data-offer-value') || baseContext.offerValue || '',
                availableOfferTypes: button.getAttribute('data-available-offer-types') || baseContext.availableOfferTypes || '',
                offerPage: button.getAttribute('data-offer-page') || (offerType ? pagePath : ''),
                offerLocation: button.getAttribute('data-offer-location') || '',
                requiresEventDate: button.getAttribute('data-requires-event-date') === 'true'
                    || baseContext.requiresEventDate === true,
                selectedProject: button.getAttribute('data-selected-project') || '',
                projectId: button.getAttribute('data-project-id') || '',
                projectCategory: button.getAttribute('data-project-category') || '',
                productType: button.getAttribute('data-product-type') || '',
                projectUrl: window.location.href
            };
            pushOfferEvent('offer_click', context);
            openModal(
                button.getAttribute('data-color') || 'Не определился',
                button.getAttribute('data-source') || 'CTA — аренда пайеток',
                button.hasAttribute('data-color')
                    ? 'payetki_project_card'
                    : button.hasAttribute('data-offer-type')
                        ? 'payetki_special_offer'
                        : 'payetki_project_page',
                context
            );
        });
    });

    document.querySelectorAll('[data-offer-teaser]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            const targetSelector = link.getAttribute('href') || '#special-offer';
            const target = document.querySelector(targetSelector);
            pushOfferEvent('offer_teaser_click', {
                offerType: 'special_offer_consultation',
                offerPage: pagePath,
                offerLocation: link.getAttribute('data-offer-location') || 'payetki_hero',
                target: targetSelector
            });
            if (!target) return;

            event.preventDefault();
            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
            target.focus({ preventScroll: true });
            window.history.pushState(null, '', targetSelector);
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
        syncOfferDateContext(form, true);
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

            applyServerOfferContext(form, result.offer_context);
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
        form.querySelector('[name="date"]')?.addEventListener('input', function () {
            syncOfferDateContext(form);
        });
        form.querySelector('[name="date"]')?.addEventListener('change', function () {
            syncOfferDateContext(form);
        });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            syncOfferDateContext(form, true);
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
    setProjectContext();
    setMinimumDates();
    observeSpecialOffer(document.querySelector('[data-special-offer]'));
})();
