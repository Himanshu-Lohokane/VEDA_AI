import { NextRequest, NextResponse } from 'next/server';

// We import the express app and use @vercel/node-bridge to adapt it
// However the cleanest approach for Next.js App Router is to re-export
// the express handler via a serverless-http bridge

// eslint-disable-next-line @typescript-eslint/no-require-imports
const serverlessHttp = require('serverless-http');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const app = require('../../../../backend/src/index').default;

const handler = serverlessHttp(app);

async function handleRequest(req: NextRequest, { params }: { params: { path: string[] } }) {
  // Build the path that the express app expects (without /api prefix since we mount at /api)
  const path = '/' + (params.path || []).join('/');
  const url = new URL(req.url);
  const fullPath = path + (url.search || '');

  // Convert NextRequest to a plain object the handler can use
  const body = await req.text().catch(() => '');

  const mockReq = {
    method: req.method,
    url: fullPath,
    headers: Object.fromEntries(req.headers.entries()),
    body,
    query: Object.fromEntries(url.searchParams.entries()),
  };

  const mockRes: Record<string, unknown> = {};

  await new Promise<void>((resolve) => {
    // @ts-expect-error: serverless-http handles the adaptation
    handler(mockReq, mockRes, resolve);
  });

  return NextResponse.json({ error: 'Internal routing error' }, { status: 500 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
export const OPTIONS = handleRequest;
