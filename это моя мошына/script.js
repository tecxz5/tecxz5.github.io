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