import * as AitFramework from '@apps-in-toss/framework';

// 정책상 실 광고 ID는 프로덕션(토스)에서만 노출해야 하고, 개발/샌드박스에서 실 ID로 테스트하면
// 정책 위반으로 간주될 수 있습니다. 그래서 운영 환경이 'toss'일 때만 라이브 ID를 쓰고,
// 그 외(샌드박스/판별 불가)에는 테스트 ID로 폴백합니다.
const LIVE_AD_GROUP_ID = 'ait.v2.live.5d1a320bbb154c07';
const TEST_AD_GROUP_ID = 'ait-ad-test-interstitial-id';

// getOperationalEnvironment는 공개 타입 선언에 없어(런타임에는 존재) 안전하게 동적 접근합니다.
export function resolveInterstitialAdGroupId(): string {
  try {
    const getEnv = (AitFramework as Record<string, unknown>).getOperationalEnvironment;
    if (typeof getEnv === 'function' && (getEnv as () => string)() === 'toss') {
      return LIVE_AD_GROUP_ID;
    }
  } catch {
    // 환경 판별 실패 시 정책상 안전한 테스트 ID로 폴백합니다.
  }
  return TEST_AD_GROUP_ID;
}
