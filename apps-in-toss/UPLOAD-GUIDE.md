# AppsInToss 콘솔 앱정보 등록 가이드

성향 테스트 허브(trait-test-hub)를 AppsInToss 콘솔에 **앱정보 등록**하기 위한 확정 값과 절차.
등록 = 앱정보 AI 검토 요청(약 2영업일, 이메일 통보). 승인돼야 번들 배포·출시 가능.

## 확정 메타데이터

| 항목 | 값 |
| --- | --- |
| 워크스페이스 | `38345` (서일환의 팀 작업공간) |
| appName | `trait-test-hub` |
| 앱 이름(한글) | 성향 테스트 허브 |
| 앱 이름(영문) | Trait Hub |
| 앱 유형 | NON_GAME |
| 카테고리 | 생활 > 콘텐츠 > 테스트 (`categoryIds:[3834]`, `subCategoryIds:[72]`) |
| 한 줄 소개 | 성향·심리 테스트를 모아 매일 새로 즐겨요 |
| 상세 소개 | `apps-in-toss.config.json`의 `detailDescription` |
| 키워드 | 성향테스트, 심리테스트, 성격유형, 취향테스트, 일상, 관계, 자기이해, 성격테스트, 오늘의테스트 |
| 사용 연령 | 14~99 |
| 유해 콘텐츠 | 없음 |
| 홈페이지 | https://traithub.vzyx.xyz |
| CS 이메일 | 콘솔 계정 이메일로 자동 설정(MCP 입력 불가) |

## 등록 이미지 (검증 완료)

| 자산 | 규격 | 경로 |
| --- | --- | --- |
| 로고 | 600×600 PNG, solid | `apps/ait/public/trait-test-hub-icon-600.png` |
| 썸네일 | 1932×828 PNG, solid | `apps/ait/public/trait-test-hub-thumbnail-1932x828.png` |
| 스크린샷(홈) | 636×1048 PNG | `apps/ait/public/screenshots/trait-test-hub-home-636x1048.png` |
| 스크린샷(질문) | 636×1048 PNG | `apps/ait/public/screenshots/trait-test-hub-question-636x1048.png` |
| 스크린샷(결과) | 636×1048 PNG | `apps/ait/public/screenshots/trait-test-hub-result-636x1048.png` |

- 로고: 티일(#2F6F68) 배경에 흰 옆얼굴 실루엣(민트/테라코타 facet). Gemini 생성.
- 썸네일: 티일 그라디언트 배경 + 앱 UI 카드(레이더/아바타/리스트) + "성향 테스트 허브 / 매일 새 성향 테스트" 타이틀. Gemini 아트 + 한글 타이포 합성.
- 스크린샷: 웹 프리뷰(`apps/preview`)를 헤드리스 Chrome으로 실제 캡처(홈→질문→결과). 실제 콘텐츠·브랜드 팔레트.

## 제출 경로

### A. 콘솔 웹 (권장 — 이미지 업로드 포함)

1. 콘솔 로그인 → 워크스페이스 `서일환의 팀 작업공간` → 미니앱 추가.
2. 위 메타데이터 입력, 카테고리 = 생활 > 콘텐츠 > 테스트.
3. 로고·썸네일·스크린샷 3장 업로드(위 경로 PNG).
4. 광고/결제 등 정책 민감 항목: 현재 없음(추후 광고 도입 시 갱신).
5. 앱정보 검토 제출.

### B. MCP (`miniapp_create`)

- 제약: `miniapp_create`는 이미지 URL을 `static.toss.im`(업로드 발급)만 허용하고 base64 필드가 없음.
  신규 앱의 새 이미지를 MCP만으로 올리는 경로가 열려 있지 않아, 이미지가 먼저 콘솔/업로드로
  `static.toss.im` URL이 되어야 함. NON_GAME은 `gameInfo`/`specialCategory`가 null.
- 발급된 `miniAppId`(=serviceId)는 이후 번들 배포(`bundle_upload`)·검토 식별자로 재사용.

## 주의 / 리스크

- 콘솔에 이미 `dpti-app`(개발자 성향 테스트) 단독 등록이 있음. 본 허브는 DPTI를 포함한 모음이라
  포지셔닝이 겹칠 수 있음 — 소개 카피에서 "허브/모음" 성격을 명시함.
- 스크린샷은 웹 프리뷰 캡처(실 콘텐츠). AIT RN 화면과 디자인 언어는 동일하나 완전히 동일하진 않음.
- 결과 화면 "나와 같은 성향"은 집계 전이면 "아직 집계 중이에요"로 표시됨(정상 상태).
- 상표 리스크로 키워드에서 MBTI는 제외함.
