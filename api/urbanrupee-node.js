/**
 * UrbanRupee Utility Payment — server-only helpers for local Node server.
 * Token must never be sent to the browser.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const SECRETS = {
  userid: process.env.URBANRUPEE_USERID || 'UR72',
  token:
    process.env.URBANRUPEE_TOKEN ||
    '$2y$10$zoXy.9Mw72M5hQfxSLWm4uZSkH.hcRDxV49aWRagYEyniM0.OXsPK',
  initiateUrl: 'https://merchant.urbanrupee.in/api/pg/utility/initiate',
  checkStatusUrl: 'https://merchant.urbanrupee.in/api/pg/utility/checkstatus',
  minAmount: 100,
  maxAmount: 100000,
  paymentMode: 'CARD',
};

const ORDERS_DIR = path.join(__dirname, 'orders');

function ensureOrdersDir() {
  if (!fs.existsSync(ORDERS_DIR)) {
    fs.mkdirSync(ORDERS_DIR, { recursive: true });
  }
}

function safeOrderId(orderid) {
  return String(orderid || '').replace(/[^A-Za-z0-9_-]/g, '');
}

function saveOrder(orderid, payload) {
  ensureOrdersDir();
  const safe = safeOrderId(orderid);
  if (!safe) return false;
  const file = path.join(ORDERS_DIR, safe + '.json');
  const data = Object.assign({}, payload, { updated_at: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return true;
}

function loadOrder(orderid) {
  const safe = safeOrderId(orderid);
  const file = path.join(ORDERS_DIR, safe + '.json');
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
}

function makeOrderId() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return 'EDU_UR72_' + t + r;
}

function normalizeMobile(mobile) {
  let digits = String(mobile || '').replace(/\D+/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(-10);
  }
  return digits;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        // form-urlencoded fallback
        try {
          const params = new URLSearchParams(raw);
          const obj = {};
          params.forEach((v, k) => {
            obj[k] = v;
          });
          resolve(obj);
        } catch (e2) {
          reject(new Error('Invalid JSON body'));
        }
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function httpPostJson(urlString, payload) {
  return new Promise((resolve) => {
    const url = new URL(urlString);
    const lib = url.protocol === 'https:' ? https : http;
    const body = JSON.stringify(payload);
    const req = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 45000,
      },
      (resp) => {
        const chunks = [];
        resp.on('data', (c) => chunks.push(c));
        resp.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let data = null;
          try {
            data = JSON.parse(raw);
          } catch (e) {
            data = { raw: raw };
          }
          resolve({
            ok: resp.statusCode >= 200 && resp.statusCode < 300,
            httpCode: resp.statusCode,
            data,
          });
        });
      }
    );
    req.on('error', (err) => {
      resolve({ ok: false, httpCode: 0, data: null, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, httpCode: 0, data: null, error: 'Gateway timeout' });
    });
    req.write(body);
    req.end();
  });
}

function publicBaseUrl(req) {
  const host = req.headers.host || 'localhost:3000';
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)) {
    // UrbanRupee cannot reach localhost — use live webhook
    return 'https://educepta.in';
  }
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  return proto + '://' + host;
}

async function handleInitiate(req, res) {
  try {
    const body = await readJsonBody(req);
    const amount = Math.round(Number(body.amount) || 0);
    const name = String(body.name || '').trim();
    const mobile = normalizeMobile(body.mobile);
    const email = String(body.email || '').trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (amount < SECRETS.minAmount || amount > SECRETS.maxAmount) {
      return sendJson(res, 400, {
        status: false,
        message:
          'Amount must be between ₹' +
          SECRETS.minAmount +
          ' and ₹' +
          SECRETS.maxAmount.toLocaleString('en-IN') +
          '.',
      });
    }
    if (!name || mobile.length !== 10) {
      return sendJson(res, 400, {
        status: false,
        message: 'Valid customer name and 10-digit mobile are required.',
      });
    }

    const orderid = makeOrderId();
    const callbackUrl = publicBaseUrl(req) + '/api/utility-callback.php';

    const payload = {
      userid: SECRETS.userid,
      token: SECRETS.token,
      amount: amount,
      mobile: mobile,
      name: name,
      orderid: orderid,
      callback_url: callbackUrl,
      paymentMode: SECRETS.paymentMode,
      redirect_mode: 'checkout',
    };
    if (email) payload.email = email;

    const result = await httpPostJson(SECRETS.initiateUrl, payload);
    if (!result.data && result.error) {
      return sendJson(res, 502, {
        status: false,
        message: result.error || 'Unable to reach payment gateway. Please try again.',
      });
    }

    const gw = result.data || {};
    const checkoutUrl = gw.checkout_url || gw.payment_url;
    if (!result.ok || !gw.status || !checkoutUrl) {
      let msg = gw.message || 'Payment initiation failed.';
      if (gw.detected_ip) msg += ' (server IP: ' + gw.detected_ip + ')';
      if (gw.hint) msg += ' ' + gw.hint;
      return sendJson(res, result.httpCode && result.httpCode >= 400 ? result.httpCode : 400, {
        status: false,
        message: msg,
      });
    }

    saveOrder(orderid, {
      orderid,
      amount,
      name,
      mobile,
      email,
      items,
      status: 'initiated',
      checkout_url: checkoutUrl,
      created_at: new Date().toISOString(),
    });

    return sendJson(res, 200, {
      status: true,
      message: gw.message || 'Checkout ready',
      orderid,
      amount,
      checkout_url: checkoutUrl,
      session_ttl_minutes: gw.session_ttl_minutes || 30,
    });
  } catch (err) {
    return sendJson(res, 500, {
      status: false,
      message: err.message || 'Server error initiating payment.',
    });
  }
}

async function handleCheckStatus(req, res) {
  try {
    const body = await readJsonBody(req);
    const orderid = String(body.orderid || '').trim();
    if (!orderid) {
      return sendJson(res, 400, { status: false, message: 'orderid is required' });
    }

    const result = await httpPostJson(SECRETS.checkStatusUrl, {
      userid: SECRETS.userid,
      token: SECRETS.token,
      orderid,
    });

    if (!result.ok || !result.data) {
      return sendJson(res, 502, {
        status: false,
        message: result.error || 'Unable to fetch payment status.',
      });
    }

    const gw = result.data;
    const local = loadOrder(orderid);
    if (local && gw.data) {
      local.gateway_status = gw.data;
      local.status = String(gw.data.status || local.status || 'unknown').toLowerCase();
      saveOrder(orderid, local);
    }

    return sendJson(res, 200, gw);
  } catch (err) {
    return sendJson(res, 500, {
      status: false,
      message: err.message || 'Server error checking status.',
    });
  }
}

async function handleCallback(req, res) {
  try {
    const payload = await readJsonBody(req);
    const orderid = String(payload.orderid || '').trim();
    const status = String(payload.status || '').trim().toLowerCase();
    if (!orderid) {
      return sendJson(res, 400, { status: false, message: 'Missing orderid' });
    }

    const existing = loadOrder(orderid) || { orderid };
    existing.status = status || existing.status || 'unknown';
    existing.callback = payload;
    existing.callback_received_at = new Date().toISOString();
    if (payload.utr) existing.utr = payload.utr;
    if (payload.vendor_id) existing.vendor_id = payload.vendor_id;
    if (payload.gateway_orderid) existing.gateway_orderid = payload.gateway_orderid;
    if (payload.settlement_amount != null) existing.settlement_amount = payload.settlement_amount;
    if (payload.amount != null) existing.amount = payload.amount;
    saveOrder(orderid, existing);

    return sendJson(res, 200, {
      status: true,
      message: 'Callback received',
      orderid,
    });
  } catch (err) {
    return sendJson(res, 500, {
      status: false,
      message: err.message || 'Callback processing failed.',
    });
  }
}

/**
 * @returns {boolean} true if request was handled
 */
async function handleUrbanRupeeApi(req, res, pathname) {
  const p = pathname.replace(/\/+$/, '') || '/';

  if (req.method === 'OPTIONS' && p.startsWith('/api/utility')) {
    sendJson(res, 204, {});
    return true;
  }

  if (
    (p === '/api/utility/initiate' || p === '/api/utility-initiate.php') &&
    req.method === 'POST'
  ) {
    await handleInitiate(req, res);
    return true;
  }
  if (
    (p === '/api/utility/checkstatus' || p === '/api/utility-checkstatus.php') &&
    req.method === 'POST'
  ) {
    await handleCheckStatus(req, res);
    return true;
  }
  if (
    (p === '/api/utility/callback' || p === '/api/utility-callback.php') &&
    (req.method === 'POST' || req.method === 'GET')
  ) {
    await handleCallback(req, res);
    return true;
  }
  return false;
}

function isBlockedApiPath(pathname) {
  const base = path.basename(pathname);
  return (
    base.startsWith('_') ||
    base.includes('secrets') ||
    pathname.includes('/api/orders/')
  );
}

module.exports = {
  handleUrbanRupeeApi,
  isBlockedApiPath,
};
