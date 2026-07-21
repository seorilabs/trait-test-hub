# 성향 테스트 자동 생성 체계

자동화의 목표는 한 번 실행될 때마다 완성된 성향 테스트 1개를 draft로 만들고, 검증을 통과한 변경만 PR로 보내는 것입니다. 자동화 자체를 만들기 전에 파일 계약과 gate를 고정합니다.

자동화 세션에 그대로 붙여넣는 실행용 프롬프트는 [docs/prompts/new-test-pack-pr.md](prompts/new-test-pack-pr.md)에 있습니다.

## 흐름

```mermaid
flowchart LR
  Topic["주제 선정"] --> Draft["content/test-packs/drafts/<testId>.json"]
  Draft --> Publish["publish:test-pack-draft"]
  Publish --> Entry["packs/generated-v1/entries/<testId>.json"]
  Publish --> Payload["packs/generated-v1/tests/<testId>.json"]
  Entry --> Compile["compile:test-packs"]
  Payload --> Compile
  Compile --> Validate["check:content"]
  Validate --> Branch["전용 branch"]
  Branch --> PR["한글 PR"]
```

## 자동화 1회 산출물

자동화는 한 번 실행될 때 아래 범위만 변경해야 합니다. 이 범위는 테스트별 독립 경로라서 여러 자동화 PR이 동시에 열려도 같은 파일을 수정하지 않습니다.

- `content/test-packs/drafts/<testId>.json`: 생성 초안
- `content/test-packs/packs/generated-v1/tests/<testId>.json`: source payload
- `content/test-packs/packs/generated-v1/entries/<testId>.json`: manifest entry metadata

자동 생성 테스트 PR은 아래 공유 산출물을 수정하면 안 됩니다.

- `content/test-packs/manifest.json`
- `content/test-packs/packs/<packId>/pack.json`
- `public/test-packs/**`

공유 manifest, pack index, public 산출물은 `compile:test-packs`, `check:content`, `build:pages`가 필요할 때 재생성합니다.

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

`publish:test-pack-draft`는 draft metadata를 `entries/<testId>.json`으로 옮겨 저장합니다. category/tag label도 entry에 보관되므로 새 테스트 PR마다 global manifest를 직접 수정하지 않습니다.

## 품질 기준

`pnpm check:content`가 통과해야 PR 후보가 됩니다.

- manifest와 payload의 `testId`, `version`, `packId`, stats key가 일치한다.
- 자동 생성 테스트는 최소 8문항이어야 한다(표준 8문항).
- 자동 생성 테스트는 최소 4개 결과를 가져야 한다.
- 자동 생성 테스트의 각 문항은 최소 3개 선택지를 가져야 한다.
- 질문 ID, 결과 code, axis ID가 중복되지 않는다.
- 모든 option score는 존재하는 axis만 참조하고 숫자여야 한다.
- 일반 vector scoring 테스트는 모든 결과 vector가 모든 axis 값을 가진다.
- `axis-letter-majority` 테스트는 axis별 2개 letter, tie breaker, 모든 결과 조합을 갖춘다.
- 가능한 답변 조합을 점검할 수 있는 규모라면 모든 결과가 최소 1회 이상 도달 가능해야 한다.
- 자동 생성 테스트의 결과는 DPTI 수준의 상세 필드를 가져야 한다.
  - `summaryKo`: 목록/결과 상단용 요약
  - `descriptionKo`: 결과 본문 설명
  - `strengthsKo`: 3개 이상
  - `watchoutsKo`: 2개 이상
  - `collaborationKo`: 관계/업무/일상 적용 조언
  - `shareIntroKo`: 공유 카드 문구
- 결과 화면의 색상·이모지는 앱이 결과 code로 결정하므로 테스트팩에는 이미지 경로나 이미지 파일을 넣지 않는다.
- `imagePath`, `shareImagePath` 필드와 `assets/<testId>/` 디렉터리는 금지한다.
- `TODO`, `placeholder`, `임시`, `lorem` 같은 placeholder 문구가 없어야 한다.

## 이미지 없는 결과 정책

성향 테스트의 핵심 산출물은 결과 설명과 적용 조언입니다. 결과 시각화는 앱이 결과 code를 해시해 로컬 색상·이모지 카드로 렌더링합니다.

- 테스트팩 JSON에는 `imagePath`, `shareImagePath`를 넣지 않습니다.
- 테스트별 이미지 디렉터리나 이미지 생성 스크립트를 추가하지 않습니다.
- 앱 등록용 로고·썸네일·스크린샷은 마켓 출시 자산이므로 이 정책의 대상이 아닙니다.
- 향후 실제 공유 기능을 도입할 때는 별도 승인과 비용 검토 후 클라이언트 생성 카드 방식을 우선 검토합니다.

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

자동화 PR은 release blocker 해결 PR과 섞지 않습니다. 또한 공유 manifest, pack index, public 산출물 변경을 포함하지 않습니다.

## 매일 자동 생성 드라이버 (스케줄 에이전트)

"1회 실행 = 테스트 1개 PR" 절차를 매일 자동으로 굴리는 드라이버입니다. Claude Code 스케줄 클라우드 에이전트(cron routine)가 `docs/prompts/new-test-pack-pr.md`를 실행합니다.

```mermaid
flowchart LR
  Cron["cron 에이전트<br/>매일 1회"] --> Topics["pnpm list:test-topics<br/>중복 회피"]
  Topics --> Draft["draft 작성 (LLM)"]
  Draft --> Publish["publish:test-pack-draft"]
  Publish --> Check["pnpm check:content"]
  Check --> PR["feature/generated-test-*<br/>한글 PR"]
```

### 현재 상태

- 루틴은 **생성돼 있으나 비활성(`enabled: false`)** 입니다. 앱 재론칭 시점에 켭니다.
- 루틴 ID: `trig_01R8SXasenv6NhWAMZB8g2hH` — 관리: https://claude.ai/code/routines/trig_01R8SXasenv6NhWAMZB8g2hH

### 루틴 설정

| 항목 | 값 |
|---|---|
| cron | `0 22 * * *` (UTC) = 매일 07:00 KST |
| model | `claude-opus-4-8` |
| repo | `https://github.com/seorilabs/trait-test-hub` (origin/main 체크아웃) |
| allowed_tools | Bash, Read, Write, Edit, Glob, Grep |
| 프롬프트 | `docs/prompts/new-test-pack-pr.md` 절차를 따르도록 지시 (self-contained) |

### 켜기 전 선결 조건

클라우드 에이전트는 **origin/main**을 체크아웃하므로, 아래 도구가 main에 있어야 동작합니다.

- `pnpm list:test-topics` — 발행/draft/오픈PR 주제를 출력해 중복 회피 (`scripts/list-test-topics.mjs`)
- 갱신된 `docs/prompts/new-test-pack-pr.md`의 중복 방지·이미지 금지 절차

### 활성화 / 비활성화

`/schedule` 스킬 또는 RemoteTrigger API로 `enabled`만 토글합니다.

- 켜기: `enabled: true`
- 끄기: `enabled: false`
- 주기 변경: `cron_expression` 수정 (최소 간격 1시간). 리뷰 부담이 크면 주 N회로 낮춥니다.

매일 PR이 쌓이므로 **merge는 사람이** 합니다. 자동 merge하지 않습니다.
