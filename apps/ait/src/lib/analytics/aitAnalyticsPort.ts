import { eventLog, type EventLogParams } from '@apps-in-toss/web-framework';
import type { AnalyticsParams, AnalyticsPort } from './analyticsPort';

type EventLogger = (params: EventLogParams) => Promise<void>;

export function createAitAnalyticsPort(logger: EventLogger = eventLog): AnalyticsPort {
  const send = (logType: 'screen' | 'event', name: string, params: AnalyticsParams = {}) => {
    try {
      void Promise.resolve(
        logger({
          log_name: name,
          log_type: logType,
          params,
        })
      ).catch(() => {
        // 계측 실패가 사용자 흐름을 막지 않게 한다.
      });
    } catch {
      // 네이티브 브리지의 동기 예외도 사용자 흐름과 분리한다.
    }
  };

  return {
    screen(name, params) {
      send('screen', name, params);
    },
    event(name, params) {
      send('event', name, params);
    },
  };
}