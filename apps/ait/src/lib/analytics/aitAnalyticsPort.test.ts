import { describe, expect, it, vi } from 'vitest';

vi.mock('@apps-in-toss/web-framework', () => ({
  eventLog: vi.fn(async () => {}),
}));

import type { EventLogParams } from '@apps-in-toss/web-framework';
import { createAitAnalyticsPort } from './aitAnalyticsPort';

describe('createAitAnalyticsPort', () => {
  it('화면과 행동 이벤트를 AppsInToss 로그 형식으로 전달한다', async () => {
    const logs: EventLogParams[] = [];
    const port = createAitAnalyticsPort(async (payload) => {
      logs.push(payload);
    });

    port.screen('trait_hub_home_view', { test_count: 12 });
    port.event('trait_test_start', {
      test_id: 'dpti',
      test_version: 1,
      entry_point: 'home_daily',
    });
    await Promise.resolve();

    expect(logs).toEqual([
      {
        log_name: 'trait_hub_home_view',
        log_type: 'screen',
        params: { test_count: 12 },
      },
      {
        log_name: 'trait_test_start',
        log_type: 'event',
        params: {
          test_id: 'dpti',
          test_version: 1,
          entry_point: 'home_daily',
        },
      },
    ]);
  });

  it('계측 실패를 사용자 흐름으로 전파하지 않는다', () => {
    const port = createAitAnalyticsPort(() => {
      throw new Error('bridge unavailable');
    });

    expect(() => port.event('trait_test_complete')).not.toThrow();
  });
});