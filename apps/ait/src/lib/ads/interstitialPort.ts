// 전면(Interstitial) 광고의 플랫폼 독립 포트.
// - 'shown': 광고가 노출됨(수익 시점)
// - 'failed': 로드/표시 실패
// - 'unsupported': 현재 환경에서 통합 광고 미지원(구버전 토스앱 등)
// - 'unconfigured': 광고 그룹 ID 미설정 → 노출 시도 자체를 건너뜀
export type InterstitialOutcome = 'shown' | 'failed' | 'unsupported' | 'unconfigured';

export interface InterstitialAdPort {
  // 로드→표시를 한 번에 수행하고 결과를 반환합니다(호출 측은 UI를 막지 않는 fire-and-forget 권장).
  showInterstitial(): Promise<InterstitialOutcome>;
}

// AIT 통합 광고 SDK 최소 형태. 실제 타입과 호환되며, 테스트에서 주입할 수 있게 좁게 정의합니다.
type AdEvent = { type: string; data?: unknown };
type AdParams = {
  options: { adGroupId: string };
  onEvent: (event: AdEvent) => void;
  onError: (error: unknown) => void;
};
export type AdFn = ((params: AdParams) => () => void) & { isSupported?: () => boolean };

// 프레임워크 비의존 코어: load/show 함수를 주입받아 load → (loaded) → show → (impression/dismissed)
// 순서로 전면 광고를 노출합니다. AIT 어댑터와 테스트가 이 코어를 공유합니다.
export function createInterstitialAdPort({
  adGroupId,
  load,
  show,
  loadTimeoutMs = 6000,
}: {
  adGroupId: string;
  load: AdFn;
  show: AdFn;
  loadTimeoutMs?: number;
}): InterstitialAdPort {
  return {
    showInterstitial(): Promise<InterstitialOutcome> {
      if (!adGroupId) {
        return Promise.resolve('unconfigured');
      }
      // isSupported() 자체가 예외를 던질 수 있어 방어적으로 감쌉니다. 예: Toss 호스트 밖
      // 로컬 dev에서 operationalEnvironment는 "toss"인데 tossAppVersion이 빈 값이면
      // SDK 내부의 버전 비교가 'Invalid semver' 예외를 던집니다. 지원 여부조차 판별하지
      // 못하는 환경이면 미지원으로 간주해 결과 화면이 깨지지 않게 합니다.
      try {
        if (load.isSupported?.() === false || show.isSupported?.() === false) {
          return Promise.resolve('unsupported');
        }
      } catch {
        return Promise.resolve('unsupported');
      }

      return new Promise<InterstitialOutcome>((resolve) => {
        let settled = false;
        let unregisterLoad = () => {};
        let unregisterShow = () => {};
        let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(() => finish('failed'), loadTimeoutMs);

        function finish(outcome: InterstitialOutcome) {
          if (settled) {
            return;
          }
          settled = true;
          if (timer) {
            clearTimeout(timer);
            timer = undefined;
          }
          unregisterLoad();
          unregisterShow();
          resolve(outcome);
        }

        try {
          unregisterLoad = load({
            options: { adGroupId },
            onEvent: (event) => {
              if (event.type !== 'loaded') {
                return;
              }
              if (timer) {
                clearTimeout(timer);
                timer = undefined;
              }
              try {
                unregisterShow = show({
                  options: { adGroupId },
                  onEvent: (showEvent) => {
                    if (showEvent.type === 'dismissed' || showEvent.type === 'impression') {
                      finish('shown');
                    } else if (showEvent.type === 'failedToShow') {
                      finish('failed');
                    }
                  },
                  onError: () => finish('failed'),
                });
              } catch {
                finish('failed');
              }
            },
            onError: () => finish('failed'),
          });
        } catch {
          finish('failed');
        }
      });
    },
  };
}
