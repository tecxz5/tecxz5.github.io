const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const siteDir = path.join(__dirname, 'site');

// Serve static files from site/
app.use(express.static(siteDir));

// Try to resolve requests to .html or /index.html
app.use((req, res, next) => {
    try {
        // Ignore requests that already have an extension
        if (path.extname(req.path)) return next();

        // Try {req.path}.html
        let filePath = path.join(siteDir, `${req.path}.html`);
        if (fs.existsSync(filePath)) return res.sendFile(filePath);

        // Try {req.path}/index.html
        filePath = path.join(siteDir, req.path, 'index.html');
        if (fs.existsSync(filePath)) return res.sendFile(filePath);

        return next();
    } catch (err) {
        next(err);
    }
});

// Root
app.get('/', (req, res) => {
    res.sendFile(path.join(siteDir, 'index.html'));
});

// 404 handler — send custom 404 if exists
app.use((req, res) => {
    const errorFilePath = path.join(siteDir, '404', '404.html');
    if (fs.existsSync(errorFilePath)) {
        return res.status(404).sendFile(errorFilePath);
    }
    res.status(404).send('Page not found');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});