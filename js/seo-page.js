(function () {
    'use strict';

    const scriptSource = document.currentScript?.src || '';
    const OFFER_LIBRARY = {
        early_booking_gift: {
            type: 'early_booking_gift',
            name: 'Декор до 100 BYN за раннее бронирование',
            value: 'decor_up_to_100_byn',
            eyebrow: 'При раннем бронировании',
            title: 'Декор до 100 BYN в подарок',
            text: 'При бронировании минимум за 30 календарных дней — персональная надпись или дополнительный декоративный элемент к фотозоне.',
            note: 'До 100 BYN — это стоимость декора, а не денежная скидка. Подарок согласуется с концепцией и доступным ассортиментом, является частью заказа, не обменивается на деньги; точный элемент фиксируем в смете.'
        },
        bundle_discount: {
            type: 'bundle_discount',
            name: 'Скидка 10% на дополнительную зону',
            value: '10_percent_additional_zone',
            eyebrow: 'При комплексном заказе',
            title: '−10% на дополнительную зону',
            text: 'При заказе фотозоны вместе с welcome-зоной, входной группой или оформлением зала.',
            note: 'Скидка применяется только к дополнительной зоне и не распространяется автоматически на весь заказ; состав и стоимость фиксируются в расчёте.'
        },
        available_date_offer: {
            type: 'available_date_offer',
            name: 'Специальное предложение на свободную дату',
            value: 'individual_date_offer',
            eyebrow: 'Для отдельных свободных дат',
            title: 'Специальные условия на свободную дату',
            text: 'Проверим доступность команды и актуальное предложение на дату вашего мероприятия.',
            note: 'Условия зависят от реальной доступности команды; фиксированную сумму или процент заранее не показываем.'
        }
    };
    const SPECIAL_OFFER = {
        type: 'special_offer_consultation',
        name: 'Подбор специального предложения',
        value: 'manager_selects_best_offer',
        formTitle: 'Узнайте, какое предложение доступно для вашего события',
        formDescription: 'Укажите дату и расскажите, что планируете оформить. Менеджер проверит условия раннего бронирования, комплексного заказа и доступность выбранной даты.',
        submitLabel: 'Получить предложение'
    };

    function start() {
        if (!document.querySelector('.seo-nav') || document.body.classList.contains('payetki-page')) {
            return;
        }

        document.body.classList.add('seo-standard-page');

        const siteRoot = scriptSource ? new URL('../', scriptSource) : new URL('/', window.location.href);
        const path = window.location.pathname.toLowerCase();
        const page = getPageConfig(path);
        const projectModal = createProjectInquiryModal(page, siteRoot);

        enhanceNavigation(page, projectModal);
        const hero = enhanceHero(page, siteRoot, projectModal);
        const gallery = enhanceGallery(page, siteRoot, projectModal);
        enhanceSections();
        enhanceFaq(page);
        addBenefits(hero);
        addProjectDetailCta(page, projectModal);
        const specialOfferSection = addInlineCtas(gallery, page, projectModal);
        addOfferTeaser(hero, page, specialOfferSection);
        addRelated(page, siteRoot);
        addFinalCta(page, projectModal);
        addFooter(siteRoot);
        addMobileContact(page, projectModal);
        bindGeneralInquiryCtas(projectModal);
        optimizeImages(hero);
    }

    function getPageConfig(path) {
        const configs = [
            {
                match: 'arenda-cifr-na-prazdnik-minsk',
                label: 'Аренда декора',
                category: 'Аренда цифр',
                image: 'picture/numbers/arenda-cifr-50-let-minsk.webp',
                imageAlt: 'Светящиеся цифры 50 перед серебряной панелью с бело-золотой гирляндой из шаров',
                offerKeys: ['bundle_discount', 'available_date_offer'],
                offerOverrides: {
                    bundle_discount: {
                        title: 'Комплект с цифрами, шарами и фотозоной',
                        text: 'Если заказываете цифры вместе с шарами или фотозоной, соберём единый проект и проверим возможность скидки 10% на дополнительную зону.',
                        note: 'Скидка применяется только к дополнительной зоне и не распространяется автоматически на весь заказ; состав и стоимость фиксируются в расчёте. Отдельная аренда цифр оформляется без подарка.'
                    }
                }
            },
            {
                match: 'ceny-na-fotazony-minsk',
                label: 'Стоимость оформления',
                image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-kryg.webp',
                imageAlt: 'Круглая уличная фотозона с бело-золотыми шарами, поздравлением и числом 45',
                offerKeys: ['available_date_offer'],
                projectCategory: 'Фотозоны'
            },
            {
                match: 'dekor-svadby-minsk',
                label: 'Свадебный декор',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-kompoziciya.webp',
                imageAlt: 'Бежевая свадебная фотозона с круглыми панелями, розами, эвкалиптом и свечами',
                offerKeys: ['early_booking_gift', 'bundle_discount', 'available_date_offer'],
                eventType: 'Свадьба',
                projectCategory: 'Свадьба'
            },
            {
                match: 'fotazona-na-korporativ-minsk',
                label: 'Корпоративные события',
                image: 'picture/korporativ/fotozona-na-korporativ-minsk-zerkalo-tsvety.webp',
                imageAlt: 'Дизайнерская фотозона с зеркалом и цветами на корпоратив в Минске',
                offerKeys: ['early_booking_gift', 'bundle_discount', 'available_date_offer'],
                eventType: 'Корпоратив',
                projectCategory: 'Корпоратив'
            },
            {
                match: 'fotazona-na-yubiley-minsk',
                label: 'Юбилеи',
                image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-scena.webp',
                imageAlt: 'Бежевая фотозона с перламутровыми шарами, бусами и светящейся надписью It’s my birthday',
                offerKeys: ['early_booking_gift', 'available_date_offer'],
                eventType: 'Юбилей',
                projectCategory: 'Юбилей'
            },
            {
                match: 'fotazony-dlya-detskih-prazdnikov-minsk',
                label: 'Детские праздники',
                image: 'picture/children-parties/detskaya-fotozona-minsk-pink.webp',
                imageAlt: 'Розово-жёлтая фотозона на годик с шарами, ромашками, креслом и объёмной цифрой один',
                offerKeys: ['early_booking_gift', 'available_date_offer'],
                eventType: 'Детский праздник',
                projectCategory: 'Детский праздник'
            },
            {
                match: 'fotazony-na-den-rozhdeniya-minsk',
                label: 'Дни рождения',
                image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-kryg.webp',
                imageAlt: 'Круглая уличная фотозона с бело-золотыми шарами, поздравлением и числом 45',
                offerKeys: ['early_booking_gift', 'available_date_offer'],
                eventType: 'День рождения',
                projectCategory: 'День рождения'
            },
            {
                match: 'fotazony-na-svadbu-minsk',
                label: 'Свадебные фотозоны',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-cvety.webp',
                imageAlt: 'Золотые прямоугольные рамы с белой драпировкой, розами и свечами',
                offerKeys: ['early_booking_gift', 'bundle_discount', 'available_date_offer'],
                eventType: 'Свадьба',
                projectCategory: 'Свадьба'
            },
            {
                match: 'gender-party-minsk',
                label: 'Gender party',
                image: 'picture/gender-party/gender-party-baby-butterfly-firework.webp',
                imageAlt: 'Светящиеся буквы BABY и бабочки на фоне розового пиротехнического фонтана в сумерках',
                offerKeys: ['early_booking_gift', 'available_date_offer'],
                eventType: 'Gender party',
                projectCategory: 'Gender party'
            },
            {
                match: 'oformlenie-zala-minsk',
                label: 'Оформление мероприятий',
                image: 'picture/hall-decoration/decoration-minsk-service-rose.webp',
                imageAlt: 'Розовые розы и горящие белые свечи вдоль длинного праздничного стола',
                offerKeys: ['early_booking_gift', 'bundle_discount', 'available_date_offer'],
                eventType: 'Другое',
                projectCategory: 'Оформление мероприятий'
            },
            {
                match: 'svadebnaya-fotozona-v-bezhevyh-tonah-minsk',
                label: 'Реализованный проект',
                category: 'Свадьба',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-cvety.webp',
                imageAlt: 'Золотые прямоугольные рамы с белой драпировкой, розами и свечами'
            },
            {
                match: 'skolko-stoit-fotozona-minsk-2026',
                label: 'Гид по стоимости',
                image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-stil.webp',
                imageAlt: 'Изумрудная фотозона с красно-белыми цветами, чёрно-золотыми шарами и табличкой Happy Birthday',
                works: 'ceny-na-fotazony-minsk/',
                offerKeys: ['available_date_offer'],
                compactOffers: true
            },
            {
                match: 'trendy-svadebnogo-dekora-2026',
                label: 'Тренды и идеи',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-bloom.webp',
                imageAlt: 'Белая свадебная фотозона с цветочной аркой, креслами и тёплой гирляндой',
                works: 'fotazony-na-svadbu-minsk/',
                offerKeys: ['available_date_offer'],
                compactOffers: true
            },
            {
                match: 'kak-vybrat-fotozonu-na-svadbu',
                label: 'Практический гид',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-kompoziciya.webp',
                imageAlt: 'Бежевая свадебная фотозона с круглыми панелями, розами, эвкалиптом и свечами',
                works: 'fotazony-na-svadbu-minsk/',
                offerKeys: ['available_date_offer'],
                compactOffers: true
            },
            {
                match: 'idei-fotozon-dlya-yubileya',
                label: 'Подборка идей',
                image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-scena.webp',
                imageAlt: 'Бежевая фотозона с перламутровыми шарами, бусами и светящейся надписью It’s my birthday',
                works: 'fotazona-na-yubiley-minsk/',
                offerKeys: ['available_date_offer'],
                compactOffers: true
            },
            {
                match: 'oformlenie-svadby-na-50-gostey',
                label: 'Планирование свадьбы',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-sad.webp',
                imageAlt: 'Стол молодожёнов с белой драпировкой, жемчужными нитями и деревьями в кашпо',
                works: 'dekor-svadby-minsk/',
                offerKeys: ['available_date_offer'],
                compactOffers: true
            },
            {
                match: '/blog/',
                label: 'Журнал LavDragon',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-dofamin.webp',
                imageAlt: 'Яркий банкетный стол с синими гортензиями, красными цветами и космическим фоном',
                works: 'fotazony-na-svadbu-minsk/',
                offerKeys: ['available_date_offer'],
                compactOffers: true
            }
        ];

        const page = configs.find((config) => path.includes(config.match)) || {
            label: 'LavDragon · Минск',
            image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-stil.webp',
            imageAlt: 'Изумрудная фотозона с красно-белыми цветами, чёрно-золотыми шарами и табличкой Happy Birthday'
        };
        return hydratePageOffers(page);
    }

    function hydratePageOffers(page) {
        const overrides = page.offerOverrides || {};
        const keys = Array.isArray(page.offerKeys) ? page.offerKeys : [];
        const offers = keys.map((key) => createOffer(key, page, overrides[key] || {}));

        return {
            ...page,
            offers
        };
    }

    function createOffer(key, page, overrides = {}) {
        const base = OFFER_LIBRARY[key];
        if (!base) return null;
        return {
            ...base,
            ...overrides,
            type: base.type,
            name: base.name,
            value: base.value,
            eventType: overrides.eventType || page.eventType || '',
            projectCategory: overrides.projectCategory
                || page.projectCategory
                || page.category
                || page.label
                || 'Фотозоны'
        };
    }

    function enhanceNavigation(page, projectModal) {
        const nav = document.querySelector('.seo-nav');
        if (!nav) return;

        const homeLink = nav.querySelector('a[href="../"], a[href="../../"], a[href="/"]');
        if (homeLink) {
            const homeUrl = homeLink.href;
            homeLink.classList.add('brand-lockup', 'seo-brand-lockup');
            homeLink.setAttribute('aria-label', 'Lavdragon — на главную');
            homeLink.innerHTML = `
                <img src="${new URL('lavdr.ico', homeUrl).href}" width="34" height="34"
                    alt="" class="brand-logo" aria-hidden="true">
                <span class="font-serif text-2xl font-bold tracking-tight">Lavdragon</span>
            `;
        }

        const action = Array.from(nav.querySelectorAll('a')).find((link) => {
            const href = link.getAttribute('href') || '';
            return href.includes('t.me/');
        });

        if (action) {
            action.classList.add('seo-nav__action');
            action.setAttribute('data-analytics-location', action.getAttribute('data-analytics-location') || 'header');
            const project = getPageProject(page);
            bindInquiryTrigger(action, projectModal, project, {
                source: project ? 'Страница проекта' : 'Шапка сайта',
                formLocation: project ? 'seo_project_page' : 'seo_header'
            });
        }
    }

    function enhanceHero(page, siteRoot, projectModal) {
        let hero = document.querySelector('.seo-hero');
        if (!hero) return null;

        if (hero.tagName === 'ARTICLE' && hero.classList.contains('seo-prose')) {
            hero = convertArticleHero(hero, page, siteRoot);
        }

        let container = hero.querySelector(':scope > .max-w-7xl, :scope > .max-w-6xl, :scope > .max-w-5xl');
        if (!container) {
            container = document.createElement('div');
            while (hero.firstChild) container.appendChild(hero.firstChild);
            hero.appendChild(container);
        }

        container.classList.add('seo-hero__grid');

        let image = container.querySelector(':scope > img');
        let copy = Array.from(container.children).find((child) => child !== image && child.tagName === 'DIV');

        if (!copy) {
            copy = document.createElement('div');
            const movable = Array.from(container.childNodes).filter((node) => node !== image);
            movable.forEach((node) => copy.appendChild(node));
            container.insertBefore(copy, image || null);
        }

        copy.classList.add('seo-hero__copy');

        const existingEyebrow = copy.querySelector('p:first-child');
        if (existingEyebrow && existingEyebrow.nextElementSibling?.tagName === 'H1') {
            existingEyebrow.classList.add('seo-eyebrow');
        } else {
            const eyebrow = document.createElement('p');
            eyebrow.className = 'seo-eyebrow';
            eyebrow.textContent = page.label;
            copy.prepend(eyebrow);
        }

        const h1 = copy.querySelector('h1');
        const lead = h1?.nextElementSibling?.tagName === 'P' ? h1.nextElementSibling : copy.querySelector('p:not(.seo-eyebrow)');
        if (lead) lead.classList.add('seo-hero__lead');

        if (!image) {
            image = document.createElement('img');
            image.src = new URL(page.image, siteRoot).href;
            image.alt = page.imageAlt;
            container.appendChild(image);
        }

        const visual = document.createElement('div');
        visual.className = 'seo-hero__visual';
        image.before(visual);
        visual.appendChild(image);
        image.classList.add('seo-hero__image');

        const actions = ensureHeroActions(copy, page, siteRoot, projectModal);
        ensureHeroFacts(copy, actions);

        return hero;
    }

    function convertArticleHero(article, page, siteRoot) {
        const h1 = article.querySelector('h1');
        const lead = h1?.nextElementSibling?.tagName === 'P' ? h1.nextElementSibling : article.querySelector('p');
        const header = document.createElement('header');
        header.className = 'seo-hero';
        const container = document.createElement('div');
        container.className = 'max-w-7xl mx-auto';
        const copy = document.createElement('div');
        const eyebrow = document.createElement('p');
        eyebrow.className = 'seo-eyebrow';
        eyebrow.textContent = page.label;
        copy.appendChild(eyebrow);
        if (h1) copy.appendChild(h1);
        if (lead) copy.appendChild(lead);
        const image = document.createElement('img');
        image.src = new URL(page.image, siteRoot).href;
        image.alt = page.imageAlt;
        container.append(copy, image);
        header.appendChild(container);
        article.before(header);
        article.classList.remove('seo-hero');
        article.classList.add('seo-article');
        const remainingParagraphs = Array.from(article.querySelectorAll(':scope > p'));
        if (!article.querySelector('h2') && remainingParagraphs.length) {
            const sectionHeading = document.createElement('h2');
            sectionHeading.className = 'font-serif font-bold';
            sectionHeading.textContent = 'Главное, что стоит учесть';
            remainingParagraphs[0].before(sectionHeading);
        }
        if (!article.querySelector('h3') && remainingParagraphs.length >= 3) {
            const practicalHeading = document.createElement('h3');
            practicalHeading.className = 'font-serif font-bold';
            practicalHeading.textContent = 'Практические рекомендации';
            remainingParagraphs[Math.floor(remainingParagraphs.length / 2)].before(practicalHeading);
        }
        if (article.parentElement?.tagName !== 'MAIN') {
            const main = document.createElement('main');
            article.before(main);
            main.appendChild(article);
        }
        return header;
    }

    function ensureHeroActions(copy, page, siteRoot, projectModal) {
        let actions = Array.from(copy.querySelectorAll('div')).find((element) => {
            return element.querySelector(':scope > a') && !element.classList.contains('seo-hero__facts');
        });

        if (!actions) {
            actions = document.createElement('div');
            const lead = copy.querySelector('.seo-hero__lead');
            (lead || copy.lastElementChild)?.insertAdjacentElement('afterend', actions);
        }

        actions.classList.add('seo-hero__actions');
        const links = Array.from(actions.querySelectorAll(':scope > a'));
        const telegram = links.find((link) => (link.getAttribute('href') || '').includes('t.me/'));
        const hashLink = links.find((link) => (link.getAttribute('href') || '').startsWith('#'));
        const priceLink = links.find((link) => (link.getAttribute('href') || '').includes('ceny-na-fotazony-minsk'));
        const gallery = document.querySelector('.seo-gallery');

        let calculate = telegram;
        if (!calculate) {
            calculate = document.createElement('a');
            calculate.href = 'https://t.me/kidseventa1';
            calculate.target = '_blank';
            calculate.rel = 'noopener noreferrer';
            calculate.setAttribute('data-analytics-location', 'hero');
            actions.prepend(calculate);
        }
        const pageProject = getPageProject(page);
        calculate.textContent = pageProject
            ? 'Рассчитать эту фотозону'
            : 'Рассчитать стоимость';
        calculate.className = 'seo-btn seo-btn--primary';

        let works = hashLink && hashLink !== calculate
            ? hashLink
            : priceLink && priceLink !== calculate
                ? priceLink
                : null;
        if (!works) {
            works = document.createElement('a');
            actions.appendChild(works);
        }

        if (gallery) {
            if (!gallery.id) gallery.id = 'works';
            works.href = `#${gallery.id}`;
        } else if (page.works) {
            works.href = new URL(page.works, siteRoot).href;
        } else {
            works.href = new URL('index.html#portfolio', siteRoot).href;
        }
        works.textContent = 'Смотреть работы';
        works.className = 'seo-btn seo-btn--secondary';

        links.filter((link) => link !== calculate && link !== works).forEach((link) => {
            link.className = 'seo-btn seo-btn--secondary';
        });

        bindInquiryTrigger(calculate, projectModal, pageProject, pageProject
            ? {
                source: 'Страница проекта',
                formLocation: 'seo_project_page',
                offerType: 'project_quote',
                offerName: 'Расчёт выбранной фотозоны',
                offerValue: 'individual_project_calculation',
                offerPage: window.location.pathname,
                offerLocation: 'project_detail_offer',
                eventType: page.category || '',
                formTitle: 'Узнать стоимость этой фотозоны',
                formDescription: 'Расскажите о мероприятии — подготовим расчёт выбранной фотозоны под вашу площадку и задачу.',
                submitLabel: 'Узнать стоимость'
            }
            : {
                source: 'Первый экран',
                formLocation: 'seo_hero'
            });

        return actions;
    }

    function isProjectDetailPage(page) {
        return page.match === 'svadebnaya-fotozona-v-bezhevyh-tonah-minsk';
    }

    function getPageProject(page) {
        if (!isProjectDetailPage(page)) return null;

        const image = document.querySelector('.seo-hero img, .seo-gallery img');
        const imageUrl = image ? new URL(image.getAttribute('src') || image.src, document.baseURI) : null;
        const name = document.querySelector('h1')?.textContent.trim() || 'Фотозона LavDragon';

        return {
            name,
            id: 'seo-svadebnaya-fotozona-v-bezhevyh-tonah-minsk',
            image: imageUrl?.href || '',
            category: page.category || 'Фотозоны',
            pageUrl: window.location.href
        };
    }

    function getSpecialOfferContext(page, offers, overrides = {}) {
        const relevantOffers = (Array.isArray(offers) ? offers : [offers]).filter(Boolean);
        const availableOfferTypes = relevantOffers.map((offer) => offer.type).join(',');
        const firstOffer = relevantOffers[0] || {};
        return {
            source: 'Специальные условия оформления',
            formLocation: 'seo_special_offer',
            offerType: SPECIAL_OFFER.type,
            offerName: SPECIAL_OFFER.name,
            offerValue: SPECIAL_OFFER.value,
            availableOfferTypes,
            offerPage: window.location.pathname,
            offerLocation: 'seo_special_offer',
            eventType: page.eventType || firstOffer.eventType || '',
            projectCategory: page.projectCategory || page.category || page.label || 'Фотозоны',
            projectUrl: window.location.href,
            formTitle: SPECIAL_OFFER.formTitle,
            formDescription: SPECIAL_OFFER.formDescription,
            submitLabel: SPECIAL_OFFER.submitLabel,
            requiresEventDate: true,
            checksEarlyBooking: relevantOffers.some((offer) => offer.type === 'early_booking_gift'),
            ...overrides
        };
    }

    function isTrackedOffer(offerType) {
        return offerType === SPECIAL_OFFER.type;
    }

    function pushOfferEvent(eventName, context = {}) {
        if (!isTrackedOffer(context.offerType)) return;
        const eventData = {
            event: eventName,
            offer_type: SPECIAL_OFFER.type,
            offer_page: context.offerPage || window.location.pathname,
            page_path: window.location.pathname
        };
        if (eventName !== 'offer_teaser_click') {
            eventData.offer_name = context.offerName || SPECIAL_OFFER.name;
            eventData.offer_value = context.offerValue || SPECIAL_OFFER.value;
            eventData.available_offer_types = context.availableOfferTypes || '';
            eventData.offer_location = context.offerLocation || '';
        }
        if (context.target) eventData.target = context.target;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(eventData);
        console.info(`dataLayer ${eventName}:`, eventData);
    }

    function observeSpecialOffer(section, context) {
        if (!section || !isTrackedOffer(context?.offerType) || !('IntersectionObserver' in window)) return;
        let timer = null;
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry || section.dataset.offerViewed === 'true') return;
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                if (timer) return;
                section.dataset.offerVisible = 'true';
                timer = window.setTimeout(() => {
                    if (section.dataset.offerVisible !== 'true' || section.dataset.offerViewed === 'true') return;
                    section.dataset.offerViewed = 'true';
                    pushOfferEvent('offer_view', context);
                    observer.unobserve(section);
                    timer = null;
                }, 1000);
                return;
            }
            section.dataset.offerVisible = 'false';
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
        }, { threshold: [0, 0.5] });
        observer.observe(section);
    }

    function bindInquiryTrigger(control, projectModal, project, context) {
        if (!control || control.dataset.inquiryBound === 'true') return;
        if (context?.offerType) control.dataset.offerType = context.offerType;
        if (context?.offerName) control.dataset.offerName = context.offerName;
        if (context?.offerPage) control.dataset.offerPage = context.offerPage;
        if (context?.offerLocation) control.dataset.offerLocation = context.offerLocation;
        control.dataset.inquiryBound = 'true';
        control.addEventListener('click', (event) => {
            event.preventDefault();
            if (project) pushProjectPriceClick(project);
            pushOfferEvent('offer_click', context);
            projectModal.open(project, control, context);
        });
    }

    function ensureHeroFacts(copy, actions) {
        if (copy.querySelector('.seo-hero__facts')) return;
        const facts = document.createElement('div');
        facts.className = 'seo-hero__facts';
        facts.setAttribute('aria-label', 'Преимущества работы с LavDragon');
        [
            'Индивидуальная концепция',
            'Монтаж и демонтаж',
            'Доставка по Минску',
            'Согласование под площадку'
        ].forEach((text) => {
            const item = document.createElement('span');
            item.textContent = text;
            facts.appendChild(item);
        });
        actions.insertAdjacentElement('afterend', facts);
    }

    function addBenefits(hero) {
        if (!hero || document.querySelector('.seo-benefit-strip')) return;
        const section = document.createElement('section');
        section.className = 'seo-benefit-strip';
        section.setAttribute('aria-label', 'Преимущества LavDragon');
        const inner = document.createElement('ul');
        inner.className = 'seo-benefit-strip__inner';
        const items = [
            ['✦', 'Индивидуальный дизайн'],
            ['✓', 'Монтаж и демонтаж'],
            ['→', 'Доставка по Минску'],
            ['◇', 'Согласование под площадку'],
            ['◎', 'Единая концепция декора']
        ];
        items.forEach(([icon, text]) => {
            const item = document.createElement('li');
            item.className = 'seo-benefit-strip__item';
            const mark = document.createElement('span');
            mark.className = 'seo-benefit-strip__icon';
            mark.textContent = icon;
            const label = document.createElement('span');
            label.textContent = text;
            item.append(mark, label);
            inner.appendChild(item);
        });
        section.appendChild(inner);
        hero.insertAdjacentElement('afterend', section);
    }

    function addProjectDetailCta(page, projectModal) {
        const project = getPageProject(page);
        if (!project || document.querySelector('.seo-project-cta')) return;

        const section = document.createElement('section');
        section.className = 'seo-project-cta';
        section.innerHTML = `
            <div class="seo-project-cta__inner">
                <div>
                    <p class="seo-eyebrow">Предложение для выбранного проекта</p>
                    <h2 class="font-serif font-bold">Понравилась эта фотозона?</h2>
                    <p>Рассчитаем стоимость именно под ваше мероприятие, площадку и желаемое наполнение.</p>
                </div>
                <button type="button" class="seo-btn seo-btn--primary">Узнать стоимость</button>
            </div>
        `;
        const insertAfter = document.querySelector('.seo-benefit-strip') || document.querySelector('.seo-hero');
        insertAfter?.insertAdjacentElement('afterend', section);
        bindInquiryTrigger(section.querySelector('button'), projectModal, project, {
            source: 'Страница проекта',
            formLocation: 'seo_project_page',
            offerType: 'project_quote',
            offerName: 'Расчёт выбранной фотозоны',
            offerValue: 'individual_project_calculation',
            offerPage: window.location.pathname,
            offerLocation: 'project_detail_offer',
            eventType: page.category || '',
            formTitle: 'Узнать стоимость этой фотозоны',
            formDescription: 'Расскажите о мероприятии — подготовим расчёт выбранной фотозоны под вашу площадку и задачу.',
            submitLabel: 'Узнать стоимость'
        });
    }

    function enhanceSections() {
        const sections = Array.from(document.querySelectorAll('main > .seo-section, main > section.seo-section'));
        sections.forEach((section, index) => {
            section.classList.toggle('seo-section--tone', index % 2 === 0);
            const heading = section.querySelector('h2');
            if (heading && !heading.previousElementSibling?.classList.contains('seo-eyebrow')) {
                const existingLabel = heading.parentElement?.querySelector(':scope > p:first-child');
                if (existingLabel && existingLabel !== heading && existingLabel.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING) {
                    existingLabel.classList.add('seo-eyebrow');
                }
            }
        });
    }

    function enhanceGallery(page, siteRoot, projectModal) {
        const gallery = document.querySelector('.seo-gallery');
        if (!gallery) return null;
        if (!gallery.id) gallery.id = 'works';

        Array.from(gallery.querySelectorAll('img')).forEach((image, index) => {
            let card = image.parentElement?.tagName === 'FIGURE' ? image.parentElement : null;
            if (!card) {
                card = document.createElement('figure');
                image.before(card);
                card.appendChild(image);
            }
            card.classList.add('seo-gallery__card');
            image.setAttribute('tabindex', '0');
            image.setAttribute('role', 'button');
            image.setAttribute('aria-label', `Увеличить: ${image.alt || 'фотография проекта'}`);
            image.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    image.click();
                }
            });

            if (card.querySelector('.seo-gallery-card__cta')) return;

            const project = getGalleryProjectData(image, card, page, index);
            if (!card.querySelector('figcaption')) {
                const caption = document.createElement('figcaption');
                const title = document.createElement('strong');
                title.textContent = project.name;
                caption.appendChild(title);
                card.appendChild(caption);
            }
            const benefitsList = document.createElement('ul');
            benefitsList.className = 'seo-gallery-card__benefits';
            benefitsList.setAttribute('aria-label', 'Характеристики проекта');
            getProjectCardBenefits(project).forEach((text) => {
                const item = document.createElement('li');
                item.textContent = text;
                benefitsList.appendChild(item);
            });

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'seo-gallery-card__cta seo-btn seo-btn--primary';
            button.textContent = 'Узнать стоимость';
            button.setAttribute('aria-label', `Узнать стоимость проекта «${project.name}»`);
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                pushProjectPriceClick(project);
                projectModal.open(project, button, {
                    source: 'Карточка проекта',
                    formLocation: 'seo_gallery_card'
                });
            });

            card.append(benefitsList, button);
        });

        enhanceStandaloneProjectCards(projectModal, page);
        return gallery.closest('section') || gallery;
    }

    function enhanceStandaloneProjectCards(projectModal, page) {
        document.querySelectorAll('[data-seo-project-name]').forEach((card) => {
            if (card.querySelector('.seo-project-example-card__cta')) return;

            const imagePath = card.dataset.projectImage || '';
            const project = {
                name: card.dataset.seoProjectName,
                id: card.dataset.projectId || getProjectIdFromImagePath(imagePath, 0),
                image: imagePath ? new URL(imagePath, document.baseURI).href : '',
                category: page.category || page.label || 'Фотозоны',
                pageUrl: window.location.href
            };
            card.classList.add('seo-project-example-card');
            const benefitsList = document.createElement('ul');
            benefitsList.className = 'seo-gallery-card__benefits seo-project-example-card__benefits';
            benefitsList.setAttribute('aria-label', 'Характеристики проекта');
            getProjectCardBenefits(project).forEach((text) => {
                const item = document.createElement('li');
                item.textContent = text;
                benefitsList.appendChild(item);
            });

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'seo-project-example-card__cta seo-btn seo-btn--primary';
            button.textContent = 'Узнать стоимость';
            button.setAttribute('aria-label', `Узнать стоимость проекта «${project.name}»`);
            button.addEventListener('click', () => {
                pushProjectPriceClick(project);
                projectModal.open(project, button, {
                    source: 'Карточка проекта',
                    formLocation: 'seo_gallery_card'
                });
            });

            card.append(benefitsList, button);
        });
    }

    function getGalleryProjectData(image, card, page, index) {
        const imageUrl = new URL(image.getAttribute('src') || image.src, document.baseURI);
        const captionTitle = card.querySelector('figcaption b, figcaption strong')?.textContent.trim();
        const fallbackName = `${page.label || 'Проект'} — вариант ${index + 1}`;
        const isSingleProjectPage = page.match === 'svadebnaya-fotozona-v-bezhevyh-tonah-minsk';
        const pageProjectName = document.querySelector('h1')?.textContent.trim();

        return {
            name: isSingleProjectPage && pageProjectName
                ? pageProjectName
                : captionTitle || image.getAttribute('alt')?.trim() || fallbackName,
            id: isSingleProjectPage
                ? 'seo-svadebnaya-fotozona-v-bezhevyh-tonah-minsk'
                : getProjectIdFromImagePath(imageUrl.pathname, index),
            image: imageUrl.href,
            category: page.category || page.label || 'Фотозоны',
            pageUrl: window.location.href
        };
    }

    function getProjectCardBenefits(project) {
        return [
            `Стиль: ${project.category || 'под ваше событие'}`,
            'Размер: адаптируем под площадку',
            'Время монтажа: согласуем с площадкой',
            'Количество элементов: подберём под формат',
            'Особенность: палитра и детали — индивидуально'
        ];
    }

    function getProjectIdFromImagePath(pathname, index) {
        let decodedPath = pathname;
        try {
            decodedPath = decodeURIComponent(pathname);
        } catch (error) {
            decodedPath = pathname;
        }

        const pathParts = decodedPath
            .replace(/\.[^/.]+$/, '')
            .split('/')
            .filter(Boolean)
            .slice(-2);
        const pathSlug = pathParts
            .join('-')
            .normalize('NFKD')
            .toLowerCase()
            .replace(/[^a-z0-9а-яё]+/giu, '-')
            .replace(/^-+|-+$/g, '');

        return `seo-${pathSlug || `project-${index + 1}`}`;
    }

    function pushProjectPriceClick(project) {
        const eventData = {
            event: 'project_price_click',
            project_name: project.name,
            project_category: project.category,
            page_path: window.location.pathname
        };

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(eventData);
        console.info('dataLayer project_price_click:', eventData);
    }

    function createProjectInquiryModal(page, siteRoot) {
        const existingModal = document.getElementById('seo-project-inquiry-modal');
        if (existingModal?.__projectInquiryController) {
            return existingModal.__projectInquiryController;
        }

        const modal = document.createElement('div');
        modal.id = 'seo-project-inquiry-modal';
        modal.className = 'seo-project-modal';
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="seo-project-modal__dialog" role="dialog" aria-modal="true"
                aria-labelledby="seo-project-modal-title" aria-describedby="seo-project-modal-description">
                <button type="button" class="seo-project-modal__close" aria-label="Закрыть форму">×</button>
                <div class="seo-project-modal__form-view">
                    <p class="seo-eyebrow">Индивидуальный расчёт</p>
                    <h2 id="seo-project-modal-title" class="font-serif font-bold">Получите расчёт вашей фотозоны</h2>
                    <p id="seo-project-modal-description" class="seo-project-modal__description">
                        Расскажите о мероприятии — мы предложим подходящий вариант и рассчитаем стоимость.
                    </p>
                    <p class="seo-project-modal__selection">
                        <span>Выбранный проект:</span>
                        <strong id="seo-project-modal-selection"></strong>
                    </p>
                    <form class="seo-project-form" action="${new URL('send.php', siteRoot).href}" method="POST">
                        <input type="hidden" name="selected_project" value="">
                        <input type="hidden" name="project_id" value="">
                        <input type="hidden" name="project_image" value="">
                        <input type="hidden" name="project_category" value="">
                        <input type="hidden" name="project_url" value="">
                        <input type="hidden" name="page_path" value="">
                        <input type="hidden" name="form_location" value="seo_gallery_card">
                        <input type="hidden" name="offer_type" value="">
                        <input type="hidden" name="offer_name" value="">
                        <input type="hidden" name="offer_value" value="">
                        <input type="hidden" name="available_offer_types" value="">
                        <input type="hidden" name="offer_page" value="">
                        <input type="hidden" name="offer_location" value="">
                        <input type="hidden" name="event_date" value="">
                        <input type="hidden" name="early_booking_eligible" value="">
                        <input type="hidden" name="source" value="">
                        <input type="hidden" name="form_name" value="consultation_form">

                        <div class="seo-project-form__grid">
                            <label class="seo-project-form__field">
                                <span>Имя</span>
                                <input name="name" type="text" autocomplete="name" required placeholder="Ваше имя">
                            </label>
                            <label class="seo-project-form__field">
                                <span>Телефон или мессенджер</span>
                                <input name="phone" type="tel" autocomplete="tel" required
                                    placeholder="+375 29 000-00-00">
                            </label>
                            <label class="seo-project-form__field">
                                <span>Дата мероприятия <small class="seo-project-form__date-required">— необязательно</small></span>
                                <input name="date" type="date">
                                <small class="seo-project-form__date-note" role="status" aria-live="polite"></small>
                            </label>
                            <label class="seo-project-form__field">
                                <span>Тип мероприятия</span>
                                <select name="eventType" required>
                                    <option value="" selected disabled>Выберите тип</option>
                                    <option>Свадьба</option>
                                    <option>День рождения</option>
                                    <option>Юбилей</option>
                                    <option>Детский праздник</option>
                                    <option>Корпоратив</option>
                                    <option>Gender party</option>
                                    <option>Другое</option>
                                </select>
                            </label>
                            <label class="seo-project-form__field">
                                <span>Место проведения <small>— необязательно</small></span>
                                <input name="place" type="text" autocomplete="street-address"
                                    placeholder="Площадка или адрес">
                            </label>
                            <label class="seo-project-form__field">
                                <span>Планируемый бюджет <small>— необязательно</small></span>
                                <select name="budget">
                                    <option selected>пока не определились</option>
                                    <option>компактный формат</option>
                                    <option>оптимальный формат</option>
                                    <option>расширенный формат</option>
                                    <option>премиальный формат</option>
                                </select>
                            </label>
                            <label class="seo-project-form__field">
                                <span>Что планируете оформить? <small>— необязательно</small></span>
                                <select name="requested_services">
                                    <option value="" selected>Что планируете оформить? — необязательно</option>
                                    <option>Только фотозона</option>
                                    <option>Фотозона и дополнительная зона</option>
                                    <option>Оформление зала</option>
                                    <option>Пока не определились</option>
                                </select>
                            </label>
                        </div>
                        <label class="seo-project-form__field">
                            <span>Комментарий <small>— необязательно</small></span>
                            <textarea name="comment" rows="3"
                                placeholder="Пожелания по оформлению, цветам или размеру"></textarea>
                        </label>
                        <p class="seo-project-form__status" role="status" aria-live="polite"></p>
                        <button type="submit" class="seo-project-form__submit seo-btn seo-btn--primary">
                            Получить расчёт
                        </button>
                    </form>
                </div>
                <div class="seo-project-modal__success" hidden tabindex="-1">
                    <div class="seo-project-modal__success-mark" aria-hidden="true">✓</div>
                    <h2 class="font-serif font-bold">Заявка отправлена</h2>
                    <p>Спасибо! Мы получили запрос на расчёт и скоро свяжемся с вами.</p>
                    <button type="button" class="seo-project-modal__success-close seo-btn seo-btn--secondary">
                        Закрыть
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const dialog = modal.querySelector('.seo-project-modal__dialog');
        const closeButton = modal.querySelector('.seo-project-modal__close');
        const successCloseButton = modal.querySelector('.seo-project-modal__success-close');
        const formView = modal.querySelector('.seo-project-modal__form-view');
        const successView = modal.querySelector('.seo-project-modal__success');
        const selectionBlock = modal.querySelector('.seo-project-modal__selection');
        const selection = modal.querySelector('#seo-project-modal-selection');
        const title = modal.querySelector('#seo-project-modal-title');
        const description = modal.querySelector('#seo-project-modal-description');
        const form = modal.querySelector('.seo-project-form');
        const submitButton = form.querySelector('[type="submit"]');
        const status = form.querySelector('.seo-project-form__status');
        const dateField = form.querySelector('[name="date"]');
        const dateRequiredLabel = form.querySelector('.seo-project-form__date-required');
        const dateNote = form.querySelector('.seo-project-form__date-note');
        const eventTypeField = form.querySelector('[name="eventType"]');
        const requestedServicesField = form.querySelector('[name="requested_services"]');
        let lastFocusedElement = null;
        let submitting = false;

        const today = new Date();
        dateField.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10);

        function setHiddenValue(name, value) {
            const field = form.querySelector(`[name="${name}"]`);
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
            const threshold = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            threshold.setDate(threshold.getDate() + 30);
            return eventDate >= threshold ? 'yes' : 'no';
        }

        function syncOfferDateContext(showMessage = false) {
            const dateValue = dateField?.value || '';
            const isEarlyBooking = form.dataset.earlyBookingOffer === 'true';
            const checksEarlyBooking = form.dataset.checksEarlyBooking === 'true';
            const requiresEventDate = form.dataset.offerRequiresEventDate === 'true';
            setHiddenValue('event_date', dateValue);
            setHiddenValue('early_booking_eligible', (isEarlyBooking || checksEarlyBooking)
                ? getEarlyBookingEligibility(dateValue)
                : '');

            if (!dateNote) return;
            dateNote.textContent = '';
            dateNote.dataset.state = '';
            if (isEarlyBooking && dateValue) {
                if (getEarlyBookingEligibility(dateValue) === 'yes') {
                    dateNote.textContent = 'Дата подходит под условие раннего бронирования. Итоговый подарок согласуем после уточнения состава заказа.';
                    dateNote.dataset.state = 'success';
                } else {
                    dateNote.textContent = 'До мероприятия меньше 30 дней. Мы всё равно проверим доступные варианты и возможные специальные условия.';
                    dateNote.dataset.state = 'notice';
                }
            } else if (checksEarlyBooking && dateValue) {
                dateNote.textContent = getEarlyBookingEligibility(dateValue) === 'yes'
                    ? 'Дата указана: менеджер проверит возможность подарочного декора после уточнения состава заказа.'
                    : 'Дата указана: менеджер проверит доступность команды и варианты комплексного оформления.';
                dateNote.dataset.state = 'notice';
            } else if (requiresEventDate && showMessage && !dateValue) {
                dateNote.textContent = 'Укажите дату мероприятия, чтобы проверить условия предложения.';
                dateNote.dataset.state = 'notice';
            }
        }

        function setDateRequirement(context = {}) {
            const requiresEventDate = context.requiresEventDate === true;
            const isEarlyBooking = context.offerType === 'early_booking_gift';
            form.dataset.offerRequiresEventDate = requiresEventDate ? 'true' : 'false';
            form.dataset.earlyBookingOffer = isEarlyBooking ? 'true' : 'false';
            form.dataset.checksEarlyBooking = context.checksEarlyBooking === true ? 'true' : 'false';
            if (dateField) {
                dateField.required = requiresEventDate;
                dateField.value = '';
            }
            if (dateRequiredLabel) {
                dateRequiredLabel.textContent = requiresEventDate ? '— обязательно' : '— необязательно';
            }
            syncOfferDateContext(requiresEventDate);
        }

        function applyServerOfferContext(offerContext) {
            if (!offerContext || typeof offerContext !== 'object') return;
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
            ].forEach((name) => {
                if (Object.prototype.hasOwnProperty.call(offerContext, name)) {
                    setHiddenValue(name, String(offerContext[name] ?? ''));
                }
            });
        }

        function open(project, trigger, context = {}) {
            lastFocusedElement = trigger || document.activeElement;
            dialog.scrollTop = 0;
            const hasProject = Boolean(project?.name);
            selectionBlock.hidden = !hasProject;
            selection.textContent = hasProject ? project.name : '';
            setHiddenValue('selected_project', project?.name);
            setHiddenValue('project_id', project?.id);
            setHiddenValue('project_image', project?.image);
            setHiddenValue('project_category', project?.category || context.projectCategory);
            setHiddenValue('project_url', project?.pageUrl || context.projectUrl || window.location.href);
            setHiddenValue('page_path', window.location.pathname);
            setHiddenValue('form_location', context.formLocation || 'seo_general_inquiry');
            setHiddenValue('offer_type', context.offerType || '');
            setHiddenValue('offer_name', context.offerName || '');
            setHiddenValue('offer_value', context.offerValue || '');
            setHiddenValue('available_offer_types', context.availableOfferTypes || '');
            setHiddenValue('offer_page', context.offerPage || '');
            setHiddenValue('offer_location', context.offerLocation || '');
            setHiddenValue('event_date', '');
            setHiddenValue('early_booking_eligible', '');
            setHiddenValue('source', context.source || (hasProject ? 'Карточка проекта' : 'Общая заявка'));
            setHiddenValue('form_name', 'consultation_form');
            if (eventTypeField) eventTypeField.value = context.eventType || '';
            if (requestedServicesField) requestedServicesField.value = '';
            if (title) title.textContent = context.formTitle || 'Получите расчёт вашей фотозоны';
            if (description) {
                description.textContent = context.formDescription
                    || 'Расскажите о мероприятии — мы предложим подходящий вариант и рассчитаем стоимость.';
            }
            submitButton.textContent = context.submitLabel || 'Получить расчёт';

            setDateRequirement(context);
            status.textContent = '';
            formView.hidden = false;
            successView.hidden = true;
            submitButton.disabled = submitting;
            modal.hidden = false;
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('seo-project-modal-open');
            requestAnimationFrame(() => modal.classList.add('is-open'));
            closeButton.focus();
        }

        function close() {
            if (modal.hidden) return;
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            modal.hidden = true;
            document.body.classList.remove('seo-project-modal-open');
            if (lastFocusedElement instanceof HTMLElement) {
                lastFocusedElement.focus();
            }
        }

        function getFocusableElements() {
            return Array.from(dialog.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
                'textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            )).filter((element) => !element.closest('[hidden]'));
        }

        closeButton.addEventListener('click', close);
        successCloseButton.addEventListener('click', close);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) close();
        });
        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                close();
                return;
            }
            if (event.key !== 'Tab') return;

            const focusable = getFocusableElements();
            if (!focusable.length) {
                event.preventDefault();
                return;
            }

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

        dateField.addEventListener('input', () => syncOfferDateContext());
        dateField.addEventListener('change', () => syncOfferDateContext());

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (submitting) return;
            syncOfferDateContext(true);
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            submitting = true;
            submitButton.disabled = true;
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Отправка…';
            status.textContent = '';
            let successful = false;

            try {
                const formData = new FormData(form);
                const selectedProject = String(formData.get('selected_project') || '');

                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                const result = await response.json();
                if (response.status !== 200 || result.success !== true) {
                    throw new Error(result.message || 'Не удалось отправить заявку.');
                }

                successful = true;
                applyServerOfferContext(result.offer_context);
                const successfulFormData = new FormData(form);
                const generateLeadEvent = {
                    event: 'generate_lead',
                    lead_source: 'website_form',
                    form_name: 'consultation_form',
                    selected_project: String(successfulFormData.get('selected_project') || selectedProject),
                    form_location: String(successfulFormData.get('form_location') || 'seo_general_inquiry'),
                    page_path: window.location.pathname
                };
                const offerType = String(successfulFormData.get('offer_type') || '');
                const offerName = String(successfulFormData.get('offer_name') || '');
                const offerValue = String(successfulFormData.get('offer_value') || '');
                const availableOfferTypes = String(successfulFormData.get('available_offer_types') || '');
                const offerPage = String(successfulFormData.get('offer_page') || '');
                const offerLocation = String(successfulFormData.get('offer_location') || '');
                const eventDate = String(successfulFormData.get('event_date') || '');
                const earlyBookingEligible = String(successfulFormData.get('early_booking_eligible') || '');
                const requestedServices = String(successfulFormData.get('requested_services') || '');
                if (selectedProject) generateLeadEvent.project_name = selectedProject;
                if (offerType) {
                    generateLeadEvent.offer_type = offerType;
                    generateLeadEvent.offer_name = offerName;
                    generateLeadEvent.offer_value = offerValue;
                    generateLeadEvent.available_offer_types = availableOfferTypes;
                    generateLeadEvent.offer_page = offerPage;
                    generateLeadEvent.offer_location = offerLocation;
                    generateLeadEvent.event_date = eventDate;
                    generateLeadEvent.requested_services = requestedServices;
                    generateLeadEvent.early_booking_eligible = earlyBookingEligible;
                }
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push(generateLeadEvent);
                console.info('dataLayer generate_lead:', generateLeadEvent);

                form.reset();
                formView.hidden = true;
                successView.hidden = false;
                successView.focus();
            } catch (error) {
                console.error('Ошибка отправки формы проекта:', error);
                status.textContent = error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.';
            } finally {
                submitting = false;
                submitButton.textContent = originalButtonText;
                submitButton.disabled = successful;
            }
        });

        const controller = { open, close };
        modal.__projectInquiryController = controller;
        return controller;
    }

    function enhanceFaq(page) {
        let faqHeading = Array.from(document.querySelectorAll('h2')).find((heading) => {
            return heading.textContent.trim().toLowerCase().startsWith('faq');
        });
        if (!faqHeading) {
            const main = document.querySelector('main');
            if (!main) return;
            const section = document.createElement('section');
            section.className = 'seo-section seo-section--tone';
            const container = document.createElement('div');
            container.className = 'max-w-5xl mx-auto seo-prose';
            const eyebrow = document.createElement('p');
            eyebrow.className = 'seo-eyebrow';
            eyebrow.textContent = 'Перед заказом';
            faqHeading = document.createElement('h2');
            faqHeading.className = 'font-serif font-bold';
            faqHeading.textContent = 'FAQ — частые вопросы';
            container.append(eyebrow, faqHeading);
            getFallbackFaq(page).forEach(([questionText, answerText]) => {
                const question = document.createElement('h3');
                question.textContent = questionText;
                const answer = document.createElement('p');
                answer.textContent = answerText;
                container.append(question, answer);
            });
            section.appendChild(container);
            main.appendChild(section);
        }
        const container = faqHeading.parentElement;
        if (!container || container.querySelector('.seo-faq')) return;
        appendPricingFaq(container, page);

        const nodes = Array.from(container.children);
        const start = nodes.indexOf(faqHeading) + 1;
        const faq = document.createElement('div');
        faq.className = 'seo-faq';

        for (let index = start; index < nodes.length; index += 1) {
            const question = nodes[index];
            if (question.tagName !== 'H3') continue;
            const answerNodes = [];
            let cursor = question.nextElementSibling;
            while (cursor && cursor.tagName !== 'H3') {
                answerNodes.push(cursor);
                cursor = cursor.nextElementSibling;
            }
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = question.textContent.trim();
            const answer = document.createElement('div');
            answer.className = 'seo-faq__answer';
            answerNodes.forEach((node) => answer.appendChild(node));
            details.append(summary, answer);
            faq.appendChild(details);
            question.remove();
        }

        if (!faq.children.length) return;
        container.appendChild(faq);
        faq.addEventListener('toggle', (event) => {
            const opened = event.target;
            if (!(opened instanceof HTMLDetailsElement) || !opened.open) return;
            faq.querySelectorAll('details[open]').forEach((details) => {
                if (details !== opened) details.open = false;
            });
        }, true);
    }

    function appendPricingFaq(container, page) {
        const pageMatch = page.match || '';
        const relevantPage = /fotozon|gender-party|ceny-na-fotazony|svadebnaya-fotozona/.test(pageMatch);
        if (!relevantPage) return;

        const items = [
            [
                'Сколько стоит фотозона?',
                'Стоимость фотозоны зависит от размера, конструкции, количества декора, места проведения и сложности монтажа. После уточнения деталей мы подготовим точный расчёт и заранее согласуем состав работ.'
            ],
            [
                'Можно ли адаптировать проект под мой бюджет?',
                'Да. Мы можем изменить размер конструкции, количество декора и дополнительные элементы, сохранив общую стилистику проекта.'
            ],
            [
                'Что входит в стоимость?',
                'Состав зависит от выбранного пакета. Обычно в стоимость входят конструкция, декор, индивидуальная надпись, монтаж и демонтаж. Доставка рассчитывается отдельно в зависимости от адреса. Точный состав указывается в расчёте.'
            ]
        ];
        const existingQuestions = new Set(
            Array.from(container.querySelectorAll('h3')).map((heading) => heading.textContent.trim().toLowerCase())
        );

        items.forEach(([questionText, answerText]) => {
            if (existingQuestions.has(questionText.toLowerCase())) return;
            const question = document.createElement('h3');
            question.textContent = questionText;
            const answer = document.createElement('p');
            answer.textContent = answerText;
            container.append(question, answer);
        });
    }

    function getFallbackFaq(page) {
        if (page.match === 'svadebnaya-fotozona-v-bezhevyh-tonah-minsk') {
            return [
                ['Можно адаптировать этот проект под другую площадку?', 'Да. Сохраним настроение и палитру, но пересчитаем размеры, состав декора и монтаж под конкретный зал.'],
                ['Можно изменить цветовую гамму?', 'Да. Бежевую основу можно сделать теплее, светлее или дополнить оттенками вашей свадьбы.'],
                ['Что нужно для расчёта?', 'Пришлите дату, адрес, фото площадки, примерный размер зоны и пожелания по цветам.']
            ];
        }
        if ((page.match || '').includes('blog') || page.works) {
            return [
                ['Когда лучше обращаться за оформлением?', 'Лучше написать, как только известны дата и площадка: команда проверит доступность и предложит подходящий порядок подготовки.'],
                ['Что прислать для предварительного расчёта?', 'Нужны дата, площадка, формат события, фото места установки, желаемая палитра и ориентир по бюджету.'],
                ['Можно адаптировать понравившуюся идею?', 'Да. Мы сохраняем настроение референса и адаптируем композицию под реальные размеры, свет и стиль площадки.']
            ];
        }
        return [
            ['Как получить предварительный расчёт?', 'Напишите дату, адрес, формат события и желаемый размер. Мы предложим подходящий состав и ориентир по бюджету.'],
            ['Можно изменить цвета и детали?', 'Да. Палитру, надписи и декоративные элементы адаптируем под событие и интерьер площадки.'],
            ['Входят ли монтаж и демонтаж?', 'Состав работ фиксируется в смете заранее. Для проектов под ключ команда привозит, устанавливает и забирает декор.']
        ];
    }

    function addInlineCtas(gallerySection, page, projectModal) {
        const main = document.querySelector('main');
        if (!main || isProjectDetailPage(page)) return null;
        const sections = Array.from(main.querySelectorAll(':scope > section.seo-section'));
        const faqSection = sections.find((section) => section.querySelector('.seo-faq'));
        const targets = [];
        if (sections[0] && sections[0] !== faqSection) targets.push(sections[0]);
        if (gallerySection && gallerySection !== faqSection && !targets.includes(gallerySection)) targets.push(gallerySection);
        if (!targets.length) {
            const article = main.querySelector(':scope > .seo-article');
            if (article) targets.push(article);
        }

        if (page.offers?.length && targets.length) {
            const target = gallerySection && gallerySection !== faqSection
                ? gallerySection
                : targets[targets.length - 1];
            return addSpecialOfferAfter(target, page, projectModal, page.offers, {
                formLocation: page.compactOffers ? 'seo_blog_offer' : 'seo_special_offer',
                offerLocation: page.compactOffers ? 'seo_blog_offer' : 'seo_special_offer',
                source: page.compactOffers ? 'Компактное предложение в материале' : 'Специальные условия оформления',
                compact: Boolean(page.compactOffers)
            });
            return;
        }

        const target = gallerySection && gallerySection !== faqSection
            ? gallerySection
            : targets[targets.length - 1];
        const wrapper = document.createElement('section');
        wrapper.className = 'seo-section seo-section--compact';
        wrapper.innerHTML = `
            <div class="seo-inline-cta">
                <div class="seo-inline-cta__copy">
                    <strong>Хотите обсудить идею?</strong>
                    <p>Подберём похожую фотозону под ваше мероприятие, площадку и бюджет.</p>
                </div>
                <button type="button" data-analytics-location="section_cta" class="seo-btn seo-btn--primary">Получить расчёт</button>
            </div>
        `;
        target.insertAdjacentElement('afterend', wrapper);
        const project = getPageProject(page);
        bindInquiryTrigger(wrapper.querySelector('button'), projectModal, project, {
            source: project ? 'Страница проекта' : 'CTA в тексте',
            formLocation: project ? 'seo_project_page' : 'seo_inline_cta'
        });
        return wrapper;
    }

    function addSpecialOfferAfter(target, page, projectModal, offers, options = {}) {
        const resolvedOffers = (Array.isArray(offers) ? offers : [offers]).filter(Boolean);
        if (!target || !resolvedOffers.length) return null;
        const existing = document.getElementById('special-offer');
        if (existing) return existing;

        const context = getSpecialOfferContext(page, resolvedOffers, {
            source: options.source || 'Специальные условия оформления',
            formLocation: options.formLocation || 'seo_special_offer',
            offerLocation: options.offerLocation || 'seo_special_offer'
        });
        const compact = Boolean(options.compact);
        const buttonLabel = compact ? 'Узнать условия' : 'Узнать доступное предложение';

        const section = document.createElement('section');
        section.id = 'special-offer';
        section.tabIndex = -1;
        section.className = `seo-section seo-section--compact seo-special-offer-section${compact ? ' seo-special-offer-section--compact' : ''}`;
        section.dataset.offerType = context.offerType;
        section.dataset.offerName = context.offerName;
        section.dataset.offerValue = context.offerValue;
        section.dataset.availableOfferTypes = context.availableOfferTypes;
        section.dataset.offerLocation = context.offerLocation;
        section.setAttribute('aria-labelledby', 'special-offer-title');
        section.innerHTML = compact
            ? `
                <div class="seo-special-offer seo-special-offer--compact">
                    <div class="seo-special-offer__compact-copy">
                        <p class="seo-eyebrow">Специальные условия</p>
                        <h2 id="special-offer-title" class="font-serif font-bold">Планируете мероприятие?</h2>
                        <p>Для некоторых дат и комплектаций доступны специальные условия.</p>
                    </div>
                    <button type="button" data-special-offer-action class="seo-btn seo-btn--primary">${buttonLabel}</button>
                </div>
            `
            : `
                <div class="seo-special-offer">
                    <header class="seo-special-offer__copy">
                        <p class="seo-eyebrow">Без самостоятельного выбора акции</p>
                        <h2 id="special-offer-title" class="font-serif font-bold">Специальные условия для вашего события</h2>
                        <p>В зависимости от даты мероприятия и состава заказа мы подберём наиболее выгодный вариант.</p>
                        <p class="seo-special-offer__guidance">Вам не нужно выбирать предложение самостоятельно — оставьте дату и расскажите о мероприятии. Менеджер проверит условия и предложит подходящий вариант.</p>
                    </header>
                    <div class="seo-special-offer__options" role="list" aria-label="Возможные специальные условия">
                        ${resolvedOffers.map((offer) => `
                            <article class="seo-special-offer__option" role="listitem">
                                <p class="seo-special-offer__tag">${offer.eyebrow}</p>
                                <h3 class="font-serif font-bold">${offer.title}</h3>
                                <p>${offer.text}</p>
                                <p class="seo-special-offer__note">${offer.note || ''}</p>
                            </article>
                        `).join('')}
                    </div>
                    <p class="seo-special-offer__decision">Какое предложение подходит именно вам, определим после уточнения даты, площадки и состава оформления.</p>
                    <div class="seo-special-offer__action">
                        <button type="button" data-special-offer-action class="seo-btn seo-btn--primary">${buttonLabel}</button>
                        <p>Это бесплатно и ни к чему вас не обязывает.</p>
                    </div>
                </div>
            `;
        target.insertAdjacentElement('afterend', section);

        bindInquiryTrigger(section.querySelector('[data-special-offer-action]'), projectModal, null, context);
        observeSpecialOffer(section, context);
        scrollToSpecialOfferIfRequested(section);
        return section;
    }

    function addOfferTeaser(hero, page, specialOfferSection) {
        if (
            !hero
            || !specialOfferSection
            || specialOfferSection.id !== 'special-offer'
            || page.compactOffers
            || isProjectDetailPage(page)
            || document.querySelector('.seo-offer-teaser')
        ) {
            return;
        }

        const teaser = document.createElement('aside');
        teaser.className = 'seo-offer-teaser';
        teaser.setAttribute('aria-label', 'Специальные условия для события');
        teaser.innerHTML = `
            <div class="seo-offer-teaser__copy">
                <strong>Для вашего события могут быть доступны подарок или специальные условия</strong>
                <span>Покажем варианты ниже и поможем определить подходящий после уточнения даты.</span>
            </div>
            <a href="#special-offer">Посмотреть специальные предложения</a>
        `;
        const insertionTarget = document.querySelector('.seo-benefit-strip') || hero;
        insertionTarget.insertAdjacentElement('afterend', teaser);

        teaser.querySelector('a')?.addEventListener('click', (event) => {
            const target = document.getElementById('special-offer');
            if (!target) return;
            event.preventDefault();
            pushOfferEvent('offer_teaser_click', {
                offerType: SPECIAL_OFFER.type,
                offerPage: window.location.pathname,
                target: '#special-offer'
            });
            if (window.history?.pushState) {
                window.history.pushState(null, '', '#special-offer');
            }
            scrollToSpecialOffer(target, true);
        });
    }

    function scrollToSpecialOfferIfRequested(section) {
        if (window.location.hash !== '#special-offer') return;
        requestAnimationFrame(() => scrollToSpecialOffer(section, false));
    }

    function scrollToSpecialOffer(section, smooth) {
        if (!section) return;
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (typeof section.focus === 'function') {
            section.focus({ preventScroll: true });
        }
        section.scrollIntoView({
            behavior: smooth && !reducedMotion ? 'smooth' : 'auto',
            block: 'start'
        });
    }

    function addRelated(page, siteRoot) {
        const main = document.querySelector('main') || document.querySelector('.seo-article')?.parentElement;
        if (!main || document.querySelector('.seo-related')) return;
        const currentPath = window.location.pathname.toLowerCase();
        const items = [
            ['Свадьбы', 'Фотозоны на свадьбу', 'fotazony-na-svadbu-minsk/', 'picture/wedding/svadebnaya-fotozona-minsk-cvety.webp'],
            ['Юбилей', 'Фотозоны на юбилей', 'fotazona-na-yubiley-minsk/', 'picture/birthday/fotozona-den-rozhdeniya-minsk-scena.webp'],
            ['Корпоратив', 'Фотозоны для компаний', 'fotazona-na-korporativ-minsk/', 'picture/korporativ/fotozona-na-korporativ-minsk-zerkalo-tsvety.webp'],
            ['Gender party', 'Оформление reveal-праздника', 'gender-party-minsk/', 'picture/gender-party/gender-party-baby-butterfly-firework.webp'],
            ['День рождения', 'Фотозоны на день рождения', 'fotazony-na-den-rozhdeniya-minsk/', 'picture/birthday/fotozona-den-rozhdeniya-minsk-kryg.webp'],
            ['Аренда', 'Стены из пайеток', 'arenda-payetok-minsk/', 'picture/poetki/fotozona-minsk-poetki-hamelion.webp']
        ].filter((item) => !currentPath.includes(item[2].replaceAll('/', ''))).slice(0, 6);

        const section = document.createElement('section');
        section.className = 'seo-related';
        if (!document.getElementById('works')) section.id = 'works';
        const inner = document.createElement('div');
        inner.className = 'seo-related__inner';
        inner.innerHTML = `
            <div class="seo-related__heading">
                <p class="seo-eyebrow">Продолжить выбор</p>
                <h2 class="font-serif font-bold">Вам также может понравиться</h2>
            </div>
        `;
        const grid = document.createElement('div');
        grid.className = 'seo-related__grid';
        items.forEach(([label, title, href, image]) => {
            const card = document.createElement('a');
            card.className = 'seo-related__card';
            card.href = new URL(href, siteRoot).href;
            card.innerHTML = `
                <img src="${new URL(image, siteRoot).href}" alt="${title}" loading="lazy" decoding="async">
                <span class="seo-related__body"><span>${label}</span><h3>${title}</h3></span>
            `;
            grid.appendChild(card);
        });
        inner.appendChild(grid);
        section.appendChild(inner);
        main.appendChild(section);
    }

    function addFinalCta(page, projectModal) {
        const main = document.querySelector('main') || document.querySelector('.seo-article')?.parentElement;
        if (!main || document.querySelector('.seo-final-section')) return;
        const project = getPageProject(page);
        const ctaLabel = project
            ? 'Рассчитать эту фотозону'
            : 'Получить расчёт';
        const section = document.createElement('section');
        section.className = 'seo-final-section';
        section.innerHTML = `
            <div class="seo-final-cta">
                <p class="seo-eyebrow">Идея начинается с диалога</p>
                <h2 class="font-serif font-bold">Подберём оформление для вашего события</h2>
                <p>Напишите дату, площадку и формат мероприятия. Предложим состав фотозоны и ориентир по бюджету без лишних деталей.</p>
                <div class="seo-final-cta__actions">
                    <button type="button" data-analytics-location="final_cta" class="seo-btn seo-btn--primary">${ctaLabel}</button>
                    <a href="#works" class="seo-btn seo-btn--secondary">Смотреть работы</a>
                </div>
            </div>
        `;
        main.appendChild(section);
        bindInquiryTrigger(section.querySelector('button'), projectModal, project, project
            ? {
                source: 'Страница проекта',
                formLocation: 'seo_project_page',
                offerType: 'project_quote',
                offerName: 'Расчёт выбранной фотозоны',
                offerValue: 'individual_project_calculation',
                offerPage: window.location.pathname,
                offerLocation: 'project_detail_offer',
                eventType: page.category || '',
                formTitle: 'Узнать стоимость этой фотозоны',
                formDescription: 'Расскажите о мероприятии — подготовим расчёт выбранной фотозоны под вашу площадку и задачу.',
                submitLabel: 'Узнать стоимость'
            }
            : {
                source: 'Финальный CTA',
                formLocation: 'seo_final_cta'
            });
    }

    function addFooter(siteRoot) {
        if (document.querySelector('footer')) return;
        const footer = document.createElement('footer');
        footer.className = 'seo-site-footer';
        footer.innerHTML = `
            <div class="seo-site-footer__inner">
                <div class="seo-site-footer__brand">LAVDRAGON<small>Фотозоны и декор мероприятий в Минске</small></div>
                <div class="seo-site-footer__links">
                    <a href="${new URL('fotazony-na-svadbu-minsk/', siteRoot).href}">Свадьбы</a>
                    <a href="${new URL('fotazony-na-den-rozhdeniya-minsk/', siteRoot).href}">Дни рождения</a>
                    <a href="${new URL('fotazona-na-korporativ-minsk/', siteRoot).href}">Корпоративы</a>
                    <a href="${new URL('ceny-na-fotazony-minsk/', siteRoot).href}">Цены</a>
                    <a href="${new URL('blog/', siteRoot).href}">Блог</a>
                    <a href="${new URL('politics.html', siteRoot).href}">Политика</a>
                </div>
            </div>
        `;
        document.body.appendChild(footer);
    }

    function addMobileContact(page, projectModal) {
        if (document.querySelector('#sticky-cta, .mobile-contact-bar, .seo-mobile-contact')) return;
        const project = getPageProject(page);
        const ctaLabel = project
            ? 'Рассчитать эту фотозону'
            : 'Получить расчёт';
        const bar = document.createElement('div');
        bar.className = 'seo-mobile-contact';
        bar.setAttribute('aria-label', 'Быстрые действия');
        bar.innerHTML = `
            <div class="seo-mobile-contact__inner">
                <button type="button" data-analytics-location="floating_button">${ctaLabel}</button>
                <a href="tel:+375293342335" data-analytics-location="floating_button">Позвонить</a>
            </div>
        `;
        document.body.appendChild(bar);
        bindInquiryTrigger(bar.querySelector('button'), projectModal, project, project
            ? {
                source: 'Страница проекта',
                formLocation: 'seo_project_page',
                offerType: 'project_quote',
                offerName: 'Расчёт выбранной фотозоны',
                offerValue: 'individual_project_calculation',
                offerPage: window.location.pathname,
                offerLocation: 'project_detail_offer',
                eventType: page.category || '',
                formTitle: 'Узнать стоимость этой фотозоны',
                formDescription: 'Расскажите о мероприятии — подготовим расчёт выбранной фотозоны под вашу площадку и задачу.',
                submitLabel: 'Узнать стоимость'
            }
            : {
                source: 'Мобильная кнопка',
                formLocation: 'seo_mobile_cta'
            });
    }

    function bindGeneralInquiryCtas(projectModal) {
        document.querySelectorAll('[data-open-general-inquiry]').forEach((control) => {
            bindInquiryTrigger(control, projectModal, null, {
                source: control.dataset.inquirySource || 'Пакет услуг',
                formLocation: control.dataset.inquiryLocation || 'seo_service_package'
            });
        });
    }

    function optimizeImages(hero) {
        document.querySelectorAll('img').forEach((image) => {
            image.decoding = 'async';
            if (hero?.contains(image)) {
                image.loading = 'eager';
                image.setAttribute('fetchpriority', 'high');
            } else if (!image.closest('noscript')) {
                image.loading = 'lazy';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
