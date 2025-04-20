const siteIcons = {
    config: {
        defaultIcon: '/pictures/icon/t5.ico',
        type: 'image/x-icon'
    },

    /**
     * Установка иконки для страницы
     * @param {string} iconPath - путь к иконке (опционально)
     */
    setFavicon: function(iconPath = this.config.defaultIcon) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = this.config.type;
        link.rel = 'shortcut icon';
        link.href = iconPath;
        document.getElementsByTagName('head')[0].appendChild(link);
    },

    /**
     * Инициализация иконки при загрузке страницы
     */
    init: function() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setFavicon();
        });
    }
};

// Автоматическая инициализация
siteIcons.init();