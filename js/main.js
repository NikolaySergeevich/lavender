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
            mobileBtn.setAttribute('aria-expanded', 'true');
        }
        function closeMobileMenu() {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
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
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        const homePortfolioLimit = 9;
        function applyPortfolioFilter(filter) {
            portfolioItems.forEach((item, index) => {
                const isHomeVisible = filter === 'all' && index < homePortfolioLimit;
                const isCategoryVisible = filter !== 'all' && item.dataset.category === filter;
                item.style.display = isHomeVisible || isCategoryVisible ? 'block' : 'none';
            });
        }
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyPortfolioFilter(btn.dataset.filter);
            });
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
        function scrollReviews(direction) {
            const track = document.getElementById('reviews-track');
            const itemWidth = track.children[0].offsetWidth;
            const maxPosition = -(track.children.length - 1) * itemWidth;
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
            let price = 750;
            if (area === '8-15 м²') price = 1600;
            if (area === '15-30 м²') price = 2800;
            if (area === 'более 30 м²') price = 4150;
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
        const portfolioProjects = Array.from(document.querySelectorAll('.portfolio-item')).map((item) => {
            const image = item.querySelector('img');
            const title = item.querySelector('.font-serif')?.textContent.trim() || 'Проект LAVDRAGON';
            const meta = item.querySelector('.text-white\\/70')?.textContent.trim() || '';
            const category = item.querySelector('.absolute.top-4')?.textContent.trim() || '';
            return { image: image.src, alt: image.alt, title, meta, category };
        });
        const lightboxOverlay = document.getElementById('lightbox-overlay');
        let lightboxIndex = 0;

        function openLightbox(idx) {
            lightboxIndex = idx;
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
        function changeLightbox(direction) {
            lightboxIndex = (lightboxIndex + direction + portfolioProjects.length) % portfolioProjects.length;
            renderLightbox();
        }
        function renderLightbox() {
            const project = portfolioProjects[lightboxIndex];
            document.getElementById('lightbox-image').src = project.image;
            document.getElementById('lightbox-image').alt = project.alt;
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
        const today = new Date();
        const todayValue = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        function updateEventDateState(field) {
            field.min = todayValue;
            if (field.value && field.value < todayValue) {
                field.value = '';
                localStorage.removeItem(`contact-form-${field.name || field.type}`);
            }
            field.classList.toggle('is-selected', Boolean(field.value));
        }
        eventDateFields.forEach(field => {
            updateEventDateState(field);
            field.addEventListener('input', () => updateEventDateState(field));
            field.addEventListener('change', () => updateEventDateState(field));
            field.form?.addEventListener('reset', () => setTimeout(() => updateEventDateState(field), 0));
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
            quizBtn.className = 'filter-btn filter-btn--silver filter-btn--lavender-cta inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold mt-6 reveal';
            quizBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> Рассчитать стоимость за 4 шага`;
            quizBtn.onclick = openQuiz;
            portfolioSection.querySelector('.text-center.mt-16').prepend(quizBtn);
            observer.observe(quizBtn);
        });



