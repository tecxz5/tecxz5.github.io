document.querySelectorAll('.clickable').forEach(element => {
    element.addEventListener('click', event => {
        event.preventDefault();
        window.open(element.querySelector('a').href, '_blank');
    });
  });

document.addEventListener("DOMContentLoaded", ()=>{
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        document.body.classList.add('mobile');
    }
});

function toggleMenu() {
    const menu = document.querySelector('.info');
    menu.classList.toggle('active');
}