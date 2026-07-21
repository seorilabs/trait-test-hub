// 결과 공유의 플랫폼 독립 포트. AIT·Web 등 어댑터가 이 인터페이스를 구현합니다.
// 스크린샷 이미지 첨부가 이상적이나, 현재 AIT 공유는 텍스트(message) 전용이라
// "이미지"는 공유 링크의 OG 이미지(ogImageUrl) 미리보기로 실현합니다.
export interface ShareResultPayload {
  testTitle: string;
  resultTitle: string;
  resultSummary: string;
  /** 토스 딥링크 경로. 예: intoss://trait-test-hub */
  deepLinkPath: string;
  /** 공유 링크 미리보기(OG) 이미지의 https 절대 URL. 선택. */
  ogImageUrl?: string;
}

export type ShareOutcome = 'shared' | 'unsupported' | 'failed';

export interface ShareResultPort {
  share(payload: ShareResultPayload): Promise<ShareOutcome>;
}

// 공유 시트 메시지: 결과 타이틀 + 요약 + 마지막 줄에 링크(“나도 해보기”).
// 순수 함수로 두어 어댑터 없이 단위 테스트합니다.
export function buildShareMessage(payload: ShareResultPayload, link: string): string {
  const lines = [`[${payload.testTitle}] 내 결과는 '${payload.resultTitle}'!`];
  const summary = payload.resultSummary.trim();
  if (summary) {
    lines.push(summary);
  }
  lines.push('', `나도 해보기 👉 ${link}`);
  return lines.join('\n');
}
