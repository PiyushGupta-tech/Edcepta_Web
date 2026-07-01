/**
 * Local dev server with Vercel-style rewrites for EDCEPTA EDUCATION
 * Run: node server.js  or  npx node server.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const REWRITES = {
  '/login': '/login.html',
  '/checkout': '/checkout.html',
  '/contact': '/contact.html',
  '/about': '/about.html',
  '/faq': '/faq.html',
  '/membership': '/membership.html',
  '/course-details': '/course-details.html',
  '/user-dashboard': '/user-dashboard.html',
  '/admin-dashboard': '/admin-dashboard.html',
  '/privacy-policy': '/privacy-policy.html',
  '/return-refund-policy': '/return-refund-policy.html',
  '/terms-conditions': '/terms-conditions.html',
  '/terms-of-service': '/terms-conditions.html',
  '/test-api': '/test-api.html',
  '/debug': '/debug.html',
};

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const root = __dirname;

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  const query = req.url.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '';
  if (REWRITES[urlPath]) {
    urlPath = REWRITES[urlPath] + query;
  }
  if (urlPath === '/') urlPath = '/index.html';

  // Use only the pathname for the file path (strip query string)
  const pathnameOnly = urlPath.split('?')[0];
  const relativePath = path.normalize(pathnameOnly.replace(/^\//, '')).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(root, relativePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      res.writeHead(500);
      res.end('Server Error');
      return;
    }
    const ext = path.extname(filePath);
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  EDCEPTA EDUCATION running at http://localhost:' + PORT);
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});
