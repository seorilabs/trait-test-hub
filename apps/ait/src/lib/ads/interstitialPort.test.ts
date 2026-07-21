import { type AdFn, createInterstitialAdPort } from './interstitialPort';

// onEvent/onError로 SDK 이벤트를 흉내 냅니다. (Granite jest 프리셋이 fake timer를 켜므로
// microtask 대신 동기로 이벤트를 흘려 이벤트→결과 매핑을 검증합니다.)
function makeAd(script: (params: Parameters<AdFn>[0]) => void, supported = true): AdFn & { calls: number } {
  const fn = ((params) => {
    fn.calls += 1;
    script(params);
    return () => {};
  }) as AdFn & { calls: number };
  fn.calls = 0;
  fn.isSupported = () => supported;
  return fn;
}

describe('createInterstitialAdPort', () => {
  it('adGroupId가 없으면 광고를 부르지 않고 unconfigured를 반환한다', async () => {
    const load = makeAd(() => {});
    const show = makeAd(() => {});
    const port = createInterstitialAdPort({ adGroupId: '', load, show });
    await expect(port.showInterstitial()).resolves.toBe('unconfigured');
    expect(load.calls).toBe(0);
  });

  it('미지원 환경에서는 unsupported를 반환한다', async () => {
    const load = makeAd(() => {}, false);
    const show = makeAd(() => {});
    const port = createInterstitialAdPort({ adGroupId: 'g', load, show });
    await expect(port.showInterstitial()).resolves.toBe('unsupported');
    expect(load.calls).toBe(0);
  });

  it('loaded 후 impression이 오면 shown을 반환한다', async () => {
    const load = makeAd((p) => p.onEvent({ type: 'loaded' }));
    const show = makeAd((p) => p.onEvent({ type: 'impression' }));
    const port = createInterstitialAdPort({ adGroupId: 'g', load, show });
    await expect(port.showInterstitial()).resolves.toBe('shown');
    expect(show.calls).toBe(1);
  });

  it('로드 실패(onError)는 failed를 반환하고 show를 부르지 않는다', async () => {
    const load = makeAd((p) => p.onError(new Error('no fill')));
    const show = makeAd((p) => p.onEvent({ type: 'impression' }));
    const port = createInterstitialAdPort({ adGroupId: 'g', load, show });
    await expect(port.showInterstitial()).resolves.toBe('failed');
    expect(show.calls).toBe(0);
  });

  it('표시 실패(failedToShow)는 failed를 반환한다', async () => {
    const load = makeAd((p) => p.onEvent({ type: 'loaded' }));
    const show = makeAd((p) => p.onEvent({ type: 'failedToShow' }));
    const port = createInterstitialAdPort({ adGroupId: 'g', load, show });
    await expect(port.showInterstitial()).resolves.toBe('failed');
  });
});
