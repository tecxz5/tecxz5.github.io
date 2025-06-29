// filepath: d:\projects\html\site\sources\site.js
document.addEventListener('DOMContentLoaded', () => {
    // HTML-код для header
    const headerHTML = `
        <div class="home">
            <a href="/?l">tecxz5</a>
        </div>
        <div class="navigation">
            <a href="test/?l" id="clicky">кнопка</a>
            <a href="test/?l" id="clicky">кнопка</a>
            <a href="test/?l" id="clicky">кнопка</a>
        </div>
    `;

    // HTML-код для footer
    const footerHTML = `
        <p id="copyright">©<img src="https://github.com/tecxz5/tecxz5/blob/main/copyright.gif?raw=true" onclick="showPopup('copyright')" loading="lazy">
        <p><a href="design" id="footer-link">О дизайне сайта</a></p>
    `;

    // Находим элементы header и footer
    const headerElement = document.getElementById('header');
    const footerElement = document.getElementById('footer');

    // Заполняем header и footer контентом
    headerElement.innerHTML = headerHTML;
    footerElement.innerHTML = footerHTML;
});