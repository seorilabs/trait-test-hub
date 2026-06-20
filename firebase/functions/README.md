# functions

성향 테스트 허브 Cloud Functions. firebase-functions v7 / firebase-admin v13, Node.js 22, region `asia-northeast3`.

## 구현됨

결과 통계 집계 (`index.js`). 설계·데이터 모델은 [docs/stats.md](../../docs/stats.md) 참고.

- `recordCompletion({ testId, version, resultCode })` — 완료 1건을 `test_stats/<versionKey>`에 atomic 증가시키고 갱신된 분포 `{ total, counts }`를 반환. `enforceAppCheck: true`.
- `getStats({ testId, version })` — 분포만 조회(Firestore SDK 없는 AIT용).

## 초기 후보 (미구현)

- daily draft 생성
- schema validation
- safety/rights lint
- review queue 상태 변경

## 배포

`firebase/.firebaserc`에 project ID 확정 후:

```bash
cd firebase/functions && npm install
firebase deploy --only functions
```

LLM API key, service account, Admin SDK 권한은 client app에 포함하지 않고 server secret으로만 관리합니다.
