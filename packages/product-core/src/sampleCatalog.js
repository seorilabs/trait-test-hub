export const sampleTraitTests = [
  {
    id: 'daily-rhythm-test',
    version: 1,
    status: 'published',
    titleKo: '오늘의 리듬 테스트',
    category: 'routine',
    axes: [
      { id: 'pace', labelKo: '속도감' },
      { id: 'social', labelKo: '상호작용' },
    ],
    questions: [
      {
        id: 'q1',
        textKo: '예상보다 빈 시간이 생기면 먼저 하는 일은?',
        options: [
          { code: 'plan', textKo: '해야 할 일을 다시 정리한다', scores: { pace: 2, social: 0 } },
          { code: 'share', textKo: '누군가에게 연락해 같이 할 일을 찾는다', scores: { pace: 0, social: 2 } },
          { code: 'pause', textKo: '잠깐 쉬면서 흐름을 본다', scores: { pace: -1, social: 0 } },
        ],
      },
      {
        id: 'q2',
        textKo: '새로운 모임에 들어갔을 때 편한 방식은?',
        options: [
          { code: 'observe', textKo: '분위기를 먼저 살핀다', scores: { pace: -1, social: 0 } },
          { code: 'ask', textKo: '가벼운 질문으로 말을 건다', scores: { pace: 1, social: 2 } },
          { code: 'role', textKo: '맡을 역할을 빠르게 찾는다', scores: { pace: 2, social: 1 } },
        ],
      },
      {
        id: 'q3',
        textKo: '하루가 꼬였다고 느낄 때 회복 방법은?',
        options: [
          { code: 'reset', textKo: '작은 할 일 하나를 끝낸다', scores: { pace: 2, social: -1 } },
          { code: 'talk', textKo: '누군가와 이야기하며 정리한다', scores: { pace: 0, social: 2 } },
          { code: 'quiet', textKo: '조용한 시간을 확보한다', scores: { pace: -2, social: -1 } },
        ],
      },
    ],
    results: [
      {
        code: 'steady-planner',
        titleKo: '차분한 설계형',
        summaryKo: '흐름을 정리하고 작은 단위로 회복하는 편입니다.',
        vector: { pace: 4, social: -1 },
      },
      {
        code: 'warm-connector',
        titleKo: '따뜻한 연결형',
        summaryKo: '대화와 반응 속에서 다음 행동을 찾는 편입니다.',
        vector: { pace: 1, social: 5 },
      },
      {
        code: 'quiet-observer',
        titleKo: '느긋한 관찰형',
        summaryKo: '바로 움직이기보다 상황을 살피며 리듬을 맞추는 편입니다.',
        vector: { pace: -4, social: -1 },
      },
    ],
  },
];
