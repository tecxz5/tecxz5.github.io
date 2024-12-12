const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'site')));

// Мидлвар для динамической загрузки HTML страниц
app.use((req, res, next) => {
    const filePath = path.join(__dirname, 'site', `${req.path}.html`);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath); // Если файл существует, отправляем его
    } else {
        next(); // Если файл не найден, передаем обработку следующему мидлвару
    }
});

// Стартовый маршрут (например, для главной страницы)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'site', 'index.html'));
});

// Обработка 404 - если не нашли страницу
app.use((req, res) => {
    res.status(404).send('Page not found');
});


// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
