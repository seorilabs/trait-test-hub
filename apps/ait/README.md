# apps/ait

AppsInToss용 Granite React Native target입니다.

아직 Granite scaffold는 만들지 않았습니다. 다음 값 확정 후 생성합니다.

- AppsInToss `appName`
- AppsInToss Console 등록용 HTTPS icon URL
- TDS 적용 디자인
- AppsInToss Firebase/Remote Config/App Check 호환성

예정 경계:

- `packages/product-core`를 import해 테스트/채점 로직을 재사용
- `@toss/tds-react-native` 사용
- 일반 사용자 local state는 AppsInToss `Storage` 또는 server API adapter 뒤에 배치
- 관리자/검수 UI는 Toss runtime에 기본 노출하지 않음
