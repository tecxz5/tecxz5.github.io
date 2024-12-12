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
        res.sendFile(filePath);
    } else {
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
