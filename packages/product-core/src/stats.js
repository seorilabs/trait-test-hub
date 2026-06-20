// 결과 희소성("N명 중 1명") 계산. SDK 비의존 순수 로직이라 mobile/AIT가 공유한다.
// 입력 분포는 Firestore `test_stats/<versionKey>` 문서 형태({ total, counts })를 그대로 받는다.

// 이 표본 수 미만이면 "집계 중"으로 표시해, 1~2명일 때 "1명 중 1명" 같은 의미 없는 수치를 막는다.
export const MIN_RARITY_SAMPLE = 100;

/**
 * 결과 분포에서 특정 결과 code의 희소성을 계산한다.
 *
 * @param {{counts: Record<string, number>, total?: number}} distribution
 *   결과 code별 완료 수. 단순 { code: n } 맵을 직접 넘겨도 된다.
 * @param {string} resultCode 사용자가 받은 결과 code
 * @param {{minSample?: number}} [options]
 * @returns {{resultCode: string, total: number, count: number, share: number, oneInN: number|null, enoughSample: boolean}}
 *   - total: 전체 완료 수, count: 이 결과 수
 *   - share: count/total (0~1), oneInN: round(total/count) = "N명 중 1명"의 N
 *   - enoughSample: 표본이 충분해 화면에 노출해도 되는지
 */
export function computeResultRarity(distribution, resultCode, options = {}) {
  const { minSample = MIN_RARITY_SAMPLE } = options;
  if (typeof resultCode !== 'string' || resultCode.length === 0) {
    throw new Error('resultCode must be a non-empty string');
  }

  const counts = normalizeCounts(distribution);
  // 저장된 total을 믿지 않고 counts 합에서 재계산해 드리프트를 막는다.
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const count = counts[resultCode] ?? 0;

  const share = total > 0 ? count / total : 0;
  const oneInN = count > 0 ? Math.max(1, Math.round(total / count)) : null;
  const enoughSample = total >= minSample && count > 0;

  return { resultCode, total, count, share, oneInN, enoughSample };
}

/**
 * 희소성 결과를 한글 문구로 만든다. 앱이 자체 카피로 덮어써도 된다.
 * @param {ReturnType<typeof computeResultRarity>} rarity
 * @returns {string}
 */
export function formatRarityKo(rarity) {
  if (!rarity || !rarity.enoughSample || rarity.oneInN === null) {
    return '아직 집계 중이에요';
  }
  const pct = rarity.share * 100;
  const pctText = pct < 1 ? '1% 미만' : `${Math.round(pct)}%`;
  return `${rarity.oneInN.toLocaleString('ko-KR')}명 중 1명 · 전체의 ${pctText}`;
}

function normalizeCounts(distribution) {
  const counts =
    distribution && typeof distribution === 'object'
      ? distribution.counts ?? distribution
      : null;
  if (!counts || typeof counts !== 'object') {
    throw new Error('distribution.counts must be an object');
  }

  const normalized = {};
  for (const [code, value] of Object.entries(counts)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new Error(`Invalid count for ${code}: ${value}`);
    }
    normalized[code] = value;
  }
  return normalized;
}
