import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import aitDevtools from '@apps-in-toss/devtools/unplugin';
import path from 'node:path';

// AIT SDK 3.x는 Vite 번들러를 권장하며. AIT Devtools가 우측 하단에 떠서
// 로컬 브라우저에서 바로 미니앱 동작을 검증할 수 있습니다.
// (참고: https://developers-apps-in-toss.toss.im/documentation/integration/sdk-3.x.md)
export default defineConfig({
  root: '.',
  base: './',
  resolve: {
    alias: {
      // product-core 워크스페이스 패키지를 모노레포 외부에서도 안정적으로 resolve.
      '@seorilabs/trait-test-core': path.resolve(__dirname, '../../packages/product-core/src/index.js'),
    },
  },
  plugins: [react(), aitDevtools.vite()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});