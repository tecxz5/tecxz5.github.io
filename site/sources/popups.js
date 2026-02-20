(() => {
    const ANIMATION_MS = 300;
    const POPUP_ID = 'popup';
    const BODY_LOCKED_OVERFLOW = 'hidden';
    const BODY_DEFAULT_OVERFLOW = 'auto';

    const textData = {
        'kitek-important': {
            title: 'ВНИМАНИЕ',
            content: 'Не нажимай на кота, ему не приятно ;)\nЗа повторное неуважение к коту, тебя ждет докс, сват, спортики, агуууууууу ауауауауауауауауауауааааааааааа',
            closeButtonText: 'Постараюсь не трогать'
        },
        'copyright': {
            title: 'Крутяшке',
            content: 'Конечно прикольно что кто-то сюда нажал, но здесь ничего нету ?\\_(?)_/?',
            closeButtonText: 'Ладно'
        }
    };

    function createPopup() {
        const popup = document.createElement('div');
        popup.id = POPUP_ID;
        popup.className = 'popup';

        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';
        popup.appendChild(popupContent);

        popup.addEventListener('click', (event) => {
            if (event.target === popup) {
                closePopup();
            }
        });

        return popup;
    }

    function getPopup() {
        let popup = document.getElementById(POPUP_ID);
        if (!popup) {
            popup = createPopup();
            document.body.appendChild(popup);
        }
        return popup;
    }

    function renderPopupContent(container, content) {
        container.replaceChildren();

        const title = document.createElement('h2');
        title.textContent = content.title;

        const text = document.createElement('p');
        text.textContent = content.content;

        const closeButton = document.createElement('p');
        closeButton.className = 'close-button';
        closeButton.textContent = content.closeButtonText;
        closeButton.addEventListener('click', closePopup);

        container.append(title, text, closeButton);
    }

    function showPopup(key) {
        const content = textData[key];
        if (!content) {
            return;
        }

        const popup = getPopup();
        const popupContent = popup.querySelector('.popup-content');

        renderPopupContent(popupContent, content);

        popup.style.display = 'block';
        document.body.style.overflow = BODY_LOCKED_OVERFLOW;

        requestAnimationFrame(() => {
            popup.classList.add('popup-show');
        });
    }

    function closePopup() {
        const popup = document.getElementById(POPUP_ID);
        if (!popup) {
            return;
        }

        popup.classList.remove('popup-show');
        window.setTimeout(() => {
            popup.style.display = 'none';
            document.body.style.overflow = BODY_DEFAULT_OVERFLOW;
        }, ANIMATION_MS);
    }

    function initPopups() {
        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-popup-key]');
            if (!trigger) {
                return;
            }

            const key = trigger.getAttribute('data-popup-key');
            if (!key) {
                return;
            }

            event.preventDefault();
            showPopup(key);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closePopup();
            }
        });

        // Keep backward compatibility for any legacy inline handlers.
        window.showPopup = showPopup;
        window.closePopup = closePopup;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPopups, { once: true });
    } else {
        initPopups();
    }
})();
