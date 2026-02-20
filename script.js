const words = ['сайт', 'презентацию', '3D модель', 'плакат на заказ'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingDelay = 100;
const deletingDelay = 50;
const newWordDelay = 3000;

function typeEffect() {
    const currentWord = words[wordIndex];
    const typingElement = document.getElementById('typing-text');

    if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(typeEffect, newWordDelay);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(typeEffect, typingDelay);
    } else {
        setTimeout(typeEffect, isDeleting ? deletingDelay : typingDelay);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    typeEffect();
});