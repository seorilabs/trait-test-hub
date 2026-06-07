# 기여 가이드

Trait Test Hub는 성향 테스트 콘텐츠와 정적 preview를 공개적으로 관리합니다. 기여는 주로 새 테스트팩 제안, 테스트 문항 개선, 검증 스크립트 개선을 대상으로 합니다.

## 새 테스트 추가

1. `content/test-packs/drafts/<testId>.json` draft를 만듭니다.
2. `docs/content-automation.md`의 금지/주의 주제를 확인합니다.
3. 아래 명령으로 source/public 산출물을 생성하고 검증합니다.

```bash
pnpm publish:test-pack-draft -- --draft=content/test-packs/drafts/<testId>.json
pnpm check:content
pnpm check
```

## 콘텐츠 기준

- 테스트는 가벼운 자기이해, 취향, 일상, 업무 성향에 한정합니다.
- 자동 생성 테스트는 최소 10문항, 최소 4개 결과, 문항별 최소 3개 선택지를 갖춰야 합니다.
- 결과는 DPTI처럼 상세해야 하며 `descriptionKo`, `strengthsKo`, `watchoutsKo`, `collaborationKo`, `shareIntroKo`, `imagePath`, `shareImagePath`를 포함해야 합니다.
- 결과 이미지는 `/test-packs/packs/generated-v1/assets/<testId>/` 아래의 PNG/JPG/WebP 파일로 함께 제출합니다.
- 의학/정신건강 진단, 법률/금융 판단, 정치 성향 판정은 제외합니다.
- MBTI, DISC, Big Five 등 기존 검사명과 유형 구조를 그대로 쓰지 않습니다.
- 실존 인물, 브랜드, 저작권 캐릭터, 민감 집단을 유형화하지 않습니다.
- 결과 문구는 단정 대신 "이 상황에서는 이런 방식이 편한 편"처럼 씁니다.

## Pull Request

PR에는 아래를 포함해 주세요.

- 테스트 ID와 제목
- 질문 수, 결과 수, category/tag
- 실행한 검증 명령
- 사람이 확인해야 할 문항/결과 톤 이슈

자동 생성 테스트 PR은 release blocker, 앱 shell, Firebase 변경과 섞지 않습니다.
