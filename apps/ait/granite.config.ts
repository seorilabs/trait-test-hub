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
        // TODO(release-blocker): AppsInToss 콘솔 업로드 후 HTTPS icon URL로 교체
        icon: 'https://placehold.co/600x600/2F6F68/FFFFFF.png?text=Trait+Hub',
      },
      permissions: [],
    }),
  ],
});
