/**
 * Local dev server with Vercel-style rewrites + UrbanRupee payment APIs
 * Run: node server.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleUrbanRupeeApi, isBlockedApiPath } = require('./api/urbanrupee-node');

const PORT = 3000;
const REWRITES = {
  '/login': '/login.html',
  '/checkout': '/checkout.html',
  '/contact': '/contact.html',
  '/about': '/about.html',
  '/why-edcepta': '/why-edcepta.html',
  '/faq': '/faq.html',
  '/membership': '/membership.html',
  '/course-details': '/course-details.html',
  '/user-dashboard': '/user-dashboard.html',
  '/admin-dashboard': '/admin-dashboard.html',
  '/privacy-policy': '/privacy-policy.html',
  '/return-refund-policy': '/return-refund-policy.html',
  '/terms-conditions': '/terms-conditions.html',
  '/terms-of-service': '/terms-conditions.html',
  '/payment-return': '/payment-return.html',
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
  '.php': 'text/plain',
};

const root = __dirname;

const server = http.createServer(async (req, res) => {
  try {
    let urlPath = req.url.split('?')[0];

    // Payment / utility APIs (Node handlers also cover .php paths for local parity)
    if (await handleUrbanRupeeApi(req, res, urlPath)) {
      return;
    }

    // Never expose secrets or order files as static downloads
    if (isBlockedApiPath(urlPath) || urlPath.includes('urbanrupee-node')) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: false, message: 'Forbidden' }));
      return;
    }

    const query = req.url.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '';
    if (REWRITES[urlPath]) {
      urlPath = REWRITES[urlPath] + query;
    }
    if (urlPath === '/') urlPath = '/index.html';

    const pathnameOnly = urlPath.split('?')[0];
    const relativePath = path.normalize(pathnameOnly.replace(/^\//, '')).replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(root, relativePath);

    // Block PHP secrets from being downloadable as plain text in local mode
    if (isBlockedApiPath('/' + relativePath.replace(/\\/g, '/'))) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: false, message: 'Forbidden' }));
      return;
    }

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
      // Don't serve raw PHP as executable here — Node APIs handle payment endpoints
      if (ext === '.php') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      const contentType = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: false, message: 'Server error' }));
    }
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  EDCEPTA EDUCATION running at http://localhost:' + PORT);
  console.log('  UrbanRupee: POST /api/utility/initiate  (hosted checkout)');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});
