# AppsInToss

AppsInToss 등록/출시 metadata와 asset을 이 폴더에서 관리합니다.
확정 메타데이터는 `apps-in-toss.config.json`, 콘솔 제출 절차는 `UPLOAD-GUIDE.md` 참고.

## 콘솔 앱정보 등록 (진행 상태)

- [x] `appName`/`title`/카테고리/소개/키워드/연령 확정 → `apps-in-toss.config.json`
- [x] 로고 600×600, 썸네일 1932×828, 세로 스크린샷 636×1048 × 3 생성·검증 → `apps/ait/public/`
- [x] 콘솔 앱정보 등록 승인
- 워크스페이스: `38345` (서일환의 팀 작업공간) / 앱 유형: NON_GAME / 유사 선례: `dpti-app`

## 출시(번들 배포) 전 남은 runtime blocker

- 테스트팩은 GitHub Pages(`traithub.vzyx.xyz`)에서 제공하고 AIT `Storage`에 마지막 정상 manifest와 테스트 JSON을 캐시함. 트래픽/수익화 확대 전 Firebase Hosting 또는 전용 CDN 이전 검토
- 결과 통계 조작 방지: App Check(firestore enforcement) 또는 rate-limit 보강 (`docs/stats.md`)
- TDS 컴포넌트 적용: 핵심 UI를 `@toss/tds-react-native` 컴포넌트로 전환 검토
- `.ait` build와 sandbox QA, Firebase/App Check/Remote Config runtime 호환성 확인
