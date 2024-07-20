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

document.querySelector('a[href="#contact"]').addEventListener('click', function(event) {
    event.preventDefault();
    var contactElement = document.querySelector('.contact');
    contactElement.scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelectorAll('.clickable').forEach(element => {
    element.addEventListener('click', event => {
        event.preventDefault();
        window.open(element.querySelector('a').href, '_blank');
    });
  });

document.addEventListener("DOMContentLoaded", function() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        document.body.classList.add('mobile');
    }
});

function toggleMenu() {
    const menu = document.querySelector('.info');
    menu.classList.toggle('active');
}