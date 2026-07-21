import { buildShareMessage } from './sharePort';

const base = {
  testTitle: '카페 자리 고르는 스타일',
  resultTitle: '창가 즉흥 관찰형',
  resultSummary: '활기찬 자리에 바로 앉아 분위기를 즐겨요.',
  deepLinkPath: 'intoss://trait-test-hub',
};

describe('buildShareMessage', () => {
  it('타이틀·요약·링크를 순서대로 담고 링크가 마지막 줄이다', () => {
    const message = buildShareMessage(base, 'https://toss.im/x');
    const lines = message.split('\n');
    expect(lines[0]).toBe("[카페 자리 고르는 스타일] 내 결과는 '창가 즉흥 관찰형'!");
    expect(lines[1]).toBe('활기찬 자리에 바로 앉아 분위기를 즐겨요.');
    expect(lines.at(-1)).toBe('나도 해보기 👉 https://toss.im/x');
  });

  it('요약이 비면 해당 줄을 생략한다', () => {
    const message = buildShareMessage({ ...base, resultSummary: '  ' }, 'https://toss.im/x');
    expect(message).toBe("[카페 자리 고르는 스타일] 내 결과는 '창가 즉흥 관찰형'!\n\n나도 해보기 👉 https://toss.im/x");
  });
});
