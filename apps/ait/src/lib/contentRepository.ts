import {
  type Manifest,
  type ManifestEntry,
  type TraitTest,
  validateManifest,
  validateTraitTest,
} from '../vendor/product-core.js';

const CACHE_NAMESPACE = 'trait-test-hub:content:v1';
const MANIFEST_CACHE_KEY = `${CACHE_NAMESPACE}:manifest`;

export interface ContentStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

interface JsonResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type ContentFetch = (url: string, init?: RequestInit) => Promise<JsonResponse>;

export interface ContentRepository {
  readCachedManifest(): Promise<Manifest | null>;
  fetchManifest(): Promise<Manifest>;
  loadTest(entry: ManifestEntry): Promise<TraitTest>;
  prefetchTests(entries: ManifestEntry[]): Promise<void>;
}

export function createContentRepository({
  storage,
  origin,
  fetchImpl = fetch,
}: {
  storage: ContentStorage;
  origin: string;
  fetchImpl?: ContentFetch;
}): ContentRepository {
  const normalizedOrigin = origin.replace(/\/$/, '');
  if (!normalizedOrigin.startsWith('https://')) {
    throw new Error(`콘텐츠 origin은 HTTPS여야 합니다: ${origin}`);
  }
  const manifestUrl = `${normalizedOrigin}/test-packs/manifest.json`;

  async function readCache(key: string): Promise<unknown | null> {
    try {
      const value = await storage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      await removeCache(key);
      return null;
    }
  }

  async function writeCache(key: string, value: unknown): Promise<void> {
    try {
      await storage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장소 오류가 온라인 콘텐츠 로딩까지 막지 않도록 무시합니다.
    }
  }

  async function removeCache(key: string): Promise<void> {
    try {
      await storage.removeItem(key);
    } catch {
      // 손상된 캐시를 지우지 못해도 네트워크 갱신은 계속합니다.
    }
  }

  async function fetchJson(url: string): Promise<unknown> {
    const response = await fetchImpl(url, { cache: 'no-store' } as RequestInit);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${url}`);
    }
    return response.json();
  }

  function contentUrl(path: string): string {
    if (
      !path.startsWith('/test-packs/') ||
      !path.endsWith('.json') ||
      path.includes('..') ||
      path.includes('\\') ||
      path.includes('?') ||
      path.includes('#')
    ) {
      throw new Error(`허용되지 않은 테스트 데이터 경로: ${path}`);
    }
    return `${normalizedOrigin}${path}`;
  }

  function testCacheKey(entry: ManifestEntry): string {
    return `${CACHE_NAMESPACE}:test:${entry.testId}@${entry.version}`;
  }

  function validateContentManifest(raw: unknown): Manifest {
    const manifest = validateManifest(raw);
    for (const entry of manifest.tests) {
      contentUrl(entry.path);
    }
    return manifest;
  }

  function validatePayload(payload: unknown, entry: ManifestEntry): TraitTest {
    if (!payload || typeof payload !== 'object') {
      throw new Error(`잘못된 테스트 데이터: ${entry.path}`);
    }
    const candidate = payload as { schemaVersion?: number; test?: unknown };
    if (candidate.schemaVersion !== 1 || !candidate.test) {
      throw new Error(`잘못된 테스트 데이터: ${entry.path}`);
    }
    const test = validateTraitTest(candidate.test);
    if (test.id !== entry.testId || test.version !== entry.version) {
      throw new Error(`manifest와 테스트 버전이 일치하지 않습니다: ${entry.testId}@${entry.version}`);
    }
    return test;
  }

  async function readCachedManifest(): Promise<Manifest | null> {
    const cached = await readCache(MANIFEST_CACHE_KEY);
    if (!cached) {
      return null;
    }
    try {
      return validateContentManifest(cached);
    } catch {
      await removeCache(MANIFEST_CACHE_KEY);
      return null;
    }
  }

  async function fetchManifest(): Promise<Manifest> {
    const raw = await fetchJson(manifestUrl);
    const manifest = validateContentManifest(raw);
    await writeCache(MANIFEST_CACHE_KEY, raw);
    return manifest;
  }

  async function readCachedTest(entry: ManifestEntry): Promise<TraitTest | null> {
    const key = testCacheKey(entry);
    const cached = await readCache(key);
    if (!cached) {
      return null;
    }
    try {
      return validatePayload(cached, entry);
    } catch {
      await removeCache(key);
      return null;
    }
  }

  async function fetchTest(entry: ManifestEntry): Promise<TraitTest> {
    const raw = await fetchJson(contentUrl(entry.path));
    const test = validatePayload(raw, entry);
    await writeCache(testCacheKey(entry), raw);
    return test;
  }

  async function loadTest(entry: ManifestEntry): Promise<TraitTest> {
    contentUrl(entry.path);
    return (await readCachedTest(entry)) ?? fetchTest(entry);
  }

  async function prefetchTests(entries: ManifestEntry[]): Promise<void> {
    const published = entries.filter((entry) => entry.status === 'published');
    await Promise.allSettled(
      published.map(async (entry) => {
        if (!(await readCachedTest(entry))) {
          await fetchTest(entry);
        }
      }),
    );
  }

  return {
    readCachedManifest,
    fetchManifest,
    loadTest,
    prefetchTests,
  };
}
