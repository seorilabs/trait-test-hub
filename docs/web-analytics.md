# Web GA4 측정

공개 Pages 웹은 GA4 측정 ID `G-SQVNEDQKGY`를 `apps/preview/index.html`에서 로드합니다.

## 자동 수집

- `page_view`: gtag 기본 설정으로 수집
- 유입 URL: GA4의 `page_location`, `page_referrer` 기본 파라미터로 확인

## 제품 퍼널 이벤트

| 이벤트 | 발생 시점 | 파라미터 |
| --- | --- | --- |
| `test_start` | 첫 질문을 표시할 때 | `test_id`, `test_version`, `source` (`seo_landing` 또는 `web_home`) |
| `test_complete` | 마지막 답변으로 결과를 계산할 때 | `test_id`, `test_version`, `result_code` |

답변 원문, 사용자의 결과 설명, 개인 식별 정보는 전송하지 않습니다. 광고 또는 추가 식별자를 활성화하기 전에는 개인정보처리방침과 해당 지역의 동의 요건을 별도로 반영합니다.
