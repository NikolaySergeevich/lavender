(function () {
    const galleryImages = document.querySelectorAll('.seo-gallery img');

    if (!galleryImages.length) {
        return;
    }

    let lastActiveElement = null;

    const lightbox = document.createElement('div');
    lightbox.className = 'seo-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-hidden', 'true');

    const content = document.createElement('div');
    content.className = 'seo-lightbox__content';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'seo-lightbox__close';
    closeButton.setAttribute('aria-label', 'Закрыть увеличенное фото');
    closeButton.textContent = '×';

    const image = document.createElement('img');
    image.className = 'seo-lightbox__image';
    image.alt = '';

    const caption = document.createElement('p');
    caption.className = 'seo-lightbox__caption';

    content.append(closeButton, image, caption);
    lightbox.appendChild(content);
    document.body.appendChild(lightbox);

    function openLightbox(sourceImage) {
        const altText = sourceImage.getAttribute('alt') || '';

        lastActiveElement = document.activeElement;
        image.src = sourceImage.currentSrc || sourceImage.src;
        image.alt = altText;
        caption.textContent = altText;

        document.body.classList.add('seo-lightbox-open');
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        closeButton.focus();
    }

    function closeLightbox() {
        if (!lightbox.classList.contains('is-open')) {
            return;
        }

        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('seo-lightbox-open');
        image.removeAttribute('src');
        image.alt = '';
        caption.textContent = '';

        if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
            lastActiveElement.focus();
        }
    }

    document.addEventListener('click', (event) => {
        const sourceImage = event.target.closest('.seo-gallery img');

        if (!sourceImage) {
            return;
        }

        openLightbox(sourceImage);
    });

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    closeButton.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeLightbox();
        }
    });
})();
