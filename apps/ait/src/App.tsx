import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type Manifest,
  type ManifestEntry,
  type TraitScore,
  type TraitTest,
  scoreTraitTest,
  sortManifestEntries,
} from '@seorilabs/trait-test-core';
import { Home } from './pages/Home';
import { List } from './pages/List';
import { Question } from './pages/Question';
import { Result } from './pages/Result';
import { createContentRepository } from './lib/contentRepository';
import { aitStorage } from './lib/storageAdapter';
import { createAitInterstitialPort } from './lib/ads/aitInterstitialPort';
import { resolveInterstitialAdGroupId } from './lib/ads/adConfig';
import { createAitSharePort } from './lib/share/aitSharePort';
import { getStats, recordCompletion } from './lib/statsRepository';
import { graniteEvent } from '@apps-in-toss/web-framework';
import { pickDailyEntry, pickRandomEntry } from './lib/testSelection';

// 공개 테스트팩은 GitHub Pages custom domain(HTTPS)에서 받아옵니다.
// (apps/ait/README.md — 테스트팩 로컬 캐시 섹션 참고)
const CONTENT_ORIGIN = 'https://traithub.vzyx.xyz';

// 결과 공유 어댑터. 링크는 앱 딥링크, 미리보기는 GitHub Pages OG 이미지.
const sharePort = createAitSharePort();
const APP_DEEP_LINK = 'intoss://trait-test-hub';
const SHARE_OG_IMAGE_URL = 'https://traithub.vzyx.xyz/public/share-og.png';

const contentRepository = createContentRepository({ storage: aitStorage, origin: CONTENT_ORIGIN });

// 활성 카테고리 key (Storage에 저장해 다음 진입 시 복원).
const ACTIVE_CATEGORY_KEY = 'trait-test-hub:active-category';

type Screen = 'home' | 'list' | 'question' | 'result';
type Status = 'loading' | 'ready' | 'error';

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// manifest.filters.categories 메타를 우선 사용하고, 없으면 등장한 카테고리를 동적으로 만든다.
function deriveCategoryOptions(
  entries: ManifestEntry[],
  filters: Manifest['filters'] | undefined
): Array<{ id: string; labelKo: string }> {
  const meta = filters?.categories;
  if (meta && meta.length > 0) {
    return meta.map((c) => ({ id: c.id, labelKo: c.labelKo }));
  }
  const seen = new Set<string>();
  for (const entry of entries) {
    if (entry.status === 'published') seen.add(entry.category);
  }
  return Array.from(seen).map((id) => ({ id, labelKo: id }));
}

export function App() {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [usingCachedFallback, setUsingCachedFallback] = useState(false);
  const [entries, setEntries] = useState<ManifestEntry[]>([]);
  const [filters, setFilters] = useState<Manifest['filters'] | undefined>(undefined);

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const [screen, setScreen] = useState<Screen>('home');
  const [returnTo, setReturnTo] = useState<Screen>('home');
  const [activeEntry, setActiveEntry] = useState<ManifestEntry | null>(null);
  const [test, setTest] = useState<TraitTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<TraitScore | null>(null);

  const categoryOptions = useMemo(
    () => deriveCategoryOptions(entries, filters),
    [entries, filters]
  );

  const loadManifest = useCallback(async () => {
    setStatus('loading');
    setError(null);
    setUsingCachedFallback(false);
    const cached = await contentRepository.readCachedManifest();
    if (cached) {
      const published = cached.tests.filter((entry) => entry.status === 'published');
      setEntries(sortManifestEntries(published, 'featured'));
      setFilters(cached.filters);
      setStatus('ready');
    }
    try {
      const manifest = await contentRepository.fetchManifest();
      const published = manifest.tests.filter((entry) => entry.status === 'published');
      setEntries(sortManifestEntries(published, 'featured'));
      setFilters(manifest.filters);
      setStatus('ready');
      void contentRepository.prefetchTests(published);
    } catch (err) {
      if (cached) {
        setUsingCachedFallback(true);
        return;
      }
      setError(messageOf(err, '알 수 없는 오류가 발생했습니다.'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadManifest();
  }, [loadManifest]);

  // 첫 진입 시 저장된 카테고리를 복원. categoryOptions가 비어 있을 때는 'all'로 둔다.
  useEffect(() => {
    let alive = true;
    void aitStorage.getItem(ACTIVE_CATEGORY_KEY).then((value) => {
      if (!alive) return;
      if (typeof value === 'string' && value.length > 0) {
        setActiveCategory(value);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const persistCategory = useCallback(
    (next: string) => {
      setActiveCategory(next);
      void aitStorage.setItem(ACTIVE_CATEGORY_KEY, next).catch(() => {
        // 저장 실패는 UI에 영향 없음.
      });
    },
    []
  );

  const startTest = useCallback(
    async (entry: ManifestEntry, source: Screen) => {
      setReturnTo(source === 'list' ? 'list' : 'home');
      try {
        setActiveEntry(entry);
        setTest(await contentRepository.loadTest(entry));
        setAnswers({});
        setCurrentIndex(0);
        setScore(null);
        setScreen('question');
      } catch (err) {
        setError(messageOf(err, '테스트를 불러오지 못했습니다.'));
        setStatus('error');
      }
    },
    []
  );

  const startRandom = useCallback(() => {
    const entry = pickRandomEntry(entries);
    if (entry) {
      void startTest(entry, 'home');
    }
  }, [entries, startTest]);

  const goList = useCallback(() => setScreen('list'), []);

  const onAnswer = useCallback(
    (code: string) => {
      if (!test) return;
      const question = test.questions[currentIndex];
      if (!question) return;
      const nextAnswers = { ...answers, [question.id]: code };
      setAnswers(nextAnswers);
      if (currentIndex < test.questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setScore(scoreTraitTest(test, nextAnswers));
        setScreen('result');
      }
    },
    [test, currentIndex, answers]
  );

  const goBack = useCallback(() => {
    if (currentIndex === 0) {
      setScreen(returnTo);
    } else {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, returnTo]);

  const restart = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setScore(null);
    setScreen('question');
  }, []);

  const goHome = useCallback(() => {
    setScreen('home');
    setTest(null);
    setScore(null);
  }, []);

  // 호스트 뒤로가기를 내부 화면 전환에 연결.
  // 홈이 아닌 화면에서만 구독하면 호스트가 뒤로가기를 가로채 이 콜백을 실행하고,
  // 홈에서는 구독이 없어 호스트 기본 동작(앱 종료)으로 흘러갑니다.
  // SDK 3.x의 graniteEvent.addEventListener('backEvent', ...)가 정식 API.
  // ('toss:back' 커스텀 이벤트는 존재하지 않아 사용하면 백버튼이 무시되어
  //  호스트가 곧장 WebView를 닫아버립니다.)
  useEffect(() => {
    if (screen === 'home') return;
    const unsubscribe = graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        if (screen === 'question') {
          goBack();
        } else {
          goHome();
        }
      },
      onError: (error) => {
        // 구독 자체는 실패하지 않지만, 안전을 위해 콘솔에 남긴다.
        // 호스트가 없는 로컬 dev 환경에서는 호출되지 않는다.
        console.warn('apps/ait: backEvent listener error', error);
      },
    });
    return unsubscribe;
  }, [screen, goBack, goHome]);

  if (status === 'loading') {
    return (
      <div style={centerStyle}>
        <p style={mutedStyle}>테스트팩을 불러오는 중…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={centerStyle}>
        <h1 style={titleStyle}>테스트팩을 불러오지 못했습니다</h1>
        <p style={mutedStyle}>{error}</p>
        <button type="button" style={primaryButtonStyle} onClick={() => void loadManifest()}>
          다시 시도
        </button>
      </div>
    );
  }

  if (screen === 'question' && test) {
    const question = test.questions[currentIndex];
    if (!question) return null;
    return (
      <Question
        test={test}
        question={question}
        currentIndex={currentIndex}
        total={test.questions.length}
        returnTo={returnTo}
        onAnswer={onAnswer}
        onBack={goBack}
        onHome={goHome}
      />
    );
  }

  if (screen === 'result' && test && score && activeEntry) {
    return (
      <Result
        test={test}
        score={score}
        testId={activeEntry.testId}
        version={activeEntry.version}
        activeEntry={activeEntry}
        entries={entries}
        onRestart={restart}
        onHome={goHome}
        onStartSimilar={(entry) => void startTest(entry, 'home')}
        sharePort={sharePort}
        appDeepLink={APP_DEEP_LINK}
        shareOgImageUrl={SHARE_OG_IMAGE_URL}
        interstitialAdPortFactory={createAitInterstitialPort}
        resolveAdGroupId={resolveInterstitialAdGroupId}
        recordCompletion={(testId, version, resultCode) =>
          void recordCompletion(testId, version, resultCode)
        }
        fetchStats={getStats}
      />
    );
  }

  if (screen === 'list') {
    return (
      <List
        entries={entries}
        categoryOptions={categoryOptions}
        activeCategory={activeCategory}
        onChangeCategory={persistCategory}
        onBack={goHome}
        onStart={(entry) => void startTest(entry, 'list')}
      />
    );
  }

  return (
    <Home
      entries={entries}
      activeCategory={activeCategory}
      onChangeCategory={persistCategory}
      categoryOptions={categoryOptions}
      usingCachedFallback={usingCachedFallback}
      onStart={(entry) => void startTest(entry, 'home')}
      onStartRandom={startRandom}
      onOpenList={goList}
      pickDailyEntryFn={pickDailyEntry}
    />
  );
}

const centerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  flex: 1,
  backgroundColor: '#ffffff',
  gap: 12,
  minHeight: '100vh',
};

const titleStyle = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  color: '#1b1d1f',
};

const mutedStyle = {
  margin: 0,
  color: '#6b7280',
  fontSize: 14,
};

const primaryButtonStyle = {
  padding: '12px 20px',
  backgroundColor: '#2F6F68',
  color: '#ffffff',
  border: 'none',
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};