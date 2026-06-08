import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { buildTestPackOutput } from './lib/test-pack-output.mjs';

const root = process.cwd();
const preferredPort = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? '127.0.0.1';
const previewTestPackRoot = join(root, 'tmp/test-packs-preview');

buildTestPackOutput({
  root,
  outputRoot: previewTestPackRoot,
});

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function filePathForUrl(url) {
  const { pathname } = new URL(url, 'http://127.0.0.1');
  const cleanPath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  if (cleanPath === '/' || cleanPath === '') {
    return join(root, 'apps/preview/index.html');
  }
  if (cleanPath.startsWith('/test-packs/')) {
    return join(previewTestPackRoot, cleanPath.replace(/^\/test-packs\/?/, ''));
  }
  return join(root, cleanPath);
}

function createPreviewServer() {
  return createServer((request, response) => {
    const filePath = filePathForUrl(request.url ?? '/');
    try {
      const stat = statSync(filePath);
      if (!stat.isFile()) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }

      response.writeHead(200, {
        'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
}

async function listen(port) {
  const server = createPreviewServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  return server;
}

for (let port = preferredPort; port < preferredPort + 20; port += 1) {
  try {
    await listen(port);
    console.log(`Trait Test Hub preview: http://${host}:${port}/`);
    break;
  } catch (error) {
    if (error.code !== 'EADDRINUSE') {
      throw error;
    }
  }
}
