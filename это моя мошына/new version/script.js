document.getElementById('toggleProjectsButton').addEventListener('click', function() {
    const tgBotElement = document.querySelector('.tg-bot');
    const dsBotElement = document.querySelector('.ds-bot');
    
    if (tgBotElement.classList.contains('show')) {
        tgBotElement.classList.remove('show');
        dsBotElement.classList.add('show');
    } else {
        dsBotElement.classList.remove('show');
        tgBotElement.classList.add('show');
    }
});