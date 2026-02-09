const TOTAL_IMAGES = 50;

const gallery = document.querySelector('#gallery');

const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const imageObserver = new IntersectionObserver(handleIntersection, observerOptions);

function init() {
    generateImagePlaceholders(TOTAL_IMAGES);
}

function generateImagePlaceholders(count) {
    for (let i = 1; i <= count; i++) {
        const imageItem = createImagePlaceholder(i);
        gallery.appendChild(imageItem);
    }
}

function createImagePlaceholder(index) {
    const div = document.createElement('div');
    div.className = 'image-item';

    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>
    `;

    const img = document.createElement('img');
    img.dataset.src = `https://picsum.photos/400/225?random=${index}`;
    img.alt = `Image ${index}`;

    div.appendChild(placeholder);
    div.appendChild(img);

    imageObserver.observe(img);

    return div;
}

function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;

            loadImage(img);

            observer.unobserve(img);
        }
    });
}

function loadImage(img) {
    const src = img.dataset.src;

    const tempImg = new Image();

    tempImg.onload = () => {
        img.src = src;
        img.classList.add('loaded');

        const placeholder = img.previousElementSibling;
        if (placeholder && placeholder.classList.contains('image-placeholder')) {
            setTimeout(() => {
                placeholder.remove();
            }, 500);
        }
    };

    tempImg.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        img.alt = 'Failed to load';
    };

    tempImg.src = src;
}

init();
