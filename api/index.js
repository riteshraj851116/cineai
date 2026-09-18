import { app } from '../server/server.js';
import { connectDB } from '../server/config/db.js';

let isDbInitialized = false;

export default async function handler(req, res) {
  // CORS Preflight handling
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept');
    return res.status(204).end();
  }

  // Ensure Database is connected
  try {
    await connectDB();
    isDbInitialized = true;
  } catch (dbErr) {
    console.error('[Vercel Serverless] DB connection error:', dbErr?.message);
  }

  // Normalize target URL for Express router from Vercel rewrite
  let targetUrl = req.url || '/api';
  try {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const capturedPath = parsedUrl.searchParams.get('_url_path');
    if (capturedPath !== null) {
      parsedUrl.searchParams.delete('_url_path');
      const cleanQuery = parsedUrl.searchParams.toString();
      targetUrl = '/api' + (capturedPath ? '/' + capturedPath.replace(/^\//, '') : '') + (cleanQuery ? '?' + cleanQuery : '');
    } else {
      const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-original-uri'];
      if (forwardedUri && forwardedUri.startsWith('/api')) {
        targetUrl = forwardedUri;
      }
    }
  } catch (_e) {
    targetUrl = req.url || '/api';
  }

  // Strip /api/index.js artifacts
  targetUrl = targetUrl.replace(/\/api\/index\.js\/?/, '/api/');
  if (!targetUrl.startsWith('/api')) {
    targetUrl = '/api' + (targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl);
  }
  req.url = targetUrl;

  return new Promise((resolve) => {
    try {
      app(req, res, (err) => {
        if (err && !res.headersSent) {
          res.status(500).json({ success: false, message: err.message || 'Internal server error' });
        }
        resolve();
      });
    } catch (invocationErr) {
      console.error('[Vercel Serverless] Unhandled exception:', invocationErr);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: invocationErr.message || 'Serverless invocation error' });
      }
      resolve();
    }
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', resolve);
  });
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
