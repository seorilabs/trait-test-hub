# 테스트팩 Draft

자동 생성 테스트는 먼저 이 폴더에 `<testId>.json`으로 저장합니다.

실제 publish는 아래 명령으로만 진행합니다.

```bash
pnpm publish:test-pack-draft -- --draft=content/test-packs/drafts/<testId>.json
pnpm check:content
```

publish 결과는 테스트별 `entries/<testId>.json`, `tests/<testId>.json`만 PR에 포함합니다. 테스트팩 이미지와 `imagePath`/`shareImagePath`는 추가하지 않습니다. manifest, pack index, public 산출물은 직접 커밋하지 않습니다.

draft 형식과 PR 규칙은 `docs/content-automation.md`를 따릅니다.
