// Vercel Serverless Function - Proxy to Backend
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import the Express app from backend
const app = require('../backend/src/index').default;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Let Express handle the request
  return app(req, res);
}
