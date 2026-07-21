# 기여 가이드

Trait Test Hub는 성향 테스트 콘텐츠와 정적 preview를 공개적으로 관리합니다. 기여는 주로 새 테스트팩 제안, 테스트 문항 개선, 검증 스크립트 개선을 대상으로 합니다.

## 새 테스트 추가

1. `content/test-packs/drafts/<testId>.json` draft를 만듭니다.
2. `docs/content-automation.md`의 금지/주의 주제를 확인합니다.
3. 아래 명령으로 테스트별 source 파일을 생성하고 검증합니다.

```bash
pnpm publish:test-pack-draft -- --draft=content/test-packs/drafts/<testId>.json
pnpm check:content
pnpm check
```

자동 생성 테스트 PR에는 `content/test-packs/manifest.json`, `content/test-packs/packs/<packId>/pack.json`, `public/test-packs/**` 변경을 포함하지 않습니다. shared manifest와 public 산출물은 검증/배포 단계에서 자동으로 컴파일됩니다.

## 콘텐츠 기준

- 테스트는 가벼운 자기이해, 취향, 일상, 업무 성향에 한정합니다.
- 자동 생성 테스트는 최소 10문항, 최소 4개 결과, 문항별 최소 3개 선택지를 갖춰야 합니다.
- 결과는 DPTI처럼 상세해야 하며 `summaryKo`, `descriptionKo`, `strengthsKo`, `watchoutsKo`, `collaborationKo`, `shareIntroKo`를 포함해야 합니다.
- 결과 화면은 앱이 결과 코드에 따라 로컬 색상·이모지 카드로 표현합니다. 테스트팩에 이미지 파일을 추가하지 않습니다.
- `imagePath`, `shareImagePath` 필드와 `assets/<testId>/` 이미지 디렉터리는 허용하지 않습니다. `pnpm check:content`가 이를 검사합니다.
- 의학/정신건강 진단, 법률/금융 판단, 정치 성향 판정은 제외합니다.
- MBTI, DISC, Big Five 등 기존 검사명과 유형 구조를 그대로 쓰지 않습니다.
- 실존 인물, 브랜드, 저작권 캐릭터, 민감 집단을 유형화하지 않습니다.
- 결과 문구는 단정 대신 "이 상황에서는 이런 방식이 편한 편"처럼 씁니다.

결과 객체는 아래처럼 텍스트와 채점 데이터만 작성합니다.

```json
{
  "code": "example-type",
  "titleKo": "예시 유형",
  "summaryKo": "결과 상단에 표시할 요약",
  "descriptionKo": "사용자가 이해할 수 있는 상세 설명",
  "strengthsKo": ["구체적인 강점 1", "구체적인 강점 2", "구체적인 강점 3"],
  "watchoutsKo": ["살펴볼 점 1", "살펴볼 점 2"],
  "collaborationKo": "관계·업무·일상에서 적용할 조언",
  "shareIntroKo": "나는 예시 유형이에요.",
  "vector": { "axis-a": 10, "axis-b": -10 }
}
```

## Pull Request

PR에는 아래를 포함해 주세요.

- 테스트 ID와 제목
- 질문 수, 결과 수, category/tag
- 실행한 검증 명령
- 사람이 확인해야 할 문항/결과 톤 이슈
- 테스트팩에 이미지 파일이나 이미지 경로가 없다는 확인

자동 생성 테스트 PR은 release blocker, 앱 shell, Firebase 변경과 섞지 않습니다.
