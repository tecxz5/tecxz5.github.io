document.querySelector('a[href="#about-me"]').addEventListener('click', function(event) {
    event.preventDefault();
    var aboutMeElement = document.querySelector('.about-me');
    aboutMeElement.scrollIntoView({ behavior: 'smooth' });
  });

document.querySelector('a[href="#projects"]').addEventListener('click', function(event) {
    event.preventDefault();
    var projectsElement = document.querySelector('.projects');
    projectsElement.scrollIntoView({ behavior: 'smooth' });
  });

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

function toggleContacts() {
    const contactLinks = document.querySelector('.contact-links');
    const toggleButton = document.querySelector('.toggle-button');
    
    contactLinks.classList.toggle('open');
    toggleButton.classList.toggle('cross');
}

function toggleMenu() {
    const menu = document.querySelector('.menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('header');
    menu.classList.toggle('show');
    menuToggle.classList.toggle('open');
    header.classList.toggle('menu-open');
}