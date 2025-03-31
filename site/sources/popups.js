document.addEventListener('DOMContentLoaded', function () {
    const textData = {
        'kitek-important': {
            title: 'ВНИМАНИЕ',
            content: 'Не нажимай на кота, ему не приятно ;)' + '\n' + 'За повторное неуважение к коту, тебя ждет докс, сват, спортики, агуууууу ауауауауауауауауаааааааааа',
            closeButtonText: 'Постараюсь не трогать',
        },
        'copyright': {
            title: 'Крутяшке',
            content: 'Конечно прикольно что кто-то сюда нажал, но здесь ничего нету ¯\\_(ツ)_/¯',
            closeButtonText: 'Ладно',
        },
    };

    function createPopup() {
        const popup = document.createElement('div');
        popup.id = 'popup';
        popup.classList.add('popup');

        const popupContent = document.createElement('div');
        popupContent.classList.add('popup-content');
        popup.appendChild(popupContent);

        popup.addEventListener('click', function (event) {
            if (event.target === popup) {
                closePopup();
            }
        });

        return popup;
    }

    function showPopup(key) {
        let popup = document.getElementById('popup');
        if (!popup) {
            popup = createPopup();
            document.body.appendChild(popup);
        }

        const popupContent = popup.querySelector('.popup-content');
        popupContent.innerHTML = '';

        const title = document.createElement('h2');
        title.textContent = textData[key].title;

        const content = document.createElement('p');
        content.textContent = textData[key].content;

        const closeButton = document.createElement('p');
        closeButton.classList.add('close-button');
        closeButton.textContent = textData[key].closeButtonText;
        closeButton.onclick = closePopup;

        popupContent.appendChild(title);
        popupContent.appendChild(content);
        popupContent.appendChild(closeButton);

        popup.style.display = 'block';
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            popup.classList.add('popup-show'); // Добавляем класс для анимации
        });
    }

    function closePopup() {
        const popup = document.getElementById('popup');
        if (popup) {
            popup.classList.remove('popup-show'); // Удаляем класс для анимации закрытия
            setTimeout(() => {
                popup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300); // Задержка должна соответствовать длительности анимации
        }
    }

    window.showPopup = showPopup;
});