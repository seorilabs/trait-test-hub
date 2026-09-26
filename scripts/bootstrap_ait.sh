#!/usr/bin/env bash
set -euo pipefail

app_name="${1:-}"

if [ -z "${app_name}" ]; then
  echo "Usage: pnpm run bootstrap:ait -- <app-name>" >&2
  echo "Example: pnpm run bootstrap:ait -- trait-test-hub" >&2
  exit 2
fi

if [ -f "apps/ait/apps-in-toss.config.ts" ] || [ -d "apps/ait/src" ]; then
  echo "apps/ait already appears initialized. Refusing to overwrite." >&2
  exit 1
fi

echo "Creating AppsInToss WebView app: ${app_name}"
echo "(현재 트레잇 테스트 허브의 apps/ait는 이미 구성되어 있어 새 스캐폴딩은 다른 빈 디렉터리에 직접 진행하세요.)"
echo "참고: SDK 3.x 마이그레이션 가이드 — https://developers-apps-in-toss.toss.im/documentation/integration/sdk-3.x.md"