(function () {
    'use strict';

    const scriptSource = document.currentScript?.src || '';

    function start() {
        if (!document.querySelector('.seo-nav') || document.body.classList.contains('payetki-page')) {
            return;
        }

        document.body.classList.add('seo-standard-page');

        const siteRoot = scriptSource ? new URL('../', scriptSource) : new URL('/', window.location.href);
        const path = window.location.pathname.toLowerCase();
        const page = getPageConfig(path);

        enhanceNavigation();
        const hero = enhanceHero(page, siteRoot);
        const gallery = enhanceGallery();
        enhanceSections();
        enhanceFaq(page);
        addBenefits(hero);
        addInlineCtas(gallery);
        addRelated(page, siteRoot);
        addFinalCta();
        addFooter(siteRoot);
        addMobileContact();
        optimizeImages(hero);
    }

    function getPageConfig(path) {
        const configs = [
            {
                match: 'arenda-cifr-na-prazdnik-minsk',
                label: 'Аренда декора',
                image: 'picture/numbers/arenda-cifr-50-let-minsk.webp',
                imageAlt: 'Светящиеся цифры 50 перед серебряной панелью с бело-золотой гирляндой из шаров'
            },
            {
                match: 'ceny-na-fotazony-minsk',
                label: 'Стоимость оформления',
                image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-kryg.webp',
                imageAlt: 'Круглая уличная фотозона с бело-золотыми шарами, поздравлением и числом 45'
            },
            {
                match: 'dekor-svadby-minsk',
                label: 'Свадебный декор',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-kompoziciya.webp',
                imageAlt: 'Бежевая свадебная фотозона с круглыми панелями, розами, эвкалиптом и свечами'
            },
            {
                match: 'fotazona-na-korporativ-minsk',
                label: 'Корпоративные события',
                image: 'picture/korporativ/fotozona-na-korporativ-minsk-kypalie.webp',
                imageAlt: 'Бохо-фотозона на природе с белой панелью, пампасной травой, тюками сена и фонарями'
            },
            {
                match: 'fotazona-na-yubiley-minsk',
                label: 'Юбилеи',
                image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-scena.webp',
                imageAlt: 'Бежевая фотозона с перламутровыми шарами, бусами и светящейся надписью It’s my birthday'
            },
            {
                match: 'fotazony-dlya-detskih-prazdnikov-minsk',
                label: 'Детские праздники',
                image: 'picture/children-parties/detskaya-fotozona-minsk-pink.webp',
                imageAlt: 'Розово-жёлтая фотозона на годик с шарами, ромашками, креслом и объёмной цифрой один'
            },
            {
                match: 'fotazony-na-den-rozhdeniya-minsk',
                label: 'Дни рождения',
                image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-kryg.webp',
                imageAlt: 'Круглая уличная фотозона с бело-золотыми шарами, поздравлением и числом 45'
            },
            {
                match: 'fotazony-na-svadbu-minsk',
                label: 'Свадебные фотозоны',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-cvety.webp',
                imageAlt: 'Золотые прямоугольные рамы с белой драпировкой, розами и свечами'
            },
            {
                match: 'gender-party-minsk',
                label: 'Gender party',
                image: 'picture/gender-party/gender-party-baby-butterfly-firework.webp',
                imageAlt: 'Светящиеся буквы BABY и бабочки на фоне розового пиротехнического фонтана в сумерках'
            },
            {
                match: 'oformlenie-zala-minsk',
                label: 'Оформление мероприятий',
                image: 'picture/hall-decoration/decoration-minsk-service-rose.webp',
                imageAlt: 'Розовые розы и горящие белые свечи вдоль длинного праздничного стола'
            },
            {
                match: 'svadebnaya-fotozona-v-bezhevyh-tonah-minsk',
                label: 'Реализованный проект',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-cvety.webp',
                imageAlt: 'Золотые прямоугольные рамы с белой драпировкой, розами и свечами'
            },
            {
                match: 'skolko-stoit-fotozona-minsk-2026',
                label: 'Гид по стоимости',
                image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-stil.webp',
                imageAlt: 'Изумрудная фотозона с красно-белыми цветами, чёрно-золотыми шарами и табличкой Happy Birthday',
                works: 'ceny-na-fotazony-minsk/'
            },
            {
                match: 'trendy-svadebnogo-dekora-2026',
                label: 'Тренды и идеи',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-bloom.webp',
                imageAlt: 'Белая свадебная фотозона с цветочной аркой, креслами и тёплой гирляндой',
                works: 'fotazony-na-svadbu-minsk/'
            },
            {
                match: 'kak-vybrat-fotozonu-na-svadbu',
                label: 'Практический гид',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-kompoziciya.webp',
                imageAlt: 'Бежевая свадебная фотозона с круглыми панелями, розами, эвкалиптом и свечами',
                works: 'fotazony-na-svadbu-minsk/'
            },
            {
                match: 'idei-fotozon-dlya-yubileya',
                label: 'Подборка идей',
                image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-scena.webp',
                imageAlt: 'Бежевая фотозона с перламутровыми шарами, бусами и светящейся надписью It’s my birthday',
                works: 'fotazona-na-yubiley-minsk/'
            },
            {
                match: 'oformlenie-svadby-na-50-gostey',
                label: 'Планирование свадьбы',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-sad.webp',
                imageAlt: 'Стол молодожёнов с белой драпировкой, жемчужными нитями и деревьями в кашпо',
                works: 'dekor-svadby-minsk/'
            },
            {
                match: '/blog/',
                label: 'Журнал LavDragon',
                image: 'picture/wedding/svadebnaya-fotozona-minsk-dofamin.webp',
                imageAlt: 'Яркий банкетный стол с синими гортензиями, красными цветами и космическим фоном',
                works: 'fotazony-na-svadbu-minsk/'
            }
        ];

        return configs.find((config) => path.includes(config.match)) || {
            label: 'LavDragon · Минск',
            image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-stil.webp',
            imageAlt: 'Изумрудная фотозона с красно-белыми цветами, чёрно-золотыми шарами и табличкой Happy Birthday'
        };
    }

    function enhanceNavigation() {
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
        }
    }

    function enhanceHero(page, siteRoot) {
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

        const actions = ensureHeroActions(copy, page, siteRoot);
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

    function ensureHeroActions(copy, page, siteRoot) {
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
        calculate.textContent = 'Получить расчёт';
        calculate.className = 'seo-btn seo-btn--primary';

        let works = hashLink && hashLink !== calculate ? hashLink : null;
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

        return actions;
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

    function enhanceGallery() {
        const gallery = document.querySelector('.seo-gallery');
        if (!gallery) return null;
        if (!gallery.id) gallery.id = 'works';

        Array.from(gallery.querySelectorAll('img')).forEach((image) => {
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
        });

        return gallery.closest('section') || gallery;
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

    function addInlineCtas(gallerySection) {
        const main = document.querySelector('main');
        if (!main) return;
        const sections = Array.from(main.querySelectorAll(':scope > section.seo-section'));
        const faqSection = sections.find((section) => section.querySelector('.seo-faq'));
        const targets = [];
        if (sections[0] && sections[0] !== faqSection) targets.push(sections[0]);
        if (gallerySection && gallerySection !== faqSection && !targets.includes(gallerySection)) targets.push(gallerySection);
        if (!targets.length) {
            const article = main.querySelector(':scope > .seo-article');
            if (article) targets.push(article);
        }

        targets.forEach((target, index) => {
            const wrapper = document.createElement('section');
            wrapper.className = 'seo-section seo-section--compact';
            wrapper.innerHTML = `
                <div class="seo-inline-cta">
                    <div class="seo-inline-cta__copy">
                        <strong>${index === 0 ? 'Хотите обсудить идею?' : 'Понравилась эта работа?'}</strong>
                        <p>Подберём похожую фотозону под ваше мероприятие, площадку и бюджет.</p>
                    </div>
                    <a href="https://t.me/kidseventa1" target="_blank" rel="noopener noreferrer" data-analytics-location="section_cta" class="seo-btn seo-btn--primary">Получить расчёт</a>
                </div>
            `;
            target.insertAdjacentElement('afterend', wrapper);
        });
    }

    function addRelated(page, siteRoot) {
        const main = document.querySelector('main') || document.querySelector('.seo-article')?.parentElement;
        if (!main || document.querySelector('.seo-related')) return;
        const currentPath = window.location.pathname.toLowerCase();
        const items = [
            ['Свадьбы', 'Фотозоны на свадьбу', 'fotazony-na-svadbu-minsk/', 'picture/wedding/svadebnaya-fotozona-minsk-cvety.webp'],
            ['Юбилей', 'Фотозоны на юбилей', 'fotazona-na-yubiley-minsk/', 'picture/birthday/fotozona-den-rozhdeniya-minsk-scena.webp'],
            ['Корпоратив', 'Фотозоны для компаний', 'fotazona-na-korporativ-minsk/', 'picture/korporativ/fotozona-na-korporativ-minsk-kypalie.webp'],
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

    function addFinalCta() {
        const main = document.querySelector('main') || document.querySelector('.seo-article')?.parentElement;
        if (!main || document.querySelector('.seo-final-section')) return;
        const section = document.createElement('section');
        section.className = 'seo-final-section';
        section.innerHTML = `
            <div class="seo-final-cta">
                <p class="seo-eyebrow">Идея начинается с диалога</p>
                <h2 class="font-serif font-bold">Подберём оформление для вашего события</h2>
                <p>Напишите дату, площадку и формат мероприятия. Предложим состав фотозоны и ориентир по бюджету без лишних деталей.</p>
                <div class="seo-final-cta__actions">
                    <a href="https://t.me/kidseventa1" target="_blank" rel="noopener noreferrer" data-analytics-location="final_cta" class="seo-btn seo-btn--primary">Получить расчёт</a>
                    <a href="#works" class="seo-btn seo-btn--secondary">Смотреть работы</a>
                </div>
            </div>
        `;
        main.appendChild(section);
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

    function addMobileContact() {
        if (document.querySelector('#sticky-cta, .mobile-contact-bar, .seo-mobile-contact')) return;
        const bar = document.createElement('div');
        bar.className = 'seo-mobile-contact';
        bar.setAttribute('aria-label', 'Быстрые действия');
        bar.innerHTML = `
            <div class="seo-mobile-contact__inner">
                <a href="https://t.me/kidseventa1" target="_blank" rel="noopener noreferrer" data-analytics-location="floating_button">Получить расчёт</a>
                <a href="tel:+375293342335" data-analytics-location="floating_button">Позвонить</a>
            </div>
        `;
        document.body.appendChild(bar);
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
