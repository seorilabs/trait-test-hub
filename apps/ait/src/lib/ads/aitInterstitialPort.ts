import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';
import { type AdFn, type InterstitialAdPort, createInterstitialAdPort } from './interstitialPort';

// AppsInToss 어댑터: 실제 SDK의 loadFullScreenAd/showFullScreenAd를 코어에 주입합니다.
// 프레임워크 import는 이 엣지 파일에만 두어, 순수 코어(interstitialPort)는 테스트 가능하게 유지합니다.
export function createAitInterstitialPort({
  adGroupId,
  loadTimeoutMs,
}: {
  adGroupId: string;
  loadTimeoutMs?: number;
}): InterstitialAdPort {
  return createInterstitialAdPort({
    adGroupId,
    load: loadFullScreenAd as unknown as AdFn,
    show: showFullScreenAd as unknown as AdFn,
    loadTimeoutMs,
  });
}
