window.addEventListener('load', () => {
    // Получаем параметры запроса из URL
    const urlParams = new URLSearchParams(window.location.search);

    const loadingElement = document.querySelector('loading');
    document.body.classList.add('no-scroll');

    // Проверяем, отсутствует ли параметр 'l'
    if (!urlParams.has('l')) {
        // Если параметр отсутствует, показываем элемент loading
        loadingElement.style.display = 'flex'; // Показываем элемент
        setTimeout(() => {
            loadingElement.classList.add('hidden');
            setTimeout(() => {
                loadingElement.style.display = 'none';
                document.body.classList.remove('no-scroll');
            }, 1000);
        }, 2000);
    } else {
        // Если параметр присутствует, скрываем элемент loading немедленно
        loadingElement.classList.add('hidden');
        loadingElement.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }
});