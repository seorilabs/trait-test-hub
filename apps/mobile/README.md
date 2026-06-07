# apps/mobile

Google Play Store와 Apple App Store에 배포할 표준 React Native target입니다.

아직 native scaffold는 만들지 않았습니다. 다음 값 확정 후 생성합니다.

- Android package name: `com.seorilabs.traithub`
- iOS bundle ID
- Firebase Android/iOS app config
- privacy/data safety 정책

예정 경계:

- `packages/product-core`를 import해 테스트/채점 로직을 재사용
- Firebase native SDK, OS share, AdMob, Crashlytics, FCM은 이 target adapter에만 배치
- Android/iOS native project는 이 폴더 안에 유지
