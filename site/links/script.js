window.addEventListener('load', () => {
    const loadingElement = document.querySelector('loading');
    document.body.classList.add('no-scroll'); // Блокируем прокрутку
    setTimeout(() => {
        loadingElement.classList.add('hidden');
        setTimeout(() => {
            loadingElement.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }, 1000);
    }, 2000);
});