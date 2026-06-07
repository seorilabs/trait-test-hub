# 테스트팩 Draft

자동 생성 테스트는 먼저 이 폴더에 `<testId>.json`으로 저장합니다.

실제 publish는 아래 명령으로만 진행합니다.

```bash
pnpm publish:test-pack-draft -- --draft=content/test-packs/drafts/<testId>.json
pnpm check:content
```

draft 형식과 PR 규칙은 `docs/content-automation.md`를 따릅니다.
