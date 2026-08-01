// AdSense 승인 전에는 반드시 비활성으로 둡니다. client/slot 값은 공개 웹 식별자이지만,
// 개인정보처리방침·동의 관리·AdSense 승인 확인 없이 설정하거나 커밋하지 않습니다.
export const webMonetizationConfig = Object.freeze({
  adsenseClient: '',
  resultSlot: '',
});

export function isWebResultAdEnabled() {
  return Boolean(webMonetizationConfig.adsenseClient && webMonetizationConfig.resultSlot);
}
