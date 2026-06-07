# Firebase

성향 테스트 허브는 Firebase를 기본 backend 후보로 둡니다.

초기 사용 후보:

- Firestore: published 테스트, draft/review queue, 익명 집계 결과
- Cloud Functions 또는 Cloud Run: LLM draft 생성, safety lint, 통계 집계, 승인 작업
- Remote Config: 오늘의 테스트, feature flag, emergency disable
- Cloud Storage: 썸네일/공유 이미지 후보
- Analytics/Crashlytics/Performance/FCM/App Check: 출시 전 정책 확인 후 target adapter에서만 사용

아직 Firebase project ID와 앱 등록값은 확정하지 않았습니다. 실제 값은 `.firebaserc`와 platform config에 넣고, service account/private key는 repo에 커밋하지 않습니다.

## 정적 테스트팩

앱이 읽는 테스트 콘텐츠는 우선 Firebase Hosting의 정적 JSON으로 둡니다.

- 배포 후보: `public/test-packs` -> `/test-packs`
- 앱 entry: `/test-packs/manifest.json`
- full payload: `/test-packs/packs/<packId>/tests/<testId>.json`
- Firestore 우선 용도: 완료 통계, 결과 분포, draft/review queue, publish state

이렇게 두면 새 테스트를 Hosting에 올리는 것만으로 앱 목록과 필터가 바뀝니다.
