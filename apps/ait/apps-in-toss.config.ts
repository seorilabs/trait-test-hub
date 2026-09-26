import { defineConfig } from '@apps-in-toss/web-framework/config';

// AIT SDK 3.x 설정. WebView 트랙의 필수 필드는 appName, brand, permissions만입니다.
// webView/webBundleDir는 기본값으로 충분하면 생략할 수 있습니다.
// (참고: https://developers-apps-in-toss.toss.im/documentation/integration/sdk-3.x.md)
export default defineConfig({
  appName: 'trait-test-hub',
  brand: {
    primaryColor: '#2F6F68',
  },
  permissions: [],
  webBundleDir: 'dist',
});