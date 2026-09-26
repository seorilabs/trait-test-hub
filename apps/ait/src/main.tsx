import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { App } from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('apps/ait: #root 컨테이너를 찾을 수 없습니다.');
}

// AIT WebView SDK 3.x의 Vite 플러그인(`appsInToss`)이 빌드 시점에
// 앱 초기화(브릿지 attach)를 자동 처리합니다. 따라서 main.tsx는 평범한
// React 마운트와 TDS Provider 래핑만 담당합니다.
// SafeArea는 TDS Provider가 자체 처리합니다.
createRoot(container).render(
  <StrictMode>
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>
  </StrictMode>
);