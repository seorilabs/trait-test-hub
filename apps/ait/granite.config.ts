import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'trait-test-hub',
  plugins: [
    appsInToss({
      brand: {
        displayName: '성향 테스트 허브',
        primaryColor: '#2F6F68',
        // AppsInToss 콘솔 업로드 아이콘(miniAppId 54985)
        icon: 'https://static.toss.im/appsintoss/38345/6629020b-e8a6-43e5-92ef-f983bdaf66c9.png',
      },
      permissions: [],
    }),
  ],
});
