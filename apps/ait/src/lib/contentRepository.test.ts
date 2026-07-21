import { createContentRepository, type ContentFetch, type ContentStorage } from './contentRepository';

class MemoryStorage implements ContentStorage {
  readonly values = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.values.delete(key);
  }
}

const entry = {
  testId: 'offline-style',
  version: 2,
  status: 'published',
  titleKo: '오프라인 스타일 테스트',
  category: 'routine',
  tags: ['offline'],
  questionCount: 1,
  resultCount: 1,
  estimatedMinutes: '1분',
  path: '/test-packs/packs/generated-v1/tests/offline-style.json',
};

const manifest = {
  schemaVersion: 1,
  generatedAt: '2026-07-20T00:00:00.000Z',
  tests: [entry],
};

const testPayload = {
  schemaVersion: 1,
  test: {
    id: 'offline-style',
    version: 2,
    titleKo: '오프라인 스타일 테스트',
    axes: [{ id: 'pace' }],
    questions: [
      {
        id: 'q01',
        textKo: '어떻게 시작하나요?',
        options: [
          { code: 'A', textKo: '천천히' },
          { code: 'B', textKo: '빠르게' },
        ],
      },
    ],
    results: [{ code: 'A', titleKo: '차분형', summaryKo: '차분하게 시작해요.' }],
  },
};

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe('contentRepository', () => {
  it('검증된 manifest를 저장하고 네트워크 없이 다시 읽는다', async () => {
    const storage = new MemoryStorage();
    const fetchImpl = jest.fn<ReturnType<ContentFetch>, Parameters<ContentFetch>>(() => jsonResponse(manifest));
    const repository = createContentRepository({ storage, origin: 'https://example.com', fetchImpl });

    await expect(repository.fetchManifest()).resolves.toMatchObject({ tests: [entry] });
    await expect(repository.readCachedManifest()).resolves.toMatchObject({ tests: [entry] });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('버전별 테스트 JSON을 선저장하고 캐시에서 실행한다', async () => {
    const storage = new MemoryStorage();
    const fetchImpl = jest.fn<ReturnType<ContentFetch>, Parameters<ContentFetch>>(() => jsonResponse(testPayload));
    const repository = createContentRepository({ storage, origin: 'https://example.com', fetchImpl });

    await repository.prefetchTests([entry]);
    fetchImpl.mockClear();

    await expect(repository.loadTest(entry)).resolves.toMatchObject({ id: entry.testId, version: entry.version });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('manifest와 일치하지 않는 테스트는 캐시하지 않는다', async () => {
    const storage = new MemoryStorage();
    const mismatched = {
      ...testPayload,
      test: { ...testPayload.test, version: 3 },
    };
    const fetchImpl = jest.fn<ReturnType<ContentFetch>, Parameters<ContentFetch>>(() => jsonResponse(mismatched));
    const repository = createContentRepository({ storage, origin: 'https://example.com', fetchImpl });

    await expect(repository.loadTest(entry)).rejects.toThrow('manifest와 테스트 버전이 일치하지 않습니다');
    expect([...storage.values.keys()].some((key) => key.includes('offline-style@2'))).toBe(false);
  });

  it('외부 URL이나 임의 경로를 테스트 데이터로 요청하지 않는다', async () => {
    const storage = new MemoryStorage();
    const fetchImpl = jest.fn<ReturnType<ContentFetch>, Parameters<ContentFetch>>(() => jsonResponse(testPayload));
    const repository = createContentRepository({ storage, origin: 'https://example.com', fetchImpl });

    await expect(repository.loadTest({ ...entry, path: 'https://evil.example/test.json' })).rejects.toThrow(
      '허용되지 않은 테스트 데이터 경로',
    );
    await expect(repository.loadTest({ ...entry, path: '/test-packs/../secret.json' })).rejects.toThrow(
      '허용되지 않은 테스트 데이터 경로',
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
