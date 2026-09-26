# apps/ait

AppsInToss용 **WebView SDK 3.x** 타깃입니다. (`@apps-in-toss/web-framework` + `@toss/tds-mobile-ait` + `@toss/tds-mobile` + Vite)

성향 테스트 허브의 AppsInToss 미니앱으로, `packages/product-core`의 채점/검증/필터 로직을 재사용해 홈(카테고리 칩 + 섹션 묶기) → 질문 → 결과 흐름을 제공합니다.

## SDK 트랙 선택 근거

릴리즈 노트(2026-08-03 3.0.1, 2026-09-21 3.5.0)와 [SDK 3.x 마이그레이션 가이드](https://developers-apps-in-toss.toss.im/documentation/integration/sdk-3.x.md)에 따르면 SDK 3.x는 **WebView 트랙 전용**이고, React Native 트랙은 별도 2.x 라인(현재 2.10.10)을 유지합니다. 트레잇 테스트 허브는 AIT 단일 출시 타깃이므로 RN 트랙의 네이티브 이점을 활용할 필요가 적고, WebView 트랙의 안정성·도구(AIT Devtools)·콘솔 origin 분리를 선택했습니다.

## 명령

```bash
pnpm --dir apps/ait dev          # Vite 개발 서버 (AIT Devtools로 로컬 브라우저에서 즉시 테스트)
pnpm --dir apps/ait build        # .ait 패키지 빌드 (vite build && ait build)
pnpm --dir apps/ait deploy       # AppsInToss 배포 (콘솔 토큰 필요)
pnpm --dir apps/ait check        # lint + typecheck + test
pnpm --dir apps/ait lint         # eslint
pnpm --dir apps/ait typecheck    # tsc --noEmit
pnpm --dir apps/ait test         # vitest run
```

앱 진입: `intoss://trait-test-hub/`

## 디렉터리

```
apps/ait/
├── apps-in-toss.config.ts       # SDK 3.x 설정 (brand.primaryColor, webView, webBundleDir)
├── index.html                   # Vite entry HTML
├── vite.config.ts               # Vite + AIT Devtools 플러그인 + product-core 별칭
├── public/                      # 등록용 정적 자산 (logo, thumbnail, screenshots)
└── src/
    ├── main.tsx                 # AppsInToss.registerApp + TDSProvider + App 마운트
    ├── App.tsx                  # 화면 상태 머신(home/list/question/result) + 뒤로가기 가드
    ├── pages/
    │   ├── Home.tsx             # 카테고리 칩 + 오늘의 테스트 + 카테고리 섹션 + 랜덤/목록
    │   ├── List.tsx             # 전체 목록 + 카테고리 칩 필터
    │   ├── Question.tsx         # 문항 화면 + 진행 바 + 뒤로/홈 네비
    │   └── Result.tsx           # 결과 화면 + 광고 + 공유 + 통계 + 비슷한 테스트 추천
    └── lib/
        ├── ads/                 # interstitialPort(순수 코어) + aitInterstitialPort(SDK 어댑터) + adConfig
        ├── analytics/           # analyticsPort + aitAnalyticsPort
        ├── share/               # sharePort + aitSharePort
        ├── contentRepository.ts # GitHub Pages manifest + Storage 캐시
        ├── statsRepository.ts   # firestore REST 직접 호출 (CORS origin 등록 필요)
        ├── storageAdapter.ts    # AIT Storage → ContentStorage 통일 어댑터
        └── testSelection.ts     # 데일리/랜덤 선택 (KST 기준)
```

## product-core 통합

`packages/product-core`(`@seorilabs/trait-test-core`)는 워크스페이스 패키지(`workspace:*`)로 직접 import합니다. WebView(Vite)는 `pnpm` 워크스페이스 패키지의 `exports`/`types` 필드를 그대로 해석하므로 RN 시절의 esbuild 번들링(`bundle:core`, `src/vendor/`)이 필요 없습니다. TypeScript 경로는 `tsconfig.json`의 `paths`로 안정화합니다.

```ts
import {
  type ManifestEntry,
  type TraitTest,
  scoreTraitTest,
  filterManifestEntries,
  sortManifestEntries,
} from '@seorilabs/trait-test-core';
```

## 홈 카테고리화

- 칩 데이터 소스: `Manifest.filters.categories[]`(manifest 메타의 `work`, `routine` 등). 메타가 없으면 등장한 카테고리를 동적으로 만듭니다.
- 칩 선택 상태: `Storage`(`trait-test-hub:active-category` 키)에 저장해 다음 진입 시 복원.
- 카테고리 섹션: `filterManifestEntries(entries, { category })` + `sortManifestEntries(entries, 'featured')`. 한 화면에 모든 카테고리 섹션이 펼쳐지며, "전체" 칩은 모든 섹션을 노출하고, 특정 칩 선택 시 해당 섹션만 강조.
- 결과 화면: 같은 카테고리 내 다른 published 테스트를 `pickSimilarTests`로 모아 "비슷한 테스트 더 보기" 카드를 최대 3개 노출.

## 뒤로가기

- `AppsInToss.registerApp`이 호스트 뒤로가기를 가로채는 표준 패턴을 사용합니다.
- 단일 라우트 + 내부 상태 머신 구조이므로, 홈이 아닐 때 `window`의 `toss:back` 커스텀 이벤트를 구독해 화면별 분기(이전 문항/진입 화면 또는 홈)로 라우팅하고, 홈에서는 구독을 해제해 뒤로가기가 앱을 정상 종료하도록 둡니다.
- AIT 호스트가 없는 로컬 브라우저(AIT Devtools)에서는 `toss:back` 이벤트가 발생하지 않으므로 dev 환경에서 호스트 동작에 의존하는 회귀를 막습니다.

## 결과 통계 ("나와 같은 성향")

`src/lib/statsRepository.ts`가 firestore REST API로 직접 접근합니다 — 완료는 `completions`에 write(서버 트리거가 `test_stats`로 집계), 분포는 `test_stats`를 공개 read. org 정책상 Cloud Function 직접 호출이 막혀 있고, firebase Web SDK firestore는 Node `crypto` 의존으로 번들에서 깨지므로 **REST(fetch)** 로 우회합니다. 표시 정책·집계 흐름은 `docs/stats.md` 참고.

## 테스트팩 로컬 캐시

공개 테스트팩은 `https://traithub.vzyx.xyz/test-packs/manifest.json`에서 가져옵니다. 현재 origin은 GitHub Pages이며, 앱은 AppsInToss `Storage`(storageAdapter를 통해)에 마지막으로 검증된 manifest와 `testId@version`별 테스트 JSON을 저장합니다.

- 시작 시 캐시를 먼저 표시하고 원격 manifest를 백그라운드 갱신합니다.
- 원격 갱신에 실패하면 마지막 정상 캐시를 계속 사용합니다.
- 새 manifest를 받으면 published 테스트 JSON을 백그라운드 선저장합니다.
- manifest와 ID/버전이 일치하고 core validator를 통과한 데이터만 저장합니다.
- 결과 화면은 원격 이미지 없이 앱 내부의 색상·이모지 카드로 표시됩니다.

## Release blockers (출시 전 확정)

- **콘솔 CORS origin 등록** — SDK 3.x는 `https://<appName>.apps.tossmini.com`(프로덕션)과 `https://<appName>.private-apps.tossmini.com`(콘솔 QR 테스트)을 새 origin으로 사용합니다(릴리즈 노트 2026-08-25). 두 origin 모두 콘솔과 Firestore API 키의 HTTP 리퍼러 허용 목록에 추가해야 statsRepository 호출이 통과합니다.
- **결과 통계 조작 방지** — `completions` create가 형식만 검증하므로 App Check(firestore enforcement) 또는 rate-limit 보강(`docs/stats.md`).
- **콘텐츠 origin 운영 정책** — 현재 GitHub Pages custom domain을 사용하며, 트래픽/수익화 확대 전 Firebase Hosting 또는 전용 CDN 이전 검토.
- **TDS 컴포넌트 정합** — 현재 화면은 plain DOM + 토스 브랜드 컬러(`#2F6F68`) 유지. 심사 정합성을 위해 핵심 UI를 TDS 컴포넌트로 전환하는 것은 후속 작업.

## 경계

- `packages/product-core`를 워크스페이스 패키지로 import(SDK 비의존).
- `@toss/tds-mobile-ait`의 `TDSProvider`로 래핑. SafeArea는 TDS Provider가 자체 처리.
- 관리자/검수 UI는 Toss runtime에 노출하지 않음.
- 프레임워크 import는 각 어댑터(`lib/ads|analytics|share/storageAdapter`)에만 두어 port는 테스트 가능하게 유지.