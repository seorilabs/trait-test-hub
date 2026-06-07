# QA 계획

## 자동 확인

```bash
pnpm check:core
pnpm check:release
pnpm check:release:strict
```

`check:release`는 미확정 항목을 보고만 합니다. 출시 후보 판단에서는 `check:release:strict`를 사용해 blocker가 있으면 실패하게 둡니다.

## 수동 feature 확인

| 영역 | 확인 |
| --- | --- |
| 홈 | 오늘의 테스트, 신규/인기/카테고리 탐색 |
| 테스트 상세 | 문항 수, 결과 수, 주의 문구 |
| 질문 진행 | 진행률, 뒤로가기, 응답 변경 |
| 결과 | 유형, 요약, 강점/주의점, 익명 분포 |
| 공유 | 공유 카드/링크 진입 |
| 통계 | 완료 수, 결과 분포 |
| 검수 | draft 목록, validation, safety lint, 승인/반려 |

## 출시 전 target gate

| 타깃 | gate |
| --- | --- |
| Google Play | signed `.aab`, internal test upload, Data safety, IARC/GRAC |
| App Store | archive/export, TestFlight upload, privacy labels, review notes |
| AppsInToss | `.ait` build, sandbox QA, TDS 확인, 등록 이미지 |
