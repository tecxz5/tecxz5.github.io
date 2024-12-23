window.addEventListener('load', () => {
    const loadingElement = document.querySelector('loading');
    loadingElement.classList.add('hidden');
    setTimeout(() => {
        loadingElement.style.display = 'none';
    }, 1000); // Время должно совпадать с длительностью анимации
});