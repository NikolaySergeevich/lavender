// Navbar scroll
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('glass', 'py-4', 'border-b', 'border-brand-black/5');
                navbar.classList.remove('py-5');
            } else {
                navbar.classList.remove('glass', 'py-4', 'border-b', 'border-brand-black/5');
                navbar.classList.add('py-5');
            }
        });

        // Mobile menu
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileBtn = document.getElementById('mobile-menu-btn');
        function openMobileMenu() {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');
            navbar.classList.add('mobile-menu-open');
            mobileBtn.setAttribute('aria-expanded', 'true');
            mobileBtn.setAttribute('aria-label', 'Закрыть меню');
        }
        function closeMobileMenu() {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
            navbar.classList.remove('mobile-menu-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
            mobileBtn.setAttribute('aria-label', 'Открыть меню');
        }
        function toggleMobileMenu() {
            if (mobileMenu.classList.contains('hidden')) openMobileMenu();
            else closeMobileMenu();
        }
        mobileBtn.addEventListener('click', toggleMobileMenu);

        // Mobile event picker carousel hint
        const eventPickerList = document.querySelector('.event-picker-list');
        const eventPickerChips = eventPickerList ? Array.from(eventPickerList.querySelectorAll('.event-picker-chip')) : [];
        const eventPickerMedia = window.matchMedia('(max-width: 768px)');
        let eventPickerFrame = null;
        let eventPickerStartPositioned = false;

        function resetEventPickerChips() {
            eventPickerChips.forEach(chip => {
                chip.style.removeProperty('--event-chip-scale');
                chip.style.removeProperty('--event-chip-opacity');
                chip.style.removeProperty('--event-chip-bg-alpha');
                chip.style.removeProperty('--event-chip-border-alpha');
                chip.style.removeProperty('--event-chip-shadow-alpha');
            });
        }

        function updateEventPickerChips() {
            eventPickerFrame = null;

            if (!eventPickerList || !eventPickerMedia.matches) {
                resetEventPickerChips();
                return;
            }

            const listRect = eventPickerList.getBoundingClientRect();
            const listCenter = listRect.left + listRect.width / 2;
            const activeDistance = listRect.width * 0.42;

            eventPickerChips.forEach(chip => {
                const chipRect = chip.getBoundingClientRect();
                const chipCenter = chipRect.left + chipRect.width / 2;
                const distance = Math.abs(listCenter - chipCenter);
                const progress = Math.max(0, 1 - distance / activeDistance);
                const scale = 0.76 + progress * 0.24;
                const opacity = 0.38 + progress * 0.62;
                const bgAlpha = 0.42 + progress * 0.5;
                const borderAlpha = 0.05 + progress * 0.06;
                const shadowAlpha = 0.025 + progress * 0.06;

                chip.style.setProperty('--event-chip-scale', scale.toFixed(3));
                chip.style.setProperty('--event-chip-opacity', opacity.toFixed(3));
                chip.style.setProperty('--event-chip-bg-alpha', bgAlpha.toFixed(3));
                chip.style.setProperty('--event-chip-border-alpha', borderAlpha.toFixed(3));
                chip.style.setProperty('--event-chip-shadow-alpha', shadowAlpha.toFixed(3));
            });
        }

        function requestEventPickerUpdate() {
            if (eventPickerFrame !== null) return;
            eventPickerFrame = requestAnimationFrame(updateEventPickerChips);
        }

        function positionEventPickerStart() {
            if (!eventPickerList || !eventPickerMedia.matches || eventPickerStartPositioned || eventPickerChips.length < 3) {
                return;
            }

            eventPickerStartPositioned = true;
            const target = eventPickerChips[1];
            const listRect = eventPickerList.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const offset = targetRect.left - listRect.left - (listRect.width - targetRect.width) / 2;
            eventPickerList.scrollLeft += offset;
            requestEventPickerUpdate();
        }

        if (eventPickerList && eventPickerChips.length) {
            eventPickerList.addEventListener('scroll', requestEventPickerUpdate, { passive: true });
            window.addEventListener('resize', requestEventPickerUpdate);
            if (typeof eventPickerMedia.addEventListener === 'function') {
                eventPickerMedia.addEventListener('change', requestEventPickerUpdate);
            }
            requestAnimationFrame(() => {
                positionEventPickerStart();
                requestEventPickerUpdate();
            });
        }

        // Reveal animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        // Counter animation
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('[data-count]');
                    counters.forEach(counter => {
                        const target = parseInt(counter.dataset.count);
                        const duration = 2000;
                        const step = target / (duration / 16);
                        let current = 0;
                        const timer = setInterval(() => {
                            current += step;
                            if (current >= target) { counter.textContent = target + '+'; clearInterval(timer); }
                            else { counter.textContent = Math.floor(current); }
                        }, 16);
                    });
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        const statsSection = document.getElementById('stats');
        if (statsSection) counterObserver.observe(statsSection);

        // Portfolio filters
        const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
        const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
        const portfolioLoadMoreBtn = document.getElementById('portfolio-load-more');
        const portfolioDesktopControls = document.getElementById('portfolio-desktop-controls');
        const portfolioPrevPageBtn = document.getElementById('portfolio-prev-page');
        const portfolioNextPageBtn = document.getElementById('portfolio-next-page');
        const portfolioMobileControls = document.getElementById('portfolio-mobile-controls');
        const portfolioMobilePrevBtn = document.getElementById('portfolio-mobile-prev');
        const portfolioMobileNextBtn = document.getElementById('portfolio-mobile-next');
        const homePortfolioLimit = 9;
        function isDesktopPortfolio() {
            return window.matchMedia('(min-width: 768px)').matches;
        }
        function getPortfolioBatchSize() {
            return isDesktopPortfolio() ? 6 : 3;
        }
        const portfolioDescriptions = [
            'Свадебная фотозона с зеркальной поверхностью, розами и мягким светом для камерных портретов пары.',
            'Нежная зона gender reveal с воздушными шарами, пастельной палитрой и акцентом для момента раскрытия.',
            'Яркая детская фотозона с шарами, тумбами и праздничной композицией для семейных снимков.',
            'Свадебная фотозона LOVE с неоном, розами и пампасом для вечерней программы и фото гостей.',
            'Лаконичная фотозона Happy Birthday с чистым фоном и праздничной надписью для взрослых дней рождения.',
            'Объемная birthday-зона с шарами, декоративными стойками и акцентной палитрой для главного фото вечера.',
            'Стильная фотозона для дня рождения с выверенными деталями, мягкими оттенками и праздничным настроением.',
            'Праздничный декор с шарами и декоративными элементами, который собирает пространство в единую композицию.',
            'Сценическая фотозона для дня рождения с шарами и выразительным фоном для поздравлений и семейных кадров.',
            'Атмосферная зона для дня рождения с теплым декором, подходящая для портретов и общих фото гостей.',
            'Праздничная фотозона с шарами и яркими цифрами для вашего лучшего дня рождения.',
            'Фотозона с плетёными корзинами и шарами: выпадающие шары с эффектом выливающегося волшебства.',
            'Круглая фотозона для взрослого дня рождения в тёплых нежных золотых оттенках.',
            'Сказочная детская фотозона с единорогом, гирляндами и мягкой палитрой для нежного праздника.',
            'Детская зона с воздушными шарами и декором, рассчитанная на динамичные фото и игры рядом с композицией.',
            'Свадебная композиция с декоративными формами и цветочными акцентами для зоны фото или президиума.',
            'Цветочная свадебная фотозона в нежной гамме с объемной флористикой и мягкой романтичной подачей.',
            'Свадебная фотозона со световым акцентом, которая хорошо работает на вечерней площадке и в приглушенном зале.',
            'Садовая свадебная фотозона с цветами и естественной зеленью для спокойных, воздушных кадров.',
            'Зеленая свадебная фотозона с натуральной палитрой и флористикой для элегантного банкетного пространства.',
            'Оформление welcome-зоны и выездной регистрации с цельной свадебной стилистикой и фотогеничным входом.',
            'Свадебная фотозона с цветами и декоративными панелями для портретов пары и гостей.',
            'Оформление свадебного стола в зеленой гамме с композицией, сервировкой и аккуратными деталями.',
            'Свадебный декор с сухоцветами и натуральными фактурами для теплой, спокойной концепции.',
            'Яркий свадебный декор в дофаминовой палитре для смелого праздника и выразительных фото.',
            'Свадебная полиграфия, меню и сервировка, поддерживающие общую палитру и стиль оформления.',
            'Свадебный декор с оранжевыми розами, теплой флористикой и насыщенным цветовым акцентом.',
            'Сервировка с розами и деталями декора для камерного свадебного стола или президиума.',
            'Зеленая детская фотозона с природными оттенками и спокойным праздничным декором.',
            'Белая космическая фотозона для детского праздника с чистым фоном и тематическими деталями.',
            'Космическая детская фотозона с насыщенным фоном и декором для яркой тематической вечеринки.',
            'Фотозона на первый день рождения мальчика с мягкими оттенками и безопасным детским декором.',
            'Нежная детская фотозона с бабочками, легкими деталями и воздушной праздничной атмосферой.',
            'Розовая детская фотозона с шарами и мягкой палитрой для дня рождения девочки.',
            'Фотозона на первый день рождения с нежной палитрой, шарами и аккуратной композицией для семейных фото.',
            'Детская фотозона на восьмой день рождения с чёрными пайетками, серебряными шарами и светящейся цифрой.',
            'Корпоративная фотозона с бренд-зоной, декором и аккуратной визуальной подачей для делового события.',
            'Фотозона «Купаллье» с природными фактурами и народными мотивами для тематического корпоратива.',
            'Корпоративная фотозона из кольца с шарами в фирменных цветах и автомобильными колёсами как декором по сфере деятельности компании.',
            'Дизайнерская корпоративная фотозона с фигурным зеркалом, цветами и зеленью для презентации, бренд-события или вечеринки.',
            'Оформление входной зоны кафе органической аркой из чёрных, оранжевых, кремовых и золотых шаров для коммерческого открытия.',
            'Оформление входной зоны стоматологии органической аркой из белых и приглушённо-зелёных шаров для открытия.',
            'Бренд-зона OZ с оранжево-белой аркой из шаров, фирменной печатью и учебными акцентами для рекламной кампании.',
            'Нежная gender party с бабочками, светлым декором и праздничным эффектом для reveal-момента.',
            'Фотозона gender party Oh Baby с wall of balls, мягкой палитрой и аккуратной зоной для reveal-момента.',
            'Фотозона gender party Baby Balls с воздушными шарами, мягкой композицией и светлым праздничным настроением.',
            'Фотозона gender party Boy or Girl с воздушными шарами, тематической надписью и нежной reveal-подачей.'
        ];
        const portfolioCategoryDetails = {
            wedding: {
                style: 'Свадебный декор',
                size: 'адаптируется под площадку',
                installation: 'в согласованное с площадкой окно',
                elements: 'панели, флористика и свет'
            },
            'gender-party': {
                style: 'Gender party',
                size: 'адаптируется под формат reveal',
                installation: 'до прихода гостей',
                elements: 'фон, шары и тематические детали'
            },
            kids: {
                style: 'Детский праздник',
                size: 'под дом, студию или зал',
                installation: 'до начала праздника',
                elements: 'безопасный декор и тематические акценты'
            },
            birthday: {
                style: 'День рождения или юбилей',
                size: 'под площадку и количество гостей',
                installation: 'в удобное для площадки время',
                elements: 'фон, шары, надпись и декор'
            },
            corporate: {
                style: 'Корпоративное событие',
                size: 'под зону welcome или сцену',
                installation: 'по таймингу мероприятия',
                elements: 'бренд-акценты и декор под формат'
            }
        };
        let currentPortfolioFilter = 'all';
        let visiblePortfolioIndexes = [];
        let visiblePortfolioCount = getPortfolioBatchSize();
        let currentPortfolioPage = 0;

        portfolioItems.forEach((item, index) => {
            item.dataset.portfolioIndex = index;
            const portfolioImage = item.querySelector('img');
            if (portfolioImage) {
                portfolioImage.loading = 'lazy';
                portfolioImage.decoding = 'async';
            }
            const description = portfolioDescriptions[index];
            if (description) {
                const descriptionNode = item.querySelector('.text-white\\/70');
                if (descriptionNode) descriptionNode.textContent = description;
            }

            const media = item.querySelector('.img-zoom');
            const title = item.querySelector('.font-serif')?.textContent.trim() || `Проект ${index + 1}`;
            const categorySlug = item.dataset.category || '';
            const imagePath = portfolioImage?.getAttribute('src') || '';
            const imageFileName = imagePath.split('/').pop()?.split('?')[0]?.replace(/\.[^.]+$/, '') || `project-${index + 1}`;
            if (!media || item.querySelector('.portfolio-card__details')) return;

            item.classList.add('portfolio-card');
            item.dataset.projectId = item.dataset.projectId || `${categorySlug || 'project'}-${imageFileName}`;
            media.classList.add('portfolio-card__media');
            if (media.classList.contains('aspect-[3/5]')) {
                media.classList.add('portfolio-card__media--portrait');
            }

            const details = document.createElement('div');
            details.className = 'portfolio-card__details';
            details.innerHTML = `
                <div class="portfolio-card__heading">
                    <h3 class="portfolio-card__title"></h3>
                    <p class="portfolio-card__description"></p>
                </div>
                <ul class="portfolio-card__benefits" aria-label="Характеристики проекта"></ul>
                <button type="button" class="portfolio-card__cta">Узнать стоимость</button>
            `;

            details.querySelector('.portfolio-card__title').textContent = title;
            details.querySelector('.portfolio-card__description').textContent = description || 'Проект можно адаптировать под формат и стиль вашего мероприятия.';
            const projectDetails = portfolioCategoryDetails[categorySlug] || {
                style: 'Фотозона для события',
                size: 'адаптируется под площадку',
                installation: 'в согласованное время',
                elements: 'декор под ваш формат'
            };
            const benefitsList = details.querySelector('.portfolio-card__benefits');
            [
                `Стиль: ${projectDetails.style}`,
                `Размер: ${projectDetails.size}`,
                `Время монтажа: ${projectDetails.installation}`,
                `Количество элементов: ${projectDetails.elements}`,
                `Особенность: ${description || 'палитра и детали под ваше событие'}`
            ].forEach((text) => {
                const benefit = document.createElement('li');
                benefit.textContent = text;
                benefitsList.appendChild(benefit);
            });

            const cta = details.querySelector('.portfolio-card__cta');
            cta.setAttribute('aria-label', `Узнать стоимость фотозоны «${title}»`);
            cta.addEventListener('click', (event) => {
                event.stopPropagation();
                const project = portfolioProjects[index];
                if (project) openProjectRequest(project, 'portfolio_card');
            });

            item.appendChild(details);
        });

        function shufflePortfolioItems(items) {
            const shuffled = [...items];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        function getPortfolioIndexesForFilter(filter) {
            if (filter === 'all') {
                const landscapeItems = portfolioItems.filter(item => item.querySelector('.aspect-\\[4\\/3\\]'));
                return shufflePortfolioItems(landscapeItems)
                    .slice(0, homePortfolioLimit)
                    .map(item => Number(item.dataset.portfolioIndex));
            }

            return portfolioItems
                .filter(item => item.dataset.category === filter)
                .map(item => Number(item.dataset.portfolioIndex));
        }

        function updatePortfolioControls(totalCount) {
            const isDesktop = isDesktopPortfolio();
            const batchSize = getPortfolioBatchSize();
            const maxPage = Math.max(0, Math.ceil(totalCount / batchSize) - 1);

            if (portfolioLoadMoreBtn) {
                portfolioLoadMoreBtn.classList.add('hidden');
            }

            if (portfolioMobileControls) {
                const shouldShowMobileControls = currentPortfolioFilter !== 'all' && !isDesktop && totalCount > batchSize;
                portfolioMobileControls.classList.toggle('hidden', !shouldShowMobileControls);
                portfolioMobileControls.classList.toggle('flex', shouldShowMobileControls);
            }

            if (portfolioDesktopControls) {
                const shouldShowDesktopControls = currentPortfolioFilter !== 'all' && isDesktop && totalCount > batchSize;
                portfolioDesktopControls.classList.toggle('hidden', !shouldShowDesktopControls);
                portfolioDesktopControls.classList.toggle('md:flex', shouldShowDesktopControls);
            }

            if (portfolioPrevPageBtn) portfolioPrevPageBtn.disabled = currentPortfolioPage <= 0;
            if (portfolioNextPageBtn) portfolioNextPageBtn.disabled = currentPortfolioPage >= maxPage;
        }

        function applyPortfolioFilter(filter, resetBatch = true) {
            currentPortfolioFilter = filter;
            if (resetBatch) {
                visiblePortfolioCount = getPortfolioBatchSize();
                currentPortfolioPage = 0;
            }

            const filterIndexes = getPortfolioIndexesForFilter(filter);
            if (filter === 'all') {
                visiblePortfolioIndexes = filterIndexes;
            } else if (isDesktopPortfolio()) {
                const batchSize = getPortfolioBatchSize();
                const maxPage = Math.max(0, Math.ceil(filterIndexes.length / batchSize) - 1);
                currentPortfolioPage = Math.min(currentPortfolioPage, maxPage);
                const start = currentPortfolioPage * batchSize;
                visiblePortfolioIndexes = filterIndexes.slice(start, start + batchSize);
            } else {
                const batchSize = getPortfolioBatchSize();
                const maxPage = Math.max(0, Math.ceil(filterIndexes.length / batchSize) - 1);
                currentPortfolioPage = Math.min(currentPortfolioPage, maxPage);
                const start = currentPortfolioPage * batchSize;
                visiblePortfolioIndexes = filterIndexes.slice(start, start + batchSize);
            }

            portfolioItems.forEach((item) => {
                const itemIndex = Number(item.dataset.portfolioIndex);
                const visibleIndex = visiblePortfolioIndexes.indexOf(itemIndex);
                item.style.display = visibleIndex >= 0 ? 'flex' : 'none';
                item.style.order = visibleIndex >= 0 ? String(visibleIndex) : '';
            });

            updatePortfolioControls(filterIndexes.length);
        }
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyPortfolioFilter(btn.dataset.filter);
            });
        });
        function scrollToFirstVisiblePortfolioItem() {
            const firstVisibleIndex = visiblePortfolioIndexes[0];
            const firstVisibleItem = Number.isInteger(firstVisibleIndex) ? portfolioItems[firstVisibleIndex] : null;
            if (!firstVisibleItem) return;
            firstVisibleItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        function changeMobilePortfolioPage(direction, trigger) {
            if (isDesktopPortfolio() || currentPortfolioFilter === 'all') return;
            const filterIndexes = getPortfolioIndexesForFilter(currentPortfolioFilter);
            const maxPage = Math.max(0, Math.ceil(filterIndexes.length / getPortfolioBatchSize()) - 1);
            if (direction > 0) {
                currentPortfolioPage = currentPortfolioPage >= maxPage ? 0 : currentPortfolioPage + 1;
            } else {
                currentPortfolioPage = currentPortfolioPage <= 0 ? maxPage : currentPortfolioPage - 1;
            }
            flashPortfolioNav(trigger);
            applyPortfolioFilter(currentPortfolioFilter, false);
            window.setTimeout(scrollToFirstVisiblePortfolioItem, 0);
        }
        portfolioLoadMoreBtn?.addEventListener('click', () => {
            changeMobilePortfolioPage(1, portfolioLoadMoreBtn);
        });
        portfolioMobilePrevBtn?.addEventListener('click', () => {
            changeMobilePortfolioPage(-1, portfolioMobilePrevBtn);
        });
        portfolioMobileNextBtn?.addEventListener('click', () => {
            changeMobilePortfolioPage(1, portfolioMobileNextBtn);
        });
        function flashPortfolioNav(button) {
            if (!button) return;
            button.classList.add('is-pressed');
            window.setTimeout(() => button.classList.remove('is-pressed'), 220);
        }
        portfolioPrevPageBtn?.addEventListener('click', () => {
            if (!isDesktopPortfolio()) return;
            flashPortfolioNav(portfolioPrevPageBtn);
            currentPortfolioPage = Math.max(0, currentPortfolioPage - 1);
            applyPortfolioFilter(currentPortfolioFilter, false);
        });
        portfolioNextPageBtn?.addEventListener('click', () => {
            if (!isDesktopPortfolio()) return;
            flashPortfolioNav(portfolioNextPageBtn);
            currentPortfolioPage += 1;
            applyPortfolioFilter(currentPortfolioFilter, false);
        });
        window.addEventListener('resize', () => {
            if (currentPortfolioFilter !== 'all') applyPortfolioFilter(currentPortfolioFilter, false);
        });
        applyPortfolioFilter('all');

        // FAQ
        function toggleFaq(item) {
            const answer = item.querySelector('.faq-answer');
            const arrow = item.querySelector('.faq-arrow');
            const isOpen = answer.classList.contains('open');
            document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
            document.querySelectorAll('.faq-arrow').forEach(a => a.classList.remove('rotate'));
            if (!isOpen) {
                answer.classList.add('open');
                arrow.classList.add('rotate');
            }
        }

        // Reviews slider
        let reviewPosition = 0;
        function createReviewCard({ image, imageAlt, name, meta, text }) {
            const stars = Array.from({ length: 5 }, () => `
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
            `).join('');

            return `
                <div class="review-slide w-full md:w-1/2 lg:w-1/3 shrink-0 px-4">
                    <article class="review-card">
                        <img src="${image}" alt="${imageAlt}" class="review-card__image" loading="lazy">
                        <div class="review-card__body">
                            <div class="review-card__stars">${stars}</div>
                            <p class="review-card__text">"${text}"</p>
                            <div class="review-card__person">
                                <p class="review-card__name">${name}</p>
                                <p class="review-card__meta">${meta}</p>
                            </div>
                        </div>
                    </article>
                </div>
            `;
        }

        const reviewsTrack = document.getElementById('reviews-track');
        const initialReviewImages = [
            { image: 'picture/wedding/svadebnaya-fotozona-minsk-kompoziciya.webp', imageAlt: 'Бежевая свадебная фотозона с круглыми панелями, розами, эвкалиптом и свечами' },
            { image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-scena.webp', imageAlt: 'Бежевая фотозона с перламутровыми шарами, бусами и светящейся надписью It’s my birthday' },
            { image: 'picture/wedding/svadebnaya-fotozona-minsk-svet.webp', imageAlt: 'Серая софа под круглой цветочной аркой с розами и тёплой гирляндой' }
        ];
        reviewsTrack?.querySelectorAll(':scope > div').forEach((slide, index) => {
            const card = slide.firstElementChild;
            const imageData = initialReviewImages[index];
            if (!card || !imageData) return;
            slide.classList.add('review-slide');
            card.classList.add('review-card');
            card.className = 'review-card';
            card.insertAdjacentHTML('afterbegin', `<img src="${imageData.image}" alt="${imageData.imageAlt}" class="review-card__image" loading="lazy">`);
            const existingContent = Array.from(card.children).slice(1);
            const body = document.createElement('div');
            body.className = 'review-card__body';
            existingContent.forEach(element => body.appendChild(element));
            card.appendChild(body);
            body.querySelector('.flex.gap-1')?.classList.add('review-card__stars');
            body.querySelector('.italic')?.classList.add('review-card__text');
            const person = body.querySelector('.flex.items-center.gap-3');
            person?.classList.add('review-card__person');
            person?.querySelector('.rounded-full')?.remove();
            const personContent = person?.querySelector(':scope > div');
            if (person && personContent) {
                while (personContent.firstChild) person.appendChild(personContent.firstChild);
                personContent.remove();
            }
            const personTexts = person?.querySelectorAll('p');
            personTexts?.[0]?.classList.add('review-card__name');
            personTexts?.[1]?.classList.add('review-card__meta');
        });
        const additionalReviews = [
            { image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-dekor.webp', imageAlt: 'Торжественная фотозона с чёрно-золотой гирляндой шаров, белыми цветами и поздравлением Сергею', name: 'Ольга М.', meta: 'Юбилей', text: 'Команда сама подсказала, как лучше поставить фотозону в зале. На фотографиях всё выглядит аккуратно и дорого.' },
            { image: 'picture/birthday/fotozona-den-rozhdeniya-minsk-happy-birthday.webp', imageAlt: 'Белая драпированная фотозона с цветочными композициями и английской надписью Happy Birthday', name: 'Ирина С.', meta: 'День рождения', text: 'Приехали вовремя, быстро всё смонтировали, а после праздника спокойно разобрали. Мы ни о чём не переживали.' },
            { image: 'picture/children-parties/detskaya-fotozona-minsk-butterflies.webp', imageAlt: 'Нежно-розовая фотозона на крещение Анечки с шарами, бантом и светящимися бабочками', name: 'Наталья К.', meta: 'Детский праздник', text: 'Фотозона получилась нежной и безопасной. Дети постоянно возле неё фотографировались, а родители просили контакты.' },
            { image: 'picture/wedding/svadebnaya-fotozona-minsk-sad.webp', imageAlt: 'Стол молодожёнов с белой драпировкой, жемчужными нитями и деревьями в кашпо', name: 'Алексей Р.', meta: 'Свадьба', text: 'Смета была понятной, без неожиданностей. В день свадьбы мы вообще не отвлекались на монтаж — всё уже было готово.' },
            { image: 'picture/gender-party/gender-party-minsk-shary.webp', imageAlt: 'Арочная композиция Girl or Boy с розово-голубыми шарами, золотыми листьями и кубиками BABE', name: 'Виктория П.', meta: 'Gender party', text: 'Цвета подобрали идеально. Фото вышли светлые, праздничные и без лишней перегрузки.' }
        ];
        if (reviewsTrack) {
            reviewsTrack.insertAdjacentHTML('beforeend', additionalReviews.map(createReviewCard).join(''));
        }

        function scrollReviews(direction, trigger) {
            if (trigger) {
                trigger.classList.add('is-pressed');
                window.setTimeout(() => trigger.classList.remove('is-pressed'), 220);
            }
            const track = document.getElementById('reviews-track');
            const slider = document.getElementById('reviews-slider');
            const itemWidth = track.children[0].offsetWidth;
            const visibleItems = Math.max(1, Math.floor(slider.offsetWidth / itemWidth));
            const maxPosition = -Math.max(0, track.children.length - visibleItems) * itemWidth;
            reviewPosition -= direction * itemWidth;
            if (reviewPosition > 0) reviewPosition = maxPosition;
            if (reviewPosition < maxPosition) reviewPosition = 0;
            track.style.transform = `translateX(${reviewPosition}px)`;
        }

        // Modal
        const modalOverlay = document.getElementById('modal-overlay');
        const modalText = document.getElementById('modal-text');
        const modalSuccess = document.getElementById('modal-success');
        const modalForm = document.getElementById('modal-form');
        const modalSource = document.getElementById('modal-source');
        const modalProjectFields = {
            selectedProject: document.getElementById('selected-project'),
            projectId: document.getElementById('modal-project-id'),
            projectImage: document.getElementById('modal-project-image'),
            projectCategory: document.getElementById('modal-project-category'),
            projectUrl: document.getElementById('modal-project-url'),
            pagePath: document.getElementById('modal-page-path'),
            formLocation: document.getElementById('modal-form-location'),
            offerType: document.getElementById('modal-offer-type'),
            offerName: document.getElementById('modal-offer-name'),
            offerValue: document.getElementById('modal-offer-value'),
            offerPage: document.getElementById('modal-offer-page'),
            offerLocation: document.getElementById('modal-offer-location'),
            availableOfferTypes: document.getElementById('modal-available-offer-types'),
            eventDate: document.getElementById('modal-event-date'),
            earlyBookingEligible: document.getElementById('modal-early-booking-eligible')
        };
        const modalTitle = document.getElementById('modal-title');
        const modalSubmitButton = modalForm?.querySelector('[type="submit"]');
        const modalEventType = modalForm?.querySelector('[name="eventType"]');
        const modalDateField = modalForm?.querySelector('[name="date"]');
        const modalOfferDateField = document.getElementById('modal-offer-date-field');
        const modalOfferDateStatus = document.getElementById('modal-offer-date-status');
        const modalCloseButton = modalOverlay?.querySelector('[data-modal-close]');
        const modalDialog = modalOverlay?.querySelector('.project-request-dialog');
        let modalLastActiveElement = null;
        let lightboxReturnElement = null;
        const today = new Date();
        const todayValue = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

        function validateEventDate(form) {
            const dateField = form.querySelector('.event-date');
            if (!dateField) return true;

            dateField.setAttribute('min', todayValue);
            if (dateField.required && !dateField.value) {
                dateField.setCustomValidity('Укажите дату мероприятия');
                dateField.reportValidity();
                return false;
            }
            if (dateField.value && !getLocalDate(dateField.value)) {
                dateField.setCustomValidity('Укажите дату мероприятия в корректном формате');
                dateField.reportValidity();
                return false;
            }
            if (dateField.value && dateField.value < todayValue) {
                dateField.value = '';
                dateField.classList.remove('is-selected');
                dateField.setCustomValidity('Выберите сегодняшнюю или будущую дату');
                dateField.reportValidity();
                return false;
            }

            dateField.setCustomValidity('');
            return true;
        }

        function setFormHiddenValue(form, name, value) {
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
            const threshold = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            threshold.setDate(threshold.getDate() + 30);
            return eventDate >= threshold ? 'yes' : 'no';
        }

        function syncOfferDateContext(form, showMessage = false) {
            const dateField = form?.querySelector('[name="date"]');
            const dateValue = dateField?.value || '';
            const isEarlyBooking = form?.dataset.earlyBookingOffer === 'true';
            const isSpecialOfferConsultation = form?.dataset.specialOfferConsultation === 'true';
            const requiresEventDate = form?.dataset.offerRequiresEventDate === 'true';

            setFormHiddenValue(form, 'event_date', dateValue);
            setFormHiddenValue(form, 'early_booking_eligible', (isEarlyBooking || isSpecialOfferConsultation)
                ? getEarlyBookingEligibility(dateValue)
                : '');

            if (form !== modalForm || !modalOfferDateStatus) return;

            modalOfferDateStatus.textContent = '';
            modalOfferDateStatus.dataset.state = '';
            if (isEarlyBooking && dateValue) {
                const eligible = getEarlyBookingEligibility(dateValue);
                if (eligible === 'yes') {
                    modalOfferDateStatus.textContent = 'Дата подходит под условие раннего бронирования. Итоговый подарок согласуем после уточнения состава заказа.';
                    modalOfferDateStatus.dataset.state = 'success';
                } else if (eligible === 'no') {
                    modalOfferDateStatus.textContent = 'До мероприятия меньше 30 дней. Мы всё равно проверим доступные варианты и возможные специальные условия.';
                    modalOfferDateStatus.dataset.state = 'notice';
                }
            } else if (requiresEventDate && showMessage && !dateValue) {
                modalOfferDateStatus.textContent = 'Укажите дату мероприятия, чтобы проверить условия предложения.';
                modalOfferDateStatus.dataset.state = 'notice';
            }
        }

        function setModalOfferDateRequirement(context = {}) {
            if (!modalForm || !modalDateField) return;
            const requiresEventDate = context.requiresEventDate === true;
            const isEarlyBooking = context.offerType === 'early_booking_gift';
            const isSpecialOfferConsultation = context.offerType === 'special_offer_consultation';
            modalForm.dataset.offerRequiresEventDate = requiresEventDate ? 'true' : 'false';
            modalForm.dataset.earlyBookingOffer = isEarlyBooking ? 'true' : 'false';
            modalForm.dataset.specialOfferConsultation = isSpecialOfferConsultation ? 'true' : 'false';
            if (modalOfferDateField) modalOfferDateField.hidden = !requiresEventDate;
            modalDateField.required = requiresEventDate;
            modalDateField.setAttribute('aria-required', requiresEventDate ? 'true' : 'false');
            modalDateField.placeholder = requiresEventDate
                ? 'Дата мероприятия — обязательно'
                : 'Дата мероприятия';
            syncOfferDateContext(modalForm, requiresEventDate);
        }

        function setModalProject(project, formLocation, context = {}) {
            const selectedProject = project?.title || context.selectedProject || '';

            if (modalProjectFields.selectedProject) modalProjectFields.selectedProject.value = selectedProject;
            if (modalProjectFields.projectId) modalProjectFields.projectId.value = project?.id || context.projectId || '';
            if (modalProjectFields.projectImage) modalProjectFields.projectImage.value = project?.imagePath || context.projectImage || '';
            if (modalProjectFields.projectCategory) modalProjectFields.projectCategory.value = project?.category || context.projectCategory || '';
            if (modalProjectFields.projectUrl) modalProjectFields.projectUrl.value = project?.pageUrl || context.projectUrl || '';
            if (modalProjectFields.pagePath) modalProjectFields.pagePath.value = window.location.pathname;
            if (modalProjectFields.formLocation) modalProjectFields.formLocation.value = formLocation || 'modal';
            if (modalProjectFields.offerType) modalProjectFields.offerType.value = context.offerType || '';
            if (modalProjectFields.offerName) modalProjectFields.offerName.value = context.offerName || '';
            if (modalProjectFields.offerValue) modalProjectFields.offerValue.value = context.offerValue || '';
            if (modalProjectFields.offerPage) modalProjectFields.offerPage.value = context.offerPage || '';
            if (modalProjectFields.offerLocation) modalProjectFields.offerLocation.value = context.offerLocation || '';
            if (modalProjectFields.availableOfferTypes) modalProjectFields.availableOfferTypes.value = context.availableOfferTypes || '';
            if (modalProjectFields.eventDate) modalProjectFields.eventDate.value = '';
            if (modalProjectFields.earlyBookingEligible) modalProjectFields.earlyBookingEligible.value = '';
        }

        function pushProjectPriceClick(project) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'project_price_click',
                project_name: project.title,
                project_category: project.category || project.categorySlug || '',
                page_path: window.location.pathname
            });
        }

        function openProjectRequest(project, formLocation) {
            pushProjectPriceClick(project);
            trackGoal('portfolio_click', { project: project.title, action: 'calculate' });
            openModal(project.title, `Портфолио — ${project.title}`, project, formLocation);
        }

        function openModal(packageName, sourceName, project, formLocation, context = {}) {
            const activeElement = document.activeElement;
            modalLastActiveElement = lightboxOverlay?.contains(activeElement)
                ? lightboxReturnElement
                : activeElement;
            if (typeof closeLightbox === 'function') closeLightbox(false, false);
            modalOverlay.classList.remove('hidden');
            modalOverlay.classList.add('flex');
            modalOverlay.setAttribute('aria-hidden', 'false');
            if (modalDialog) modalDialog.scrollTop = 0;
            modalSuccess.classList.add('hidden');
            modalForm.classList.remove('hidden');
            if (packageName) {
                modalSource.value = sourceName || `Модальная форма: ${packageName}`;
            } else {
                modalSource.value = sourceName || 'Модальная форма';
            }
            if (modalTitle) modalTitle.textContent = context.formTitle || 'Получите расчёт вашей фотозоны';
            modalText.textContent = context.formDescription
                || 'Расскажите о мероприятии — мы предложим подходящий вариант и рассчитаем стоимость.';
            if (modalSubmitButton) modalSubmitButton.textContent = context.submitLabel || 'Получить расчёт';
            if (modalEventType) modalEventType.value = context.eventType || '';
            setFormHiddenValue(modalForm, 'requested_services', context.requestedServices || '');
            if (modalDateField) {
                modalDateField.value = '';
                modalDateField.classList.remove('is-selected');
                modalDateField.setCustomValidity('');
            }
            setModalProject(project, formLocation, context);
            setModalOfferDateRequirement(context);
            trackGoal('form_open', {
                source: modalSource.value,
                offer_type: context.offerType || ''
            });
            document.body.style.overflow = 'hidden';
            window.setTimeout(() => {
                const firstField = modalForm.querySelector('input:not([type="hidden"])');
                (firstField || modalCloseButton)?.focus();
            }, 0);
        }
        function closeModal() {
            modalOverlay.classList.add('hidden');
            modalOverlay.classList.remove('flex');
            modalOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (modalLastActiveElement && typeof modalLastActiveElement.focus === 'function') {
                modalLastActiveElement.focus();
            }
        }

        const SPECIAL_OFFER_CONTEXT = {
            offerType: 'special_offer_consultation',
            offerName: 'Подбор специального предложения',
            offerValue: 'manager_selects_best_offer',
            formTitle: 'Узнайте, какое предложение доступно для вашего события',
            formDescription: 'Укажите дату и расскажите, что планируете оформить. Менеджер проверит условия раннего бронирования, комплексного заказа и доступность выбранной даты.',
            submitLabel: 'Получить предложение',
            requiresEventDate: true,
            projectCategory: 'Фотозоны'
        };
        const HERO_SPECIAL_OFFER_FORM = {
            formTitle: 'Получите расчёт и узнайте доступную выгоду',
            formDescription: 'Укажите дату и расскажите о мероприятии. Менеджер рассчитает оформление и проверит, доступны ли подарок, скидка на дополнительную зону или специальные условия на вашу дату.',
            submitLabel: 'Получить расчёт с выгодой',
            formLocation: 'homepage_hero_special_offer'
        };

        function pushOfferEvent(eventName, context = {}) {
            if (!context.offerType) return;
            const eventData = {
                event: eventName,
                offer_type: context.offerType,
                offer_name: context.offerName || '',
                offer_page: context.offerPage || window.location.pathname,
                offer_location: context.offerLocation || '',
                page_path: window.location.pathname
            };
            if (context.offerValue) eventData.offer_value = context.offerValue;
            if (context.availableOfferTypes) eventData.available_offer_types = context.availableOfferTypes;
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(eventData);
            console.info(`dataLayer ${eventName}:`, eventData);
        }

        function getSpecialOfferContext(block) {
            return {
                ...SPECIAL_OFFER_CONTEXT,
                availableOfferTypes: block?.dataset.availableOfferTypes
                    || 'early_booking_gift,bundle_discount,available_date_offer',
                offerPage: window.location.pathname,
                offerLocation: block?.dataset.offerLocation || 'homepage_special_offer',
                projectUrl: window.location.href
            };
        }

        function getHeroSpecialOfferContext(block) {
            return {
                ...getSpecialOfferContext(block),
                ...HERO_SPECIAL_OFFER_FORM,
                offerLocation: 'homepage_hero'
            };
        }

        function observeSpecialOfferBlock(block, context) {
            if (!block || !('IntersectionObserver' in window)) return;
            let timer = null;
            const offerObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.target.dataset.offerViewed === 'true') return;
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        if (timer) return;
                        block.dataset.offerVisible = 'true';
                        timer = window.setTimeout(() => {
                            if (block.dataset.offerVisible !== 'true' || block.dataset.offerViewed === 'true') return;
                            block.dataset.offerViewed = 'true';
                            pushOfferEvent('offer_view', context);
                            offerObserver.unobserve(block);
                            timer = null;
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

        function pushSpecialOfferTeaserClick(context) {
            window.dataLayer = window.dataLayer || [];
            const eventData = {
                event: 'offer_teaser_click',
                offer_type: context.offerType,
                offer_page: context.offerPage || window.location.pathname,
                target: '#special-offer',
                page_path: window.location.pathname
            };
            if (context.offerLocation) eventData.offer_location = context.offerLocation;
            window.dataLayer.push(eventData);
            console.info('dataLayer offer_teaser_click:', eventData);
        }

        function bindHomeSpecialOffer() {
            const block = document.querySelector('[data-special-offer-block]');
            if (!block) return;
            const context = getSpecialOfferContext(block);
            const button = block.querySelector('[data-special-offer-open]');
            button?.addEventListener('click', () => {
                pushOfferEvent('offer_click', context);
                openModal(
                    context.offerName,
                    'Главная — специальные условия',
                    null,
                    'special_offer_cta',
                    context
                );
            });
            const heroContext = getHeroSpecialOfferContext(block);
            const heroOfferButton = document.querySelector('[data-hero-special-offer-open]');
            heroOfferButton?.addEventListener('click', () => {
                pushOfferEvent('offer_click', heroContext);
                openModal(
                    heroContext.offerName,
                    'Главная — расчёт с выгодой',
                    null,
                    heroContext.formLocation,
                    heroContext
                );
            });
            document.querySelectorAll('[data-hero-special-offer-teaser]').forEach((teaser) => {
                teaser.addEventListener('click', (event) => {
                    const targetSelector = teaser.getAttribute('href') || '#special-offer';
                    const target = document.querySelector(targetSelector);
                    pushSpecialOfferTeaserClick(heroContext);
                    if (!target) return;

                    event.preventDefault();
                    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
                    target.focus({ preventScroll: true });
                    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
                    if (window.history?.pushState) {
                        window.history.pushState(null, '', targetSelector);
                    }
                });
            });
            observeSpecialOfferBlock(block, context);
        }

        bindHomeSpecialOffer();

        document.addEventListener('keydown', (event) => {
            if (!modalOverlay || modalOverlay.classList.contains('hidden')) return;
            if (event.key === 'Escape') {
                closeModal();
                return;
            }
            if (event.key !== 'Tab') return;

            const focusable = Array.from(modalOverlay.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
            )).filter((element) => element.offsetParent !== null);
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

        // PDF catalog lead magnet
        const pdfCatalogOverlay = document.getElementById('pdf-catalog-overlay');
        const pdfCatalogFormView = document.getElementById('pdf-catalog-form-view');
        const pdfCatalogSuccess = document.getElementById('pdf-catalog-success');
        const pdfCatalogSessionKey = 'pdf_catalog_downloaded';
        const pdfCatalogFile = 'LavDragon_Trendy_2026.pdf';
        const pdfCatalogDownloadName = 'katalog-trendov-fotozon-2026-lavdragon.pdf';

        function trackPdfDownload() {
            if (typeof gtag === 'function') {
                gtag('event', 'pdf_download');
            }
            trackGoal('pdf_download', { file: pdfCatalogDownloadName });
        }

        function downloadPdfCatalog() {
            const downloadLink = document.createElement('a');
            downloadLink.href = pdfCatalogFile;
            downloadLink.download = pdfCatalogDownloadName;
            downloadLink.hidden = true;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            trackPdfDownload();
        }

        function openPdfCatalog() {
            if (sessionStorage.getItem(pdfCatalogSessionKey) === 'true') {
                downloadPdfCatalog();
                return;
            }

            pdfCatalogFormView.classList.remove('hidden');
            pdfCatalogSuccess.classList.add('hidden');
            pdfCatalogOverlay.classList.remove('hidden');
            pdfCatalogOverlay.classList.add('flex');
            document.body.style.overflow = 'hidden';
            trackGoal('form_open', { source: 'PDF Каталог трендов 2026' });
        }

        function closePdfCatalog() {
            pdfCatalogOverlay.classList.add('hidden');
            pdfCatalogOverlay.classList.remove('flex');
            document.body.style.overflow = '';
        }

        function showPdfCatalogSuccess() {
            pdfCatalogFormView.classList.add('hidden');
            pdfCatalogSuccess.classList.remove('hidden');
            pdfCatalogOverlay.classList.remove('hidden');
            pdfCatalogOverlay.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }

        // Contact form
        const contactSuccess = document.getElementById('contact-success');
        const contactForm = document.getElementById('contact-form');

        // Exit Intent
        let exitShown = false;
        document.addEventListener('mouseleave', (e) => {
            const hasOpenOverlay = document.querySelector(
                '#modal-overlay:not(.hidden), #quiz-overlay:not(.hidden), #pdf-catalog-overlay:not(.hidden), #lightbox-overlay:not(.hidden)'
            );
            if (e.clientY < 5 && !exitShown && !hasOpenOverlay) {
                document.getElementById('exit-popup').classList.remove('hidden');
                document.getElementById('exit-popup').classList.add('visible', 'flex');
                trackGoal('form_open', { source: 'Exit popup — расчёт стоимости' });
                document.body.style.overflow = 'hidden';
                exitShown = true;
            }
        });
        function closeExitPopup() {
            document.getElementById('exit-popup').classList.add('hidden');
            document.getElementById('exit-popup').classList.remove('visible', 'flex');
            document.body.style.overflow = '';
        }
        // Calculation form
        const quizOverlay = document.getElementById('quiz-overlay');
        function openQuiz() {
            quizOverlay.classList.remove('hidden');
            quizOverlay.classList.add('flex');
            trackGoal('form_open', { source: 'Квиз расчёта стоимости' });
            document.body.style.overflow = 'hidden';
        }
        function closeQuiz() {
            quizOverlay.classList.add('hidden');
            quizOverlay.classList.remove('flex');
            document.body.style.overflow = '';
        }
        // Lightbox
        const portfolioProjects = portfolioItems.map((item) => {
            const image = item.querySelector('img');
            const title = item.querySelector('.font-serif')?.textContent.trim() || 'Проект LAVDRAGON';
            const meta = item.querySelector('.text-white\\/70')?.textContent.trim() || '';
            const category = item.querySelector('.absolute.top-4')?.textContent.trim() || '';
            const fit = item.dataset.lightboxFit || 'cover';
            const position = item.dataset.lightboxPosition || 'center center';
            const categorySlug = item.dataset.category || '';
            const imagePath = image.getAttribute('src') || '';
            const id = item.dataset.projectId || `${categorySlug || 'project'}-${Number(item.dataset.portfolioIndex) + 1}`;
            return {
                id,
                image: image.src,
                imagePath,
                alt: image.alt,
                title,
                meta,
                category,
                categorySlug,
                fit,
                position,
                pageUrl: window.location.href
            };
        });
        const lightboxOverlay = document.getElementById('lightbox-overlay');
        let lightboxIndex = 0;
        let lightboxProjects = portfolioProjects;

        function openLightbox(target) {
            const idx = target instanceof Element
                ? Number(target.dataset.portfolioIndex)
                : Number(target);
            lightboxReturnElement = target instanceof Element
                ? target.querySelector('.portfolio-card__cta')
                : document.activeElement;
            const portfolioTitle = portfolioProjects[idx]?.title || 'Проект';
            trackGoal('portfolio_click', { project: portfolioTitle });
            const item = portfolioItems[idx];
            const visibleIndexes = visiblePortfolioIndexes.length ? visiblePortfolioIndexes : getPortfolioIndexesForFilter(currentPortfolioFilter);

            if (currentPortfolioFilter === 'all') {
                lightboxProjects = visibleIndexes.map(index => portfolioProjects[index]);
                lightboxIndex = visibleIndexes.indexOf(idx);
            } else {
                lightboxProjects = portfolioProjects.filter(project => project.categorySlug === item?.dataset.category);
                lightboxIndex = lightboxProjects.findIndex(project => project === portfolioProjects[idx]);
            }

            if (lightboxIndex < 0) {
                lightboxProjects = [portfolioProjects[idx]];
                lightboxIndex = 0;
            }

            renderLightbox();
            const lightboxDialog = lightboxOverlay.querySelector('.lightbox-dialog');
            const lightboxDetails = lightboxOverlay.querySelector('.lightbox-dialog__details');
            if (lightboxDialog) lightboxDialog.scrollTop = 0;
            if (lightboxDetails) lightboxDetails.scrollTop = 0;
            lightboxOverlay.classList.remove('hidden');
            lightboxOverlay.classList.add('flex');
            lightboxOverlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            window.setTimeout(() => lightboxOverlay.querySelector('.lightbox-close')?.focus(), 0);
        }
        function closeLightbox(restoreScroll = true, restoreFocus = true) {
            if (!lightboxOverlay) return;
            lightboxOverlay.classList.add('hidden');
            lightboxOverlay.classList.remove('flex');
            lightboxOverlay.setAttribute('aria-hidden', 'true');
            if (restoreScroll) document.body.style.overflow = '';
            if (restoreFocus && lightboxReturnElement instanceof HTMLElement) {
                lightboxReturnElement.focus();
            }
        }
        function changeLightbox(direction, trigger) {
            if (trigger) {
                trigger.classList.add('is-pressed');
                window.setTimeout(() => trigger.classList.remove('is-pressed'), 220);
            }
            if (!lightboxProjects.length) return;
            lightboxIndex = (lightboxIndex + direction + lightboxProjects.length) % lightboxProjects.length;
            renderLightbox();
        }
        function renderLightbox() {
            const project = lightboxProjects[lightboxIndex];
            if (!project) return;
            const lightboxImage = document.getElementById('lightbox-image');
            lightboxImage.src = project.image;
            lightboxImage.alt = project.alt;
            lightboxImage.style.objectFit = project.fit;
            lightboxImage.style.objectPosition = project.position;
            document.getElementById('lightbox-title').textContent = project.title;
            document.getElementById('lightbox-meta').textContent = project.meta;
            document.getElementById('lightbox-category').textContent = project.category;
        }
        document.getElementById('lightbox-cta')?.addEventListener('click', () => {
            const project = lightboxProjects[lightboxIndex];
            if (!project) return;
            openProjectRequest(project, 'portfolio_lightbox');
        });

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                if (href === '#') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        document.addEventListener('keydown', (event) => {
            if (lightboxOverlay.classList.contains('hidden')) return;
            if (event.key === 'Escape') {
                closeLightbox();
                return;
            }
            if (event.key === 'ArrowLeft') {
                changeLightbox(-1);
                return;
            }
            if (event.key === 'ArrowRight') {
                changeLightbox(1);
                return;
            }
            if (event.key !== 'Tab') return;

            const focusable = Array.from(lightboxOverlay.querySelectorAll(
                'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            )).filter((element) => element.offsetParent !== null);
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

        document.addEventListener('keydown', (event) => {
            const exitPopup = document.getElementById('exit-popup');
            if (event.key === 'Escape' && exitPopup?.classList.contains('visible')) {
                closeExitPopup();
            }
        });

        // LocalStorage form autosave
        const formFields = document.querySelectorAll('#contact-form input, #contact-form textarea, #contact-form select');
        formFields.forEach(field => {
            const saved = localStorage.getItem(`contact-form-${field.name || field.type}`);
            if (saved) field.value = saved;
            field.addEventListener('input', () => {
                localStorage.setItem(`contact-form-${field.name || field.type}`, field.value);
            });
        });

        // Event type selects
        const eventSelects = document.querySelectorAll('.event-select');
        function updateEventSelectState(select) {
            select.classList.toggle('is-selected', select.selectedIndex > 0);
        }
        eventSelects.forEach(select => {
            updateEventSelectState(select);
            select.addEventListener('change', () => updateEventSelectState(select));
            select.form?.addEventListener('reset', () => setTimeout(() => updateEventSelectState(select), 0));
        });

        // Event date fields
        const eventDateFields = document.querySelectorAll('.event-date');
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const weekdayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        const eventCalendar = document.createElement('div');
        let activeDateField = null;
        let activeCalendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        eventCalendar.className = 'event-calendar hidden';
        eventCalendar.setAttribute('role', 'dialog');
        eventCalendar.setAttribute('aria-label', 'Выбор даты мероприятия');
        document.body.appendChild(eventCalendar);

        function formatDateValue(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        function parseDateValue(value) {
            const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
            if (!match) return null;
            return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        }

        function closeEventCalendar() {
            eventCalendar.classList.add('hidden');
            if (activeDateField) activeDateField.setAttribute('aria-expanded', 'false');
            activeDateField = null;
        }

        function positionEventCalendar(field) {
            const rect = field.getBoundingClientRect();
            const width = Math.min(340, window.innerWidth - 24);
            const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
            const calendarHeight = eventCalendar.offsetHeight || 360;
            const fitsBelow = rect.bottom + 8 + calendarHeight <= window.innerHeight - 12;
            const top = fitsBelow
                ? rect.bottom + 8
                : Math.max(12, rect.top - calendarHeight - 8);
            eventCalendar.style.left = `${left}px`;
            eventCalendar.style.top = `${top}px`;
        }

        function renderEventCalendar() {
            if (!activeDateField) return;

            const year = activeCalendarMonth.getFullYear();
            const month = activeCalendarMonth.getMonth();
            const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            eventCalendar.innerHTML = `
                <div class="event-calendar__header">
                    <button type="button" class="event-calendar__nav" data-calendar-prev aria-label="Предыдущий месяц">‹</button>
                    <span>${monthNames[month]} ${year}</span>
                    <button type="button" class="event-calendar__nav" data-calendar-next aria-label="Следующий месяц">›</button>
                </div>
                <div class="event-calendar__grid">
                    ${weekdayNames.map(day => `<div class="event-calendar__weekday">${day}</div>`).join('')}
                    ${Array.from({ length: firstDayOffset }, () => '<div></div>').join('')}
                    ${Array.from({ length: daysInMonth }, (_, index) => {
                        const day = index + 1;
                        const date = new Date(year, month, day);
                        const value = formatDateValue(date);
                        const isPast = value < todayValue;
                        const isSelected = value === activeDateField.value;
                        return `<button type="button" class="event-calendar__day${isPast ? ' is-past' : ''}${isSelected ? ' is-selected' : ''}" data-date="${value}" ${isPast ? 'disabled aria-disabled="true"' : ''}>${day}</button>`;
                    }).join('')}
                </div>
            `;

            eventCalendar.querySelector('[data-calendar-prev]').addEventListener('click', () => {
                activeCalendarMonth = new Date(year, month - 1, 1);
                renderEventCalendar();
            });
            eventCalendar.querySelector('[data-calendar-next]').addEventListener('click', () => {
                activeCalendarMonth = new Date(year, month + 1, 1);
                renderEventCalendar();
            });
            eventCalendar.querySelectorAll('[data-date]').forEach(button => {
                button.addEventListener('click', () => {
                    activeDateField.value = button.dataset.date;
                    activeDateField.dispatchEvent(new Event('input', { bubbles: true }));
                    activeDateField.dispatchEvent(new Event('change', { bubbles: true }));
                    closeEventCalendar();
                });
            });
        }

        function openEventCalendar(field) {
            activeDateField = field;
            const selectedDate = parseDateValue(field.value);
            activeCalendarMonth = selectedDate || new Date(today.getFullYear(), today.getMonth(), 1);
            field.setAttribute('aria-expanded', 'true');
            renderEventCalendar();
            eventCalendar.classList.remove('hidden');
            positionEventCalendar(field);
        }

        function updateEventDateState(field) {
            field.setAttribute('min', todayValue);
            if (field.value && field.value < todayValue) {
                field.value = '';
                localStorage.removeItem(`contact-form-${field.name || field.type}`);
            }
            field.setCustomValidity('');
            field.classList.toggle('is-selected', Boolean(field.value));
        }
        eventDateFields.forEach(field => {
            field.type = 'text';
            field.readOnly = true;
            field.inputMode = 'none';
            field.placeholder = 'Дата мероприятия';
            field.setAttribute('aria-haspopup', 'dialog');
            field.setAttribute('aria-expanded', 'false');
            updateEventDateState(field);
            field.addEventListener('input', () => {
                updateEventDateState(field);
                syncOfferDateContext(field.form);
            });
            field.addEventListener('change', () => {
                updateEventDateState(field);
                syncOfferDateContext(field.form);
            });
            field.addEventListener('click', () => openEventCalendar(field));
            field.addEventListener('focus', () => openEventCalendar(field));
            field.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') closeEventCalendar();
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openEventCalendar(field);
                }
            });
            field.form?.addEventListener('reset', () => setTimeout(() => updateEventDateState(field), 0));
        });
        document.addEventListener('click', (event) => {
            if (!activeDateField) return;
            if (event.target === activeDateField || eventCalendar.contains(event.target)) return;
            closeEventCalendar();
        });
        window.addEventListener('resize', () => {
            if (activeDateField) positionEventCalendar(activeDateField);
        });
        window.addEventListener('scroll', () => {
            if (activeDateField) positionEventCalendar(activeDateField);
        }, true);

        const urlParams = new URLSearchParams(window.location.search);
        const sentStatus = urlParams.get('sent');
        const pdfCatalogStatus = urlParams.get('pdf_catalog') === '1';
        if (sentStatus === '1') {
            if (typeof fbq === 'function') {
                fbq('track', 'Lead');
            }
            if (typeof ym === 'function') {
                ym(109623826, 'reachGoal', 'lead_submit');
            }
            if (pdfCatalogStatus) {
                sessionStorage.setItem(pdfCatalogSessionKey, 'true');
                showPdfCatalogSuccess();
                downloadPdfCatalog();
            } else {
                alert('Спасибо! Мы уже получили заявку и скоро свяжемся с вами.');
            }
            history.replaceState(null, '', window.location.pathname);
        }

        function trackGoal(goal, params = {}) {
            if (typeof ym === 'function') {
                ym(109623826, 'reachGoal', goal, params);
            }
        }

        function pushGenerateLeadEvent(form) {
            window.dataLayer = window.dataLayer || [];

            const generateLeadEvent = {
                event: 'generate_lead',
                lead_source: 'website_form',
                form_name: form?.querySelector('[name="source"]')?.value
                    || form?.getAttribute('data-form-name')
                    || form?.id
                    || 'website_form',
                page_path: window.location.pathname,
                selected_project: form?.querySelector('[name="selected_project"]')?.value || '',
                form_location: form?.querySelector('[name="form_location"]')?.value
                    || form?.id
                    || 'website_form'
            };
            const selectedProject = form?.querySelector('[name="selected_project"]')?.value || '';
            const offerType = form?.querySelector('[name="offer_type"]')?.value || '';
            const offerName = form?.querySelector('[name="offer_name"]')?.value || '';
            const offerValue = form?.querySelector('[name="offer_value"]')?.value || '';
            const offerPage = form?.querySelector('[name="offer_page"]')?.value || '';
            const offerLocation = form?.querySelector('[name="offer_location"]')?.value || '';
            const availableOfferTypes = form?.querySelector('[name="available_offer_types"]')?.value || '';
            const eventDate = form?.querySelector('[name="event_date"]')?.value || '';
            const requestedServices = form?.querySelector('[name="requested_services"]')?.value || '';
            const earlyBookingEligible = form?.querySelector('[name="early_booking_eligible"]')?.value || '';
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

            window.dataLayer.push(generateLeadEvent);
            console.info('dataLayer generate_lead:', generateLeadEvent);
        }

        window.pushGenerateLeadEvent = pushGenerateLeadEvent;

        function handleSuccessfulFormSubmission(form) {
            pushGenerateLeadEvent(form);

            if (typeof fbq === 'function') {
                fbq('track', 'Lead');
            }
            trackGoal('lead_submit', {
                source: form.querySelector('[name="source"]')?.value || 'Форма сайта'
            });

            if (form.id === 'pdf-catalog-form') {
                sessionStorage.setItem(pdfCatalogSessionKey, 'true');
                showPdfCatalogSuccess();
                downloadPdfCatalog();
                return;
            }

            if (form.id === 'modal-form') {
                modalForm.classList.add('hidden');
                modalSuccess.classList.remove('hidden');
                modalSuccess.focus();
                return;
            }

            if (form.id === 'contact-form') {
                contactForm.classList.add('hidden');
                contactSuccess.classList.remove('hidden');
                return;
            }

            if (form.id === 'quiz-form') {
                closeQuiz();
            } else if (form.closest('#exit-popup')) {
                closeExitPopup();
            }

            alert('Спасибо! Мы уже получили заявку и скоро свяжемся с вами.');
        }

        function ensureHiddenField(form, name, value) {
            let field = form.querySelector(`[name="${name}"]`);
            if (!field) {
                field = document.createElement('input');
                field.type = 'hidden';
                field.name = name;
                form.appendChild(field);
            }
            if (!field.value) field.value = value;
            return field;
        }

        function applyServerOfferContext(form, offerContext) {
            if (!form || !offerContext || typeof offerContext !== 'object') return;
            [
                'selected_project',
                'project_category',
                'project_url',
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
                    setFormHiddenValue(form, name, String(offerContext[name] ?? ''));
                }
            });
        }

        document.querySelectorAll('form[action="send.php"]').forEach(form => {
            ensureHiddenField(form, 'page_path', window.location.pathname);
            ensureHiddenField(
                form,
                'form_location',
                form.querySelector('[name="source"]')?.value || form.id || 'website_form'
            );
            [
                'selected_project',
                'project_category',
                'project_url',
                'eventType',
                'offer_type',
                'offer_name',
                'offer_value',
                'available_offer_types',
                'offer_page',
                'offer_location',
                'event_date',
                'requested_services',
                'early_booking_eligible'
            ].forEach((name) => ensureHiddenField(form, name, ''));

            form.addEventListener('submit', async event => {
                event.preventDefault();
                if (form.dataset.submitting === 'true') return;

                syncOfferDateContext(form, true);
                if (!validateEventDate(form) || !form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                trackGoal('form_submit', {
                    source: form.querySelector('[name="source"]')?.value || 'Форма сайта'
                });

                const submitButton = event.submitter || form.querySelector('[type="submit"]');
                const originalButtonText = submitButton?.textContent;

                form.dataset.submitting = 'true';
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Отправка...';
                }

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
                    handleSuccessfulFormSubmission(form);
                    form.reset();
                } catch (error) {
                    console.error('Ошибка отправки формы:', error);
                    alert(error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
                } finally {
                    form.dataset.submitting = 'false';
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }
                }
            });
        });

        const contactFormObserver = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            trackGoal('form_open', { source: 'Форма в разделе контактов' });
            contactFormObserver.disconnect();
        }, { threshold: 0.45 });
        if (contactForm) contactFormObserver.observe(contactForm);

        document.addEventListener('click', event => {
            const telegramLink = event.target.closest('a[href*="t.me/"]');
            const telegramButton = event.target.closest('button[onclick*="t.me/"]');
            const phoneLink = event.target.closest('a[href^="tel:"]');
            if (telegramLink || telegramButton) {
                trackGoal('telegram_click', { href: telegramLink?.href || 'success_button' });
            }
            if (phoneLink) trackGoal('phone_click', { href: phoneLink.href });
        });
        if (sentStatus === '0') {
            alert('Не удалось отправить заявку. Проверьте настройки send.php или попробуйте позже.');
            if (pdfCatalogStatus) openPdfCatalog();
            history.replaceState(null, '', window.location.pathname);
        }

        // Add quiz button to portfolio section
        document.addEventListener('DOMContentLoaded', () => {
            const portfolioSection = document.getElementById('portfolio');
            const quizBtn = document.createElement('button');
            quizBtn.className = 'filter-btn filter-btn--silver filter-btn--lavender-cta inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-full font-bold mt-6 reveal';
            quizBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> Получить расчёт стоимости`;
            quizBtn.onclick = openQuiz;
            portfolioSection.querySelector('.text-center.mt-16').prepend(quizBtn);
            observer.observe(quizBtn);
        });



