# apps/ait

AppsInToss용 Granite React Native target입니다. (`@granite-js/react-native` + `@apps-in-toss/framework` + `@toss/tds-react-native`)

성향 테스트 허브의 AppsInToss 미니앱으로, `packages/product-core`의 채점/검증 로직을 재사용해 홈 → 질문 → 결과 흐름을 제공합니다.

## 명령

```bash
pnpm --dir apps/ait dev          # Metro 개발 서버 (샌드박스앱 연결)
pnpm --dir apps/ait build        # .ait 패키지 빌드
pnpm --dir apps/ait deploy       # AppsInToss 배포 (콘솔 토큰 필요)
pnpm --dir apps/ait check        # lint + typecheck + test
pnpm --dir apps/ait bundle:core  # product-core를 src/vendor로 번들 (dev/build/typecheck가 자동 선행)
```

앱 진입: `intoss://trait-test-hub/`

## product-core 통합 (vendoring)

`packages/product-core`(`@seorilabs/trait-test-core`)를 **패키지 의존성으로 직접 쓰지 않고** `bundle:core`로 `src/vendor/product-core.{js,d.ts}`에 번들해 사용합니다. 화면은 `../vendor/product-core.js`를 import합니다.

이유:

- AppsInToss 빌드의 `collect-package-version` 플러그인이 `package.json`의 workspace 의존성(`@seorilabs/trait-test-core`) 경로를 `.pnpm` 패턴에서 추출하지 못해 `ait build`가 실패합니다.
- 상대경로로 monorepo 밖 소스를 직접 import하면 `granite dev`(Metro)가 루트까지 스캔하다 haste 충돌을 일으킵니다.
- 번들 사본을 프로젝트 안(`src/vendor/`)에 두면 두 문제를 모두 피하고 dev/build가 함께 동작합니다.

`src/vendor/`는 생성물이라 `.gitignore` 처리하며, `dev`/`build`/`typecheck`가 매번 `bundle:core`로 최신화합니다. 타입의 진실 소스는 `packages/product-core/src/index.d.ts`입니다.

## granite 1.0.33 패치

`@granite-js/react-native@1.0.33`은 `use-back-event` 배럴에서 `useBackEventContext` re-export를 누락해, 이를 top-level import하는 `@apps-in-toss/framework`·`@toss/tds-react-native` 빌드가 깨집니다. 루트 `patches/@granite-js__react-native@1.0.33.patch`로 배럴 한 줄을 보정합니다(upstream 수정 시 제거).

## 로컬 dev 주의

`granite dev`(Metro) 실행 전 루트 `pages-dist/`가 남아 있으면 `apps/ait` 복사본과 패키지 name이 겹쳐 `Duplicated files or mocks` haste 충돌이 납니다. dev 전에 `rm -rf pages-dist`로 정리하세요(`pages-dist`는 `build:pages` 산출물이며 gitignore 대상). dev 서버 종료는 `lsof -ti:8081 | xargs kill`로 확실히 정리합니다(좀비 서버가 8081을 점유하면 EADDRINUSE).

## 결과 통계 ("나와 같은 성향")

결과 화면에서 같은 결과 유형의 희소성을 보여줍니다. `src/lib/statsRepository.ts`가 firestore REST API로 직접 접근합니다 — 완료는 `completions`에 write(서버 트리거가 `test_stats`로 집계), 분포는 `test_stats`를 공개 read. org 정책상 Cloud Function 직접 호출이 막혀 있고, firebase Web SDK firestore는 Node `crypto` 의존으로 Metro 번들에서 깨지므로 **REST(fetch)** 로 우회합니다. 표시 정책·집계 흐름은 `docs/stats.md` 참고.

## Release blockers (출시 전 확정)

- `granite.config.ts`의 `brand.icon`: 현재 placehold.co 임시 URL → AppsInToss 콘솔 업로드 HTTPS URL로 교체.
- 결과 통계 조작 방지: `completions` create가 현재 형식만 검증 → 출시 전 App Check(firestore enforcement) 또는 rate-limit 보강(`docs/stats.md`).
- `src/pages/index.tsx`의 `CONTENT_ORIGIN`: 현재 `https://trait-test-hub.web.app` 기본값 → 실제 Firebase Hosting origin(커스텀 도메인 포함) 확정. 테스트팩 manifest/JSON을 Hosting에 배포해야 런타임 로딩이 동작.
- AppsInToss 콘솔 등록: 카테고리, 등록 이미지(logo 600×600, thumbnail, 세로 스크린샷 3장), 고객센터 연락처.
- TDS 컴포넌트 적용: 현재 화면은 RN 기본 컴포넌트 + `TDSProvider` 래핑. 심사 정합을 위해 핵심 UI를 TDS 컴포넌트로 전환 검토.

## 경계

- `packages/product-core`를 번들해 테스트/채점 로직 재사용 (platform SDK 비의존).
- `@toss/tds-react-native`의 `TDSProvider`로 래핑, safe area는 `react-native-safe-area-context`(Granite 버전 5.6.2 고정).
- 관리자/검수 UI는 Toss runtime에 노출하지 않음.
