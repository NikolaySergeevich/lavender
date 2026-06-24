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
        }
        function closeMobileMenu() {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
            navbar.classList.remove('mobile-menu-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
        }
        function toggleMobileMenu() {
            if (mobileMenu.classList.contains('hidden')) openMobileMenu();
            else closeMobileMenu();
        }
        mobileBtn.addEventListener('click', toggleMobileMenu);

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
            'Праздничная фотозона с шарами и ярким декором для активного дня рождения или семейного торжества.',
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
            'Фотозона на первый день рождения с нежной палитрой, шарами и аккуратной композицией для семейных фото.'
        ];
        let currentPortfolioFilter = 'all';
        let visiblePortfolioIndexes = [];
        let visiblePortfolioCount = getPortfolioBatchSize();
        let currentPortfolioPage = 0;

        portfolioItems.forEach((item, index) => {
            item.dataset.portfolioIndex = index;
            const description = portfolioDescriptions[index];
            if (description) {
                const descriptionNode = item.querySelector('.text-white\\/70');
                if (descriptionNode) descriptionNode.textContent = description;
            }
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
                item.style.display = visibleIndex >= 0 ? 'block' : 'none';
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
        function createReviewCard({ initials, name, meta, text }) {
            const stars = Array.from({ length: 5 }, () => `
                <svg class="w-5 h-5 text-brand-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
            `).join('');

            return `
                <div class="w-full md:w-1/2 lg:w-1/3 shrink-0 px-4">
                    <div class="bg-white rounded-2xl p-8 border border-brand-black/5 h-full">
                        <div class="flex gap-1 mb-4">${stars}</div>
                        <p class="text-brand-graphite mb-6 leading-relaxed italic">"${text}"</p>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center font-bold text-brand-black">${initials}</div>
                            <div>
                                <p class="font-medium text-brand-black">${name}</p>
                                <p class="text-xs text-brand-muted">${meta}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        const reviewsTrack = document.getElementById('reviews-track');
        const additionalReviews = [
            { initials: 'ОМ', name: 'Ольга М.', meta: 'Юбилей, март 2026', text: 'Очень понравилось, что команда сама подсказала, как лучше поставить фотозону в зале. На фото всё выглядит аккуратно и дорого.' },
            { initials: 'ИС', name: 'Ирина С.', meta: 'День рождения, февраль 2026', text: 'Заказывали оформление для дня рождения. Приехали вовремя, быстро смонтировали, после праздника всё спокойно разобрали.' },
            { initials: 'НК', name: 'Наталья К.', meta: 'Детский праздник, январь 2026', text: 'Детская фотозона получилась нежной и безопасной. Дети постоянно возле неё фотографировались, а родители просили контакты.' },
            { initials: 'АР', name: 'Алексей Р.', meta: 'Свадьба, август 2025', text: 'Смета была понятной, без неожиданностей. В день свадьбы мы вообще не отвлекались на монтаж, всё уже стояло готовым.' },
            { initials: 'ВП', name: 'Виктория П.', meta: 'Gender party, май 2026', text: 'Получилась очень красивая зона reveal, цвета подобрали идеально. Фото вышли светлые, праздничные и без лишней перегрузки.' }
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
        const today = new Date();
        const todayValue = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

        function validateEventDate(form) {
            const dateField = form.querySelector('.event-date');
            if (!dateField) return true;

            dateField.setAttribute('min', todayValue);
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

        function openModal(packageName) {
            if (typeof closeLightbox === 'function') closeLightbox(false);
            modalOverlay.classList.remove('hidden');
            modalOverlay.classList.add('flex');
            modalSuccess.classList.add('hidden');
            modalForm.classList.remove('hidden');
            if (packageName) {
                modalText.textContent = `Пакет: ${packageName} — обсуждаем детали`;
                modalSource.value = `Модальная форма: ${packageName}`;
            } else {
                modalText.textContent = 'Расскажите о вашем мероприятии';
                modalSource.value = 'Модальная форма';
            }
            document.body.style.overflow = 'hidden';
        }
        function closeModal() {
            modalOverlay.classList.add('hidden');
            modalOverlay.classList.remove('flex');
            document.body.style.overflow = '';
        }
        function handleModalSubmit(e) {
            e.preventDefault();
            if (!validateEventDate(e.target)) return;
            const btn = e.target.querySelector('button');
            btn.textContent = 'Отправка...';
            btn.disabled = true;
            setTimeout(() => {
                modalForm.classList.add('hidden');
                modalSuccess.classList.remove('hidden');
                btn.textContent = 'Отправить заявку';
                btn.disabled = false;
                e.target.reset();
            }, 1200);
        }

        // Contact form
        const contactSuccess = document.getElementById('contact-success');
        const contactForm = document.getElementById('contact-form');
        function handleContactForm(e) {
            e.preventDefault();
            if (!validateEventDate(e.target)) return;
            const btn = e.target.querySelector('button');
            btn.textContent = 'Отправка...';
            btn.disabled = true;
            setTimeout(() => {
                contactForm.classList.add('hidden');
                contactSuccess.classList.remove('hidden');
                btn.textContent = 'Отправить → Перейти в мессенджер';
                btn.disabled = false;
                e.target.reset();
            }, 1200);
        }

        // Sticky CTA
        const stickyCta = document.getElementById('sticky-cta');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) stickyCta.classList.add('visible');
            else stickyCta.classList.remove('visible');
        });

        // Exit Intent
        let exitShown = false;
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 5 && !exitShown) {
                document.getElementById('exit-popup').classList.remove('hidden');
                document.getElementById('exit-popup').classList.add('visible', 'flex');
                exitShown = true;
            }
        });
        function closeExitPopup() {
            document.getElementById('exit-popup').classList.add('hidden');
            document.getElementById('exit-popup').classList.remove('visible', 'flex');
        }
        function handleExitForm(e) {
            e.preventDefault();
            closeExitPopup();
            alert('Чек-лист отправлен! Проверьте Telegram.');
        }

        // Quiz
        let quizStep = 1;
        const quizOverlay = document.getElementById('quiz-overlay');
        function openQuiz() {
            quizOverlay.classList.remove('hidden');
            quizOverlay.classList.add('flex');
            quizStep = 1;
            document.getElementById('quiz-next-btn').style.display = '';
            updateQuiz();
            document.body.style.overflow = 'hidden';
        }
        function closeQuiz() {
            quizOverlay.classList.add('hidden');
            quizOverlay.classList.remove('flex');
            document.body.style.overflow = '';
        }
        function quizNext() {
            if (quizStep < 5) { quizStep++; updateQuiz(); }
        }
        function quizPrev() {
            if (quizStep > 1) { quizStep--; updateQuiz(); }
        }
        function updateQuiz() {
            document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
            const nextBtn = document.getElementById('quiz-next-btn');
            nextBtn.style.display = '';
            if (quizStep <= 4) {
                document.getElementById(`quiz-step-${quizStep}`).classList.add('active');
                document.getElementById('quiz-progress').style.width = `${quizStep * 25}%`;
                document.getElementById('quiz-prev-btn').style.visibility = quizStep === 1 ? 'hidden' : 'visible';
                nextBtn.textContent = quizStep === 4 ? 'Рассчитать' : 'Далее';
            } else {
                document.getElementById('quiz-result').classList.add('active');
                document.getElementById('quiz-progress').style.width = '100%';
                document.getElementById('quiz-prev-btn').style.visibility = 'visible';
                nextBtn.style.display = 'none';
                calculatePrice();
            }
        }
        function calculatePrice() {
            const area = document.querySelector('input[name="quiz-area"]:checked')?.value;
            const style = document.querySelector('input[name="quiz-style"]:checked')?.value;
            const urgency = document.querySelector('input[name="quiz-urgency"]:checked')?.value;
            let price = 450;
            if (area === '8-15 м²') price = 600;
            if (area === '15-30 м²') price = 800;
            if (area === 'более 30 м²') price = 2150;
            if (style === 'Неон' || style === 'Брендированная') price += 300;
            if (urgency === '2-3 недели') price += 200;
            if (urgency === 'Менее 2 недель') price += 450;
            const priceText = `от ${price.toLocaleString('ru-RU')} Br`;
            document.getElementById('quiz-price').textContent = priceText;
            document.getElementById('quiz-estimated-price').value = priceText;
        }
        function sendQuiz() {
            alert('Заявка отправлена! Персональный расчёт придёт в Telegram за 15 минут.');
            closeQuiz();
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
            return { image: image.src, alt: image.alt, title, meta, category, categorySlug, fit, position };
        });
        const lightboxOverlay = document.getElementById('lightbox-overlay');
        let lightboxIndex = 0;
        let lightboxProjects = portfolioProjects;

        function openLightbox(idx) {
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
            lightboxOverlay.classList.remove('hidden');
            lightboxOverlay.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
        function closeLightbox(restoreScroll = true) {
            if (!lightboxOverlay) return;
            lightboxOverlay.classList.add('hidden');
            lightboxOverlay.classList.remove('flex');
            if (restoreScroll) document.body.style.overflow = '';
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

        // Download modal
        function showDownloadModal() {
            openModal('PDF-каталог трендов 2026');
            modalText.textContent = 'Оставьте контакт, и мы отправим каталог трендов 2026 в Telegram или WhatsApp.';
        }

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
            if (event.key === 'Escape') closeLightbox();
            if (event.key === 'ArrowLeft') changeLightbox(-1);
            if (event.key === 'ArrowRight') changeLightbox(1);
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
            const top = rect.bottom + 8;
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
            positionEventCalendar(field);
            eventCalendar.classList.remove('hidden');
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
            field.addEventListener('input', () => updateEventDateState(field));
            field.addEventListener('change', () => updateEventDateState(field));
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

        const sentStatus = new URLSearchParams(window.location.search).get('sent');
        if (sentStatus === '1') {
            alert('Заявка отправлена! Мы свяжемся с вами в течение 15 минут.');
            history.replaceState(null, '', window.location.pathname);
        }
        if (sentStatus === '0') {
            alert('Не удалось отправить заявку. Проверьте настройки send.php или попробуйте позже.');
            history.replaceState(null, '', window.location.pathname);
        }

        // Add quiz button to portfolio section
        document.addEventListener('DOMContentLoaded', () => {
            const portfolioSection = document.getElementById('portfolio');
            const quizBtn = document.createElement('button');
            quizBtn.className = 'filter-btn filter-btn--silver filter-btn--lavender-cta inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-full font-bold mt-6 reveal';
            quizBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> Рассчитать стоимость за 4 шага`;
            quizBtn.onclick = openQuiz;
            portfolioSection.querySelector('.text-center.mt-16').prepend(quizBtn);
            observer.observe(quizBtn);
        });



