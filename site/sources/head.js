(() => {
    const CONFIG = {
        icon: {
            href: '/sources/pictures/icon/t5.ico',
            type: 'image/x-icon'
        },
        fonts: [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Days+One&family=Dela+Gothic+One&family=Geologica:wght@500&family=Unbounded:wght@500&display=swap' }
        ]
    };

    function ensureFavicon() {
        const head = document.head;
        let iconLink = head.querySelector('link[rel="icon"], link[rel="shortcut icon"]');

        if (!iconLink) {
            iconLink = document.createElement('link');
            head.appendChild(iconLink);
        }

        iconLink.rel = 'shortcut icon';
        iconLink.type = CONFIG.icon.type;
        iconLink.href = CONFIG.icon.href;
    }

    function ensureFontLinks() {
        const head = document.head;

        for (const attrs of CONFIG.fonts) {
            const existing = head.querySelector(`link[href="${attrs.href}"]`);
            if (existing) {
                continue;
            }

            const link = document.createElement('link');
            for (const [key, value] of Object.entries(attrs)) {
                link.setAttribute(key, value);
            }
            head.appendChild(link);
        }
    }

    function initHeadResources() {
        ensureFavicon();
        ensureFontLinks();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeadResources, { once: true });
    } else {
        initHeadResources();
    }
})();
