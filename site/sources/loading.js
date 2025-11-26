document.addEventListener('DOMContentLoaded', () => {
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

    document.body.insertAdjacentHTML('afterbegin', loadingHTML);

    const urlParams = new URLSearchParams(window.location.search);
    const loadingElement = document.querySelector('loading');

    if (urlParams.has('l')) {
        document.body.classList.remove('no-scroll');
    } else {
        document.body.classList.add('no-scroll');
        const showLoadingScreen = (duration) => {
            loadingElement.style.display = 'flex';
            loadingElement.classList.add('visible');

            setTimeout(() => {
                loadingElement.classList.add('hidden');
                
                // Плавный переход: header становится видным одновременно с уходом loading
                const header = document.querySelector('header');
                if (header) {
                    header.style.animation = 'slideDown 1s ease-in-out forwards';
                }

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