(() => {
    const LOADING_CLASS_VISIBLE = 'visible';
    const LOADING_CLASS_HIDDEN = 'hidden';
    const BODY_CLASS_NO_SCROLL = 'no-scroll';
    const LOADING_DURATION_MS = 2000;
    const HIDE_DURATION_MS = 500;

    function createLoader() {
        const existing = document.querySelector('loading');
        if (existing) {
            return existing;
        }

        const loading = document.createElement('loading');
        for (const char of ['t', 'e', 'c', 'x', 'z', '5']) {
            const span = document.createElement('span');
            span.textContent = char;
            loading.appendChild(span);
        }

        document.body.insertAdjacentElement('afterbegin', loading);
        return loading;
    }

    function shouldSkipLoader() {
        return new URLSearchParams(window.location.search).has('l');
    }

    function playLoader(loadingElement) {
        document.body.classList.add(BODY_CLASS_NO_SCROLL);
        loadingElement.style.display = 'flex';
        loadingElement.classList.add(LOADING_CLASS_VISIBLE);

        window.setTimeout(() => {
            loadingElement.classList.add(LOADING_CLASS_HIDDEN);

            const header = document.querySelector('header');
            if (header) {
                header.style.animation = 'slideDown 1s ease-in-out forwards';
            }

            window.setTimeout(() => {
                loadingElement.classList.remove(LOADING_CLASS_VISIBLE);
                loadingElement.style.display = 'none';
                document.body.classList.remove(BODY_CLASS_NO_SCROLL);
            }, HIDE_DURATION_MS);
        }, LOADING_DURATION_MS);
    }

    function initLoader() {
        const loadingElement = createLoader();

        if (shouldSkipLoader()) {
            document.body.classList.remove(BODY_CLASS_NO_SCROLL);
            loadingElement.style.display = 'none';
            return;
        }

        playLoader(loadingElement);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoader, { once: true });
    } else {
        initLoader();
    }
})();
