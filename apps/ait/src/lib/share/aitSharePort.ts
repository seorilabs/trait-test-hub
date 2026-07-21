import { getTossShareLink, share } from '@apps-in-toss/framework';
import {
  type ShareOutcome,
  type ShareResultPayload,
  type ShareResultPort,
  buildShareMessage,
} from './sharePort';

// AppsInToss 어댑터: getTossShareLink로 OG 이미지가 붙는 토스 공유 링크를 만들고,
// 네이티브 공유 시트(share)에 결과 메시지 + 링크를 전달합니다.
// 구버전 토스앱에서 API가 없거나 링크 생성이 실패하면 'unsupported'/'failed'로 안전 종료합니다.
export function createAitSharePort(): ShareResultPort {
  return {
    async share(payload: ShareResultPayload): Promise<ShareOutcome> {
      if (typeof getTossShareLink !== 'function' || typeof share !== 'function') {
        return 'unsupported';
      }
      try {
        const link = await getTossShareLink(payload.deepLinkPath, payload.ogImageUrl);
        if (!link) {
          return 'unsupported';
        }
        await share({ message: buildShareMessage(payload, link) });
        return 'shared';
      } catch {
        return 'failed';
      }
    },
  };
}
