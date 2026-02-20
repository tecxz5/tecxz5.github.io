import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import fs from 'node:fs';

const siteRoot = resolve(__dirname, 'site');
const notFoundFile = resolve(siteRoot, '404.html');

function resolveRouteFiles(urlPath) {
  const cleanPath = urlPath.split('?')[0].split('#')[0];
  const normalizedPath = cleanPath === '/' ? '/index' : cleanPath;
  const htmlCandidate = resolve(siteRoot, `.${normalizedPath}.html`);
  const indexCandidate = resolve(siteRoot, `.${cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`}index.html`);
  return { htmlCandidate, indexCandidate };
}

function shouldHandleAsHtml(req) {
  if (!req || req.method !== 'GET') {
    return false;
  }

  const accept = req.headers.accept || '';
  return accept.includes('text/html');
}

function createNotFoundMiddleware() {
  return (req, res, next) => {
    if (!shouldHandleAsHtml(req)) {
      return next();
    }

    const pathname = req.url || '/';
    const { htmlCandidate, indexCandidate } = resolveRouteFiles(pathname);

    if (fs.existsSync(htmlCandidate) || fs.existsSync(indexCandidate)) {
      return next();
    }

    if (fs.existsSync(notFoundFile)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(notFoundFile, 'utf8'));
      return;
    }

    return next();
  };
}

const notFoundPlugin = {
  name: 'custom-404-html',
  configureServer(server) {
    server.middlewares.use(createNotFoundMiddleware());
  },
  configurePreviewServer(server) {
    server.middlewares.use(createNotFoundMiddleware());
  }
};

export default defineConfig({
  root: 'site',
  appType: 'mpa',
  plugins: [notFoundPlugin],
  server: {
    host: true,
    port: 3000
  },
  preview: {
    host: true,
    port: 4173
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'site/index.html'),
        links: resolve(__dirname, 'site/links/index.html'),
        pashalka: resolve(__dirname, 'site/pashalka/index.html'),
        404: resolve(__dirname, 'site/404.html')
      }
    },
    outDir: '../dist',
    emptyOutDir: true
  }
});
