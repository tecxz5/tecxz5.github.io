(() => {
    const headerHTML = `
        <div class="home">
            <a href="/?l">tecxz5</a>
        </div>
        <div class="navigation">
            <a href="/pashalka/" id="clicky">пасхалка</a>
        </div>
    `;

    const footerHTML = `
        <p id="copyright">@<img src="https://github.com/tecxz5/tecxz5/blob/main/copyright.gif?raw=true" loading="lazy" alt="copyright"></p>
        <p><a href="/design" id="footer-link">О Сайте</a></p>
    `;

    function renderLayout() {
        const headerElement = document.getElementById('header');
        const footerElement = document.getElementById('footer');

        if (headerElement) {
            headerElement.innerHTML = headerHTML;
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

