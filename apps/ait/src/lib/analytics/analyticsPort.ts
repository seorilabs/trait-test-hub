export type AnalyticsValue = string | number | boolean | null;
export type AnalyticsParams = Record<string, AnalyticsValue>;

export interface AnalyticsPort {
  screen(name: string, params?: AnalyticsParams): void;
  event(name: string, params?: AnalyticsParams): void;
}

export const ANALYTICS_EVENTS = {
  homeView: 'trait_hub_home_view',
  testListView: 'trait_hub_test_list_view',
  questionView: 'trait_test_question_view',
  resultView: 'trait_test_result_view',
  testStart: 'trait_test_start',
  questionAnswer: 'trait_test_question_answer',
  testComplete: 'trait_test_complete',
  testExit: 'trait_test_exit',
  shareAttempt: 'trait_test_share_attempt',
  shareOpened: 'trait_test_share_opened',
  shareFailed: 'trait_test_share_failed',
  contentLoadFailed: 'trait_hub_content_load_failed',
} as const;

export type TestStartSource = 'home_daily' | 'home_random' | 'test_list' | 'result_restart';
