import { Storage } from '@apps-in-toss/web-framework';
import type { ContentStorage } from './contentRepository';

// AppsInToss WebView SDK의 Storage는 시그니처가 (string | Promise<string>) 형태로
// 콜백/Promise 모두 가능성 있어, 통일된 Promise 기반 ContentStorage로 감쌉니다.
// SDK 3.x의 Storage.getItems/setItems는 사용처(contentRepository)에 단건 API만 있어
// 여기서는 단건 API만 사용합니다.
type SdkStorage = {
  getItem(key: string): unknown;
  setItem(key: string, value: string): unknown;
  removeItem(key: string): unknown;
};

const sdk = Storage as unknown as SdkStorage;

function toPromise<T>(value: T | Promise<T>): Promise<T> {
  return Promise.resolve(value);
}

export const aitStorage: ContentStorage = {
  async getItem(key: string) {
    const raw = await toPromise(sdk.getItem(key));
    return typeof raw === 'string' ? raw : null;
  },
  async setItem(key: string, value: string) {
    await toPromise(sdk.setItem(key, value));
  },
  async removeItem(key: string) {
    await toPromise(sdk.removeItem(key));
  },
};