(() => {
    const headerHTML = `
        <div class="home">
            <a href="/?l">tecxz5</a>
        </div>
        <button class="menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Открыть меню">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <div class="navigation">
            <a href="/generator/?l" id="clicky">Генератор фона</a>
        </div>
        <nav class="mobile-nav" id="mobile-nav" aria-hidden="true">
            <a href="/generator/?l" class="mobile-nav-link">Генератор фона</a>
        </nav>
    `;

    const footerHTML = `
        <p id="copyright">@<img src="https://github.com/tecxz5/tecxz5/blob/main/copyright.gif?raw=true" loading="lazy" alt="copyright"></p>
        <p><a href="/design" id="footer-link">О сайте</a></p>
    `;

    function initMobileMenu() {
        const headerElement = document.getElementById('header');
        const toggle = document.getElementById('menu-toggle');
        const mobileNav = document.getElementById('mobile-nav');
        if (!headerElement || !toggle || !mobileNav) {
            return;
        }

        const closeMenu = () => {
            headerElement.classList.remove('menu-open');
            toggle.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
        };

        const openMenu = () => {
            headerElement.classList.add('menu-open');
            toggle.setAttribute('aria-expanded', 'true');
            mobileNav.setAttribute('aria-hidden', 'false');
        };

        toggle.addEventListener('click', () => {
            const isOpen = headerElement.classList.contains('menu-open');
            if (isOpen) {
                closeMenu();
                return;
            }
            openMenu();
        });

        document.addEventListener('click', (event) => {
            if (!headerElement.classList.contains('menu-open')) {
                return;
            }
            const target = event.target;
            if (target instanceof Node && !headerElement.contains(target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });

        mobileNav.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.tagName === 'A') {
                closeMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 480) {
                closeMenu();
            }
        });
    }

    function renderLayout() {
        const headerElement = document.getElementById('header');
        const footerElement = document.getElementById('footer');

        if (headerElement) {
            headerElement.innerHTML = headerHTML;
            initMobileMenu();
        }

        if (footerElement) {
            footerElement.innerHTML = footerHTML;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderLayout, { once: true });
    } else {
        renderLayout();
    }
})();
