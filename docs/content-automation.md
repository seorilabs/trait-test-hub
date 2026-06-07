# 성향 테스트 자동 생성 체계

자동화의 목표는 한 번 실행될 때마다 완성된 성향 테스트 1개를 draft로 만들고, 검증을 통과한 변경만 PR로 보내는 것입니다. 자동화 자체를 만들기 전에 파일 계약과 gate를 고정합니다.

## 흐름

```mermaid
flowchart LR
  Topic["주제 선정"] --> Draft["content/test-packs/drafts/<testId>.json"]
  Draft --> Publish["publish:test-pack-draft"]
  Publish --> Source["content/test-packs"]
  Publish --> Public["public/test-packs"]
  Source --> Validate["check:content"]
  Public --> Validate
  Validate --> Branch["전용 branch"]
  Branch --> PR["한글 PR"]
```

## 자동화 1회 산출물

자동화는 한 번 실행될 때 아래 범위만 변경해야 합니다.

- `content/test-packs/drafts/<testId>.json`: 생성 초안
- `content/test-packs/packs/generated-v1/tests/<testId>.json`: source payload
- `content/test-packs/manifest.json`: manifest entry, category/tag metadata
- `content/test-packs/packs/generated-v1/pack.json`: pack index
- `public/test-packs/**`: source와 동기화된 publish 산출물

기존 공개 테스트의 `testId` 의미를 바꾸면 안 됩니다. 기존 테스트 수정이 필요하면 새 `version` 정책을 별도로 세운 뒤 진행합니다.

## Draft 파일 계약

자동화는 아래 형식의 draft JSON을 먼저 만들어야 합니다.

```json
{
  "schemaVersion": 1,
  "packId": "generated-v1",
  "metadata": {
    "summaryKo": "짧은 목록용 설명",
    "tags": ["routine", "daily"],
    "categoryLabelKo": "일상",
    "tagLabelsKo": {
      "routine": "루틴",
      "daily": "일상"
    },
    "estimatedMinutes": "3-5분"
  },
  "test": {
    "id": "example-test",
    "version": 1,
    "status": "published",
    "titleKo": "예시 성향 테스트",
    "category": "routine",
    "axes": [],
    "questions": [],
    "results": []
  }
}
```

새 category나 tag를 추가하면 `categoryLabelKo`, `tagLabelsKo`를 반드시 같이 넣습니다. label 없이 ID만 추가하면 앱 필터 UI가 품질 낮은 상태로 노출됩니다.

## 품질 기준

`pnpm check:content`가 통과해야 PR 후보가 됩니다.

- manifest와 payload의 `testId`, `version`, `packId`, stats key가 일치한다.
- 질문 ID, 결과 code, axis ID가 중복되지 않는다.
- 모든 option score는 존재하는 axis만 참조하고 숫자여야 한다.
- 일반 vector scoring 테스트는 모든 결과 vector가 모든 axis 값을 가진다.
- `axis-letter-majority` 테스트는 axis별 2개 letter, tie breaker, 모든 결과 조합을 갖춘다.
- 가능한 답변 조합을 점검할 수 있는 규모라면 모든 결과가 최소 1회 이상 도달 가능해야 한다.
- `TODO`, `placeholder`, `임시`, `lorem` 같은 placeholder 문구가 없어야 한다.

## 금지/주의 주제

자동 생성 테스트는 가벼운 자기이해/취향/일상/업무 성향에 한정합니다.

- 의학적 진단, 정신건강 진단, 법률/금융 판단, 정치 성향 판정은 제외합니다.
- MBTI, DISC, Big Five처럼 기존 체계의 이름과 유형 구조를 그대로 차용하지 않습니다.
- 특정 실존 인물, 브랜드, 저작권 캐릭터, 민감 집단을 유형화하지 않습니다.
- 돈 절약, 투자, 대출, 보험 최적화처럼 사용자 손실을 유발할 수 있는 주제는 제외합니다.

## PR 규칙

- branch: `feature/generated-test-<testId>`
- commit: 한글 bullet 형식
- PR 제목: `성향 테스트 추가: <테스트명>`
- PR 본문에는 아래를 포함합니다.
  - 생성한 테스트 ID와 제목
  - 질문 수, 결과 수, category/tag
  - 실행한 검증 명령과 결과
  - 사람이 확인해야 할 문항/결과 톤 이슈

자동화 PR은 release blocker 해결 PR과 섞지 않습니다.
