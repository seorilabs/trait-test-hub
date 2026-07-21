# 루틴 프롬프트: 신규 성향 테스트 추가 PR

이 문서는 자동화 세션(Claude 등)에 그대로 붙여넣어 실행하는 루틴 프롬프트입니다.

- 1회 실행 = 신규 테스트 1개 = PR 1건
- 세부 규칙이 이 프롬프트와 다르면 `docs/content-automation.md`, `docs/test-packs.md`가 우선합니다.

---

## 프롬프트 본문

너는 `trait-test-hub` repo에 성향 테스트 1개를 추가하는 PR을 만드는 콘텐츠 자동화 에이전트다.
시작 전에 `docs/content-automation.md`와 `docs/test-packs.md`를 읽고, 아래 절차를 순서대로 수행한다.
한 번의 실행에서 테스트 1개만 만들고 PR 1건만 연다.

### 0. 중복 방지 사전 조사

새 테스트는 "기존에 없던 테스트"여야 한다. 주제를 정하기 전에 아래 명령으로 중복 후보를 한 번에 수집한다.

```bash
pnpm list:test-topics
```

이 명령은 아래 셋을 모두 출력한다. 여기 등장한 주제·testId·제목과 겹치면 안 된다.

1. 발행/소스 테스트: `content/test-packs/packs/*/tests/*.json`
2. 작성 중 draft: `content/test-packs/drafts/*.json`
3. 열린 PR: `feature/generated-test-*` 오픈 PR (merge 전인 것도 모두 중복 대상)
   (gh CLI를 못 쓰는 환경이면 PR은 직접 확인한다)

위 어디에도 없는 새 주제와 새 kebab-case `testId`를 고른다.
기존 주제의 사소한 변형(예: "공간 정리 스타일"이 있는데 "책상 정리 스타일")도 중복으로 간주하고 피한다.

### 1. 주제 선정 — 후킹 기준

주제 후보 5개를 만들고, 아래 기준에 채점해 가장 점수가 높은 1개를 고른다.
선정 근거는 나중에 PR 본문에 한 줄로 남긴다.

- 결과를 받자마자 친구에게 보내고 싶은가 (공유 동기)
- "나 완전 이거다"라는 자기 동일시가 바로 일어나는가
- 단톡방·점심 자리에서 대화 소재가 되는가
- 제목만 보고 3초 안에 무엇을 알려주는 테스트인지 이해되는가
- 결과 유형 이름이 별명처럼 부를 수 있는가 (예: "번쩍임 캐처형")

허용 범위는 가벼운 자기이해/취향/일상/업무 성향뿐이다.
`docs/content-automation.md`의 금지 주제(의학·정신건강 진단, 법률/금융 판단, 정치 성향,
MBTI·DISC·Big Five 구조 차용, 실존 인물·브랜드·저작권 캐릭터, 손실 유발 주제)는 후보에서 제외한다.

### 2. Draft 작성

`content/test-packs/drafts/<testId>.json`을 `docs/content-automation.md`의 "Draft 파일 계약" 형식으로 만든다.

질문:

- 8문항 표준 (품질 게이트 최소 8문항, 완주율 지표로 검증)
- 문항당 선택지 3개, 모든 선택지에 `descriptionKo`와 axis `scores` 포함
- 질문은 구체적인 일상 장면으로 쓴다. 추상적인 성격 자가진단 문장 금지

결과 — 배리에이션이 다양해야 한다:

- 결과 4~6개. 모든 결과가 실제 답 조합으로 도달 가능해야 한다 (vector scoring 기준으로 직접 점검)
- 결과끼리 톤과 결이 뚜렷이 달라야 한다. 전부 비슷한 칭찬형으로 만들지 말고,
  강점·주의점·협업 조언이 유형마다 다른 방향을 가리키게 쓴다
- 결과별 필수 필드: `summaryKo`, `descriptionKo`, `strengthsKo`(3개 이상), `watchoutsKo`(2개 이상),
  `collaborationKo`, `shareIntroKo`
- `shareIntroKo`는 1인칭 공유 문구로 쓴다 (예: "나는 ~하는 ○○형이에요")
- `imagePath`, `shareImagePath` 또는 이미지 파일을 추가하지 않는다. 결과 시각화는 앱의 로컬 색상·이모지 카드가 담당한다
- 결과 문구가 단정적 진단처럼 읽히지 않게 한다

metadata:

- 새 category/tag를 도입하면 `categoryLabelKo`, `tagLabelsKo`를 반드시 함께 넣는다
- `TODO`, `placeholder`, `임시`, `lorem` 같은 문구가 어디에도 없어야 한다

### 3. Publish와 검증

```bash
pnpm publish:test-pack-draft -- --draft=content/test-packs/drafts/<testId>.json
pnpm check:content
```

`check:content`가 실패하면 draft를 고쳐 통과할 때까지 반복한다.
통과한 명령과 출력 요약은 PR 본문에 넣는다.

### 4. PR 생성 — 충돌 안전 규칙

여러 테스트 PR이 동시에 열려 있어도 서로 충돌하지 않도록, 변경은 테스트별 독립 경로 3곳으로 한정한다.

허용 경로 (이 외 변경 금지):

- `content/test-packs/drafts/<testId>.json`
- `content/test-packs/packs/generated-v1/tests/<testId>.json`
- `content/test-packs/packs/generated-v1/entries/<testId>.json`

수정 금지 (공유 산출물 — 빌드 단계에서 재생성됨):

- `content/test-packs/manifest.json`
- `content/test-packs/packs/*/pack.json`
- `public/test-packs/**`
- `tmp/**`

절차:

1. 커밋 전 `git status`로 변경 파일이 허용 경로 3곳 안에만 있는지 확인한다. 벗어난 파일은 되돌린다.
2. 브랜치는 최신 `origin/main`에서 새로 분기한다: `feature/generated-test-<testId>`
   다른 테스트 PR 브랜치를 base로 쓰거나 merge하지 않는다.
3. 커밋 메시지는 한글 bullet로 쓴다.
4. PR 제목: `성향 테스트 추가: <테스트명>`
5. PR 본문은 `.github/PULL_REQUEST_TEMPLATE.md` 체크리스트를 채우고, 추가로 아래를 넣는다.
   - 주제 선정 근거 1줄 (후킹 기준 중 무엇을 노렸는지)
   - 실행한 검증 명령과 결과
   - 사람이 확인해야 할 문항·결과 톤 이슈
   - 결과 분기 구조 Mermaid 다이어그램 (axis → 결과 매핑이 한눈에 보이면 충분)

### 완료 조건

아래를 모두 만족하면 종료한다. 하나라도 어기면 PR을 열지 않는다.

- [ ] 기존 테스트·draft·오픈 PR과 주제/testId가 겹치지 않는다
- [ ] 질문 10개 이상, 문항당 선택지 3개
- [ ] 결과 4개 이상, 모두 도달 가능, 톤이 서로 구분된다
- [ ] `imagePath`, `shareImagePath` 또는 테스트팩 이미지 파일이 없다
- [ ] `pnpm check:content` 통과
- [ ] 변경 파일이 테스트별 독립 경로 3곳에만 있다
- [ ] PR 1건이 `feature/generated-test-<testId>` 브랜치로 열렸다
