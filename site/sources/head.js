const siteConfig = {
    icons: {
        defaultIcon: '/sources/pictures/icon/t5.ico',
        type: 'image/x-icon'
    },
    fonts: {
        links: [
            {
                rel: 'preconnect',
                href: 'https://fonts.googleapis.com'
            },
            {
                rel: 'preconnect',
                href: 'https://fonts.gstatic.com',
                crossorigin: true
            },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Days+One&family=Dela+Gothic+One&family=Geologica:wght@500&family=Unbounded:wght@500&display=swap'
            },
        ]
    },
};

const siteResources = {
    config: siteConfig,

    /**
     * Установка иконки для страницы
     * @param {string} iconPath - путь к иконке (опционально)
     */
    setFavicon: function(iconPath = this.config.icons.defaultIcon) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = this.config.icons.type;
        link.rel = 'shortcut icon';
        link.href = iconPath;
        document.getElementsByTagName('head')[0].appendChild(link);
    },

    /**
     * Добавление ссылок на шрифты
     */
    setFonts: function() {
        const head = document.getElementsByTagName('head')[0];
        this.config.fonts.links.forEach(linkData => {
            const link = document.createElement('link');
            Object.entries(linkData).forEach(([key, value]) => {
                link[key] = value;
            });
            head.appendChild(link);
        });
    },

    /**
     * Инициализация ресурсов при загрузке страницы
     */
    init: function() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setFavicon();
            this.setFonts();
        });
    }
};

// Автоматическая инициализация
siteResources.init();