const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'site')));

app.use((req, res, next) => {
    // Если путь заканчивается на '/', добавляем 'index.html'
    let filePath = path.join(__dirname, `${req.path}.html`);
    
    if (fs.existsSync(filePath)) {
        // Если файл существует, отправляем его
        return res.sendFile(filePath);
    } else {
        // Если файл не найден, пробуем добавить 'index.html' по умолчанию
        filePath = path.join(__dirname, `${req.path}/index.html`);
        
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath); // Отправляем индексный файл
        }

        // Если и его нет, передаем обработку следующему мидлвару
        next();
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'site', 'index.html'));
});

app.use((req, res) => {
  const errorFilePath = path.join(__dirname, 'site', '404', '404.html');

  if (fs.existsSync(errorFilePath)) {
      res.status(404).sendFile(errorFilePath);
  } else {
      res.status(404).send('Page not found');
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});