const MEASUREMENT_ID = 'G-SQVNEDQKGY';

export function trackWebEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('event', name, params);
}

export const WEB_ANALYTICS_EVENTS = Object.freeze({
  testStart: 'test_start',
  testComplete: 'test_complete',
});

export { MEASUREMENT_ID };
