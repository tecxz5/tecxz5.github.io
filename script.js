const projects = {
    yagpt: {
        name: "Телеграм бот с YaGPT и Speechkit",
        description: "Бот выполняет роль собеседника, только ему без разницы что ты отравляешь, текстовые сообщения или голосовые<br>(кружки не принимает)",
        url: "https://github.com/tecxz5/tg_plus_gpt/tree/main"
    },
    casino: {
        name: "Дс бот с казино и переводами",
        description: "Бот был написан по просьбе друга за определенную плату и до сих пор развивается, но я забил на развитие кода на гитхабе, а так добавилась улучшенная система переводов и логи",
        url: "https://github.com/tecxz5/casino-economy_bot.ds"
    }
}
function getProjects(projects){
    const array = [];
    const size = 3;
    const projects_array = [];
    Object.keys(projects).forEach(item=>{
        const project = projects[item];
        array.push(`<div class="toggle-element"><h6>${project.name}</h6><p>${project.description}</p><a target="_blank" href="${project.url}">Ссылка на код</a></div>`)
    })
    for (let i = 0; i < Math.ceil(array.length / size); i++) {
        projects_array[i] = array.slice(i * size, (i + 1) * size);
    }
    return projects_array;
}

function openContacts(){
    const contactLinks = document.querySelector('.contact-links');
    const toggleButton = document.querySelector('.toggle-button');

    contactLinks.classList.toggle('open');
    toggleButton.classList.toggle('cross');
}

document.querySelector(".contact-trigger").addEventListener('click',  openContacts)
document.querySelector(".toggle-button").addEventListener('click',  openContacts)

document.querySelector(".menu-toggle").addEventListener("click", ()=> {
    const menu = document.querySelector('.menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('header');
    menu.classList.toggle('show');
    menuToggle.classList.toggle('open');
    header.classList.toggle('menu-open');
})

const projectArray = getProjects(projects)
projectArray.forEach(array=>{
    const floor = document.createElement("div")
    floor.classList.add('toggle-floor');
    array.forEach(text=>{
        floor.insertAdjacentHTML("beforeend", text);
    })
    document.querySelector(".toggle-container").appendChild(floor)
})