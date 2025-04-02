document.addEventListener('DOMContentLoaded', () => {
    // HTML-код для элемента loading
    const loadingHTML = `
        <loading>
            <span>t</span>
            <span>e</span>
            <span>c</span>
            <span>x</span>
            <span>z</span>
            <span>5</span>
        </loading>
    `;

    // Вставляем HTML-код loading в body
    document.body.insertAdjacentHTML('afterbegin', loadingHTML);

    // Получаем параметры запроса из URL
    const urlParams = new URLSearchParams(window.location.search);
    const loadingElement = document.querySelector('loading');

    // Проверяем, есть ли параметр 'l'
    if (urlParams.has('l')) {
        document.body.classList.remove('no-scroll');
    } else {
        document.body.classList.add('no-scroll');
        const showLoadingScreen = (duration) => {
            loadingElement.style.transition = 'opacity 0.5s ease-in-out';
            loadingElement.style.display = 'flex';
            loadingElement.classList.add('visible');

            setTimeout(() => {
                loadingElement.classList.add('hidden');
                setTimeout(() => {
                    loadingElement.classList.remove('visible');
                    loadingElement.style.display = 'none';
                    document.body.classList.remove('no-scroll');
                }, 500);
            }, duration);
        };

        showLoadingScreen(2000);
    }
});