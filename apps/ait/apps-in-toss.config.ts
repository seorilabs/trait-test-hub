import { defineConfig } from '@apps-in-toss/web-framework/config';

// AIT SDK 3.x 설정. WebView 트랙의 필수 필드는 appName, brand, permissions만입니다.
// webView/webBundleDir는 기본값으로 충분하면 생략할 수 있습니다.
//
// navigationBar.withBackButton: false 로 둬서 호스트 뒤로가기 버튼(상단) 노출을 끄고,
// 미니앱 자체 헤더(Question/Result/List의 맥락 라벨 "이전/홈/목록")만 화면 안에서 보이도록 한다.
// 뒤로가기 키 처리는 graniteEvent.addEventListener('backEvent', ...) 구독이 담당한다.
// (참고: https://developers-apps-in-toss.toss.im/documentation/integration/sdk-3.x.md)
export default defineConfig({
  appName: 'trait-test-hub',
  brand: {
    primaryColor: '#2F6F68',
  },
  permissions: [],
  webBundleDir: 'dist',
  navigationBar: {
    withBackButton: false,
  },
});