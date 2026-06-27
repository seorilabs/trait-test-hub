import type { ResultDistribution } from '../vendor/product-core.js';

// org 정책상 Cloud Function 직접 호출이 막혀, firestore REST API로 직접 접근한다.
// (firebase Web SDK의 firestore는 Node 'crypto'에 의존해 RN Metro 번들에서 깨지므로 REST로 우회)
//  - 완료 기록: completions에 1건 write(서버 트리거가 test_stats로 집계).
//  - 분포 조회: test_stats를 공개 read.
// apiKey는 공개 클라이언트 값(Firebase 콘솔 web 앱 등록값)이라 소스에 둔다.
const API_KEY = 'AIzaSyAsnTm_vGStpsD7R1Qxop-8FZnFPHrCcmk';
const DOCS_BASE = 'https://firestore.googleapis.com/v1/projects/trait-test-hub/databases/(default)/documents';

/** 완료 1건을 completions 큐에 기록한다(트리거가 집계). 실패는 조용히 무시. */
export async function recordCompletion(testId: string, version: number, resultCode: string): Promise<void> {
  try {
    await fetch(`${DOCS_BASE}/completions?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          testId: { stringValue: testId },
          version: { integerValue: String(version) },
          resultCode: { stringValue: resultCode },
        },
      }),
    });
  } catch {
    // 네트워크/권한 실패는 무시 — 화면은 fallback 문구를 유지한다.
  }
}

/** test_stats 분포를 공개 read한다. 문서가 없으면 빈 분포, 실패하면 null. */
export async function getStats(testId: string, version: number): Promise<ResultDistribution | null> {
  try {
    const versionKey = encodeURIComponent(`${testId}@${version}`);
    const response = await fetch(`${DOCS_BASE}/test_stats/${versionKey}?key=${API_KEY}`);
    if (response.status === 404) {
      return { total: 0, counts: {} };
    }
    if (!response.ok) {
      return null;
    }
    const document = (await response.json()) as {
      fields?: {
        total?: { integerValue?: string };
        counts?: { mapValue?: { fields?: Record<string, { integerValue?: string }> } };
      };
    };
    const fields = document.fields ?? {};
    const total = Number(fields.total?.integerValue ?? 0);
    const countFields = fields.counts?.mapValue?.fields ?? {};
    const counts: Record<string, number> = {};
    for (const [code, value] of Object.entries(countFields)) {
      counts[code] = Number(value.integerValue ?? 0);
    }
    return { total, counts };
  } catch {
    return null;
  }
}
