import { Storage } from '@apps-in-toss/framework';
import { createRoute } from '@granite-js/react-native';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  type ManifestEntry,
  type TraitScore,
  type TraitTest,
  computeResultRarity,
  formatRarityKo,
  scoreTraitTest,
  sortManifestEntries,
} from '../vendor/product-core.js';
import { createContentRepository } from '../lib/contentRepository';
import { getStats, recordCompletion } from '../lib/statsRepository';
import { pickDailyEntry, pickRandomEntry } from '../lib/testSelection';

export const Route = createRoute('/', {
  component: HubPage,
});

// 공개 테스트팩은 현재 GitHub Pages custom domain에서 HTTPS로 받아옵니다.
const CONTENT_ORIGIN = 'https://traithub.vzyx.xyz';
const contentRepository = createContentRepository({ storage: Storage, origin: CONTENT_ORIGIN });

const BRAND = '#2F6F68';

const DEFAULT_RESULT_THEME = { emoji: '🧭', background: '#EAF3F1', foreground: '#245C56' } as const;
const RESULT_THEMES = [
  DEFAULT_RESULT_THEME,
  { emoji: '✨', background: '#F4EEFF', foreground: '#62449A' },
  { emoji: '🌿', background: '#EEF5E8', foreground: '#456B35' },
  { emoji: '💡', background: '#FFF4D9', foreground: '#8A6418' },
  { emoji: '🌊', background: '#E8F3FA', foreground: '#2E617E' },
  { emoji: '🎯', background: '#FCECE8', foreground: '#8C493C' },
] as const;

type Screen = 'home' | 'list' | 'question' | 'result';
type Status = 'loading' | 'ready' | 'error';

function getResultTheme(code: string) {
  let hash = 0;
  for (const character of code) {
    hash = (hash * 31 + character.codePointAt(0)!) >>> 0;
  }
  return RESULT_THEMES[hash % RESULT_THEMES.length] ?? DEFAULT_RESULT_THEME;
}

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function HubPage() {
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [usingCachedFallback, setUsingCachedFallback] = useState(false);
  const [entries, setEntries] = useState<ManifestEntry[]>([]);
  const [screen, setScreen] = useState<Screen>('home');
  const [returnTo, setReturnTo] = useState<Screen>('home');
  const [activeEntry, setActiveEntry] = useState<ManifestEntry | null>(null);
  const [test, setTest] = useState<TraitTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<TraitScore | null>(null);

  const loadManifest = useCallback(async () => {
    setStatus('loading');
    setError(null);
    setUsingCachedFallback(false);
    const cached = await contentRepository.readCachedManifest();
    if (cached) {
      const published = cached.tests.filter((entry) => entry.status === 'published');
      setEntries(sortManifestEntries(published, 'featured'));
      setStatus('ready');
    }
    try {
      const manifest = await contentRepository.fetchManifest();
      const published = manifest.tests.filter((entry) => entry.status === 'published');
      setEntries(sortManifestEntries(published, 'featured'));
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
    loadManifest();
  }, [loadManifest]);

  const startTest = useCallback(
    async (entry: ManifestEntry) => {
      // 완료 후 뒤로가기가 진입 화면(홈/목록)으로 돌아가도록 기억합니다.
      setReturnTo(screen === 'list' ? 'list' : 'home');
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
    [screen]
  );

  const startRandom = useCallback(() => {
    const entry = pickRandomEntry(entries);
    if (entry) {
      void startTest(entry);
    }
  }, [entries, startTest]);

  const goList = useCallback(() => setScreen('list'), []);

  const onAnswer = useCallback(
    (code: string) => {
      if (!test) {
        return;
      }
      const question = test.questions[currentIndex];
      if (!question) {
        return;
      }
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

  const topPadding = { paddingTop: insets.top + 16 };

  if (status === 'loading') {
    return (
      <View style={[styles.center, topPadding]}>
        <ActivityIndicator color={BRAND} size="large" />
        <Text style={styles.muted}>테스트팩을 불러오는 중…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.center, topPadding]}>
        <Text style={styles.eyebrow}>Trait Test Hub</Text>
        <Text style={styles.title}>테스트팩을 불러오지 못했습니다</Text>
        <Text style={styles.muted}>{error}</Text>
        <PrimaryButton label="다시 시도" onPress={loadManifest} />
      </View>
    );
  }

  if (screen === 'question' && test) {
    const question = test.questions[currentIndex];
    if (!question) {
      return null;
    }
    const total = test.questions.length;
    const progress = Math.round(((currentIndex + 1) / total) * 100);
    return (
      <ScrollView contentContainerStyle={[styles.screen, topPadding]}>
        <View style={styles.questionHeader}>
          <TouchableOpacity onPress={goBack}>
            <Text style={styles.ghost}>뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.muted}>
            {currentIndex + 1} / {total}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.eyebrow}>{test.titleKo}</Text>
        <Text style={styles.question}>{question.textKo}</Text>
        <View style={styles.options}>
          {question.options.map((option) => (
            <TouchableOpacity key={option.code} style={styles.option} onPress={() => onAnswer(option.code)}>
              <Text style={styles.optionTitle}>{option.textKo}</Text>
              {option.descriptionKo ? <Text style={styles.optionDesc}>{option.descriptionKo}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (screen === 'result' && test && score && activeEntry) {
    return (
      <ResultView
        test={test}
        score={score}
        testId={activeEntry.testId}
        version={activeEntry.version}
        topPadding={topPadding}
        onRestart={restart}
        onHome={goHome}
      />
    );
  }

  if (screen === 'list') {
    return (
      <ScrollView contentContainerStyle={[styles.screen, topPadding]}>
        <View style={styles.questionHeader}>
          <TouchableOpacity onPress={goHome}>
            <Text style={styles.ghost}>홈</Text>
          </TouchableOpacity>
          <Text style={styles.muted}>{entries.length}개</Text>
        </View>
        <Text style={styles.title}>전체 테스트</Text>
        <View style={styles.testList}>
          {entries.map((entry) => (
            <TouchableOpacity key={entry.testId} style={styles.card} onPress={() => startTest(entry)}>
              <Text style={styles.cardMeta}>
                {entry.questionCount}문항 · {entry.estimatedMinutes}
              </Text>
              <Text style={styles.cardTitle}>{entry.titleKo}</Text>
              {entry.summaryKo ? <Text style={styles.cardSummary}>{entry.summaryKo}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  const dailyEntry = pickDailyEntry(entries);
  const dailyTheme = dailyEntry ? getResultTheme(dailyEntry.testId) : DEFAULT_RESULT_THEME;

  return (
    <ScrollView contentContainerStyle={[styles.screen, topPadding]}>
      <Text style={styles.eyebrow}>Trait Test Hub</Text>
      <Text style={styles.title}>성향 테스트</Text>
      <Text style={styles.muted}>{entries.length}개의 테스트가 준비되어 있어요.</Text>
      {usingCachedFallback ? <Text style={styles.cacheNotice}>오프라인 저장본을 표시 중이에요.</Text> : null}

      {dailyEntry ? (
        <>
          <Text style={styles.sectionTitle}>오늘의 성향 테스트</Text>
          <TouchableOpacity
            style={[styles.heroCard, { backgroundColor: dailyTheme.background }]}
            onPress={() => startTest(dailyEntry)}
          >
            <Text style={styles.heroEmoji}>{dailyTheme.emoji}</Text>
            <Text style={[styles.heroTitle, { color: dailyTheme.foreground }]}>{dailyEntry.titleKo}</Text>
            {dailyEntry.summaryKo ? <Text style={styles.heroSummary}>{dailyEntry.summaryKo}</Text> : null}
            <Text style={styles.heroMeta}>
              {dailyEntry.questionCount}문항 · {dailyEntry.estimatedMinutes}
            </Text>
          </TouchableOpacity>
        </>
      ) : null}

      <TouchableOpacity style={styles.menuButton} onPress={startRandom}>
        <Text style={styles.menuEmoji}>🎲</Text>
        <View style={styles.menuTextWrap}>
          <Text style={styles.menuTitle}>랜덤 테스트</Text>
          <Text style={styles.menuDesc}>아무거나 하나 바로 시작해요</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={goList}>
        <Text style={styles.menuEmoji}>📚</Text>
        <View style={styles.menuTextWrap}>
          <Text style={styles.menuTitle}>전체 테스트 목록</Text>
          <Text style={styles.menuDesc}>{entries.length}개 전체 보기</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ResultView({
  test,
  score,
  testId,
  version,
  topPadding,
  onRestart,
  onHome,
}: {
  test: TraitTest;
  score: TraitScore;
  testId: string;
  version: number;
  topPadding: { paddingTop: number };
  onRestart: () => void;
  onHome: () => void;
}) {
  const result = score.result;
  const [rarityText, setRarityText] = useState<string>('아직 집계 중이에요');

  // 결과 화면 진입 시 완료 1건 기록 + 최신 분포로 희소성을 계산합니다.
  // 배포 전이면 recordCompletion이 null을 반환해 fallback 문구가 유지됩니다.
  useEffect(() => {
    let alive = true;
    // 완료 기록은 fire-and-forget(트리거가 집계). 분포는 test_stats를 공개 read.
    recordCompletion(testId, version, result.code);
    getStats(testId, version).then((distribution) => {
      if (!alive || !distribution) {
        return;
      }
      setRarityText(formatRarityKo(computeResultRarity(distribution, result.code)));
    });
    return () => {
      alive = false;
    };
  }, [testId, version, result.code]);

  const axisLabels: Record<string, string> = Object.fromEntries(
    test.axes.map((axis) => [axis.id, axis.labelKo ?? axis.id])
  );
  const abilityLabels: Record<string, string> = test.abilityLabelsKo ?? {};
  const resultTheme = getResultTheme(result.code);

  return (
    <ScrollView contentContainerStyle={[styles.screen, topPadding]}>
      <Text style={styles.eyebrow}>테스트 결과</Text>
      <View style={[styles.resultIdentity, { backgroundColor: resultTheme.background }]}>
        <Text style={styles.resultEmoji}>{resultTheme.emoji}</Text>
        <View style={styles.resultIdentityText}>
          <Text style={[styles.resultTitle, { color: resultTheme.foreground }]}>{result.titleKo}</Text>
          <Text style={styles.resultSummary}>{result.summaryKo}</Text>
        </View>
      </View>

      <View style={styles.rarityCard}>
        <Text style={styles.rarityLabel}>나와 같은 성향</Text>
        <Text style={styles.rarityValue}>{rarityText}</Text>
      </View>

      {result.descriptionKo ? <Text style={styles.body}>{result.descriptionKo}</Text> : null}

      <View style={styles.scoreList}>
        {Object.entries(score.totals).map(([axis, value]) => (
          <View key={axis} style={styles.scoreRow}>
            <Text style={styles.body}>{axisLabels[axis] ?? axis}</Text>
            <Text style={styles.scoreValue}>{formatScore(value)}</Text>
          </View>
        ))}
      </View>

      {result.abilities ? (
        <Section title="역량 힌트">
          {Object.entries(result.abilities).map(([code, value]) => (
            <View key={code} style={styles.abilityRow}>
              <Text style={styles.abilityLabel}>{abilityLabels[code] ?? code}</Text>
              <View style={styles.abilityTrack}>
                <View style={[styles.abilityFill, { width: `${value}%` }]} />
              </View>
            </View>
          ))}
        </Section>
      ) : null}

      <BulletSection title="강점" items={result.strengthsKo} />
      <BulletSection title="주의할 점" items={result.watchoutsKo} />

      {result.collaborationKo ? (
        <Section title="협업 팁">
          <Text style={styles.body}>{result.collaborationKo}</Text>
        </Section>
      ) : null}

      <PrimaryButton label="다시 하기" onPress={onRestart} />
      <TouchableOpacity style={styles.secondaryButton} onPress={onHome}>
        <Text style={styles.secondaryButtonText}>홈으로</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BulletSection({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) {
    return null;
  }
  return (
    <Section title={title}>
      {items.map((item, index) => (
        <Text key={index} style={styles.bullet}>
          · {item}
        </Text>
      ))}
    </Section>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatScore(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'white',
    gap: 12,
  },
  screen: {
    padding: 20,
    paddingBottom: 48,
    backgroundColor: 'white',
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600',
    color: BRAND,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#17202A',
  },
  muted: {
    fontSize: 14,
    color: '#5A6472',
  },
  cacheNotice: {
    fontSize: 13,
    color: '#7A5D1D',
    backgroundColor: '#FFF7DF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  body: {
    fontSize: 15,
    color: '#2D3640',
    lineHeight: 22,
  },
  testList: {
    gap: 12,
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E3E8EC',
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  cardMeta: {
    fontSize: 12,
    color: '#8A93A0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17202A',
  },
  cardSummary: {
    fontSize: 14,
    color: '#5A6472',
  },
  heroCard: {
    borderRadius: 18,
    padding: 20,
    gap: 6,
    marginTop: 4,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  heroSummary: {
    fontSize: 14,
    lineHeight: 20,
    color: '#46505C',
  },
  heroMeta: {
    fontSize: 12,
    color: '#6B7480',
    marginTop: 2,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E3E8EC',
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  menuEmoji: {
    fontSize: 26,
  },
  menuTextWrap: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#17202A',
  },
  menuDesc: {
    fontSize: 13,
    color: '#8A93A0',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ghost: {
    fontSize: 15,
    color: '#8A93A0',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EDF0F2',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND,
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#17202A',
    marginTop: 4,
  },
  options: {
    gap: 12,
    marginTop: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: '#E3E8EC',
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#17202A',
  },
  optionDesc: {
    fontSize: 13,
    color: '#5A6472',
  },
  rarityCard: {
    backgroundColor: '#EAF3F1',
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
    gap: 4,
  },
  rarityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C7A70',
  },
  rarityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND,
  },
  resultIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    padding: 18,
  },
  resultEmoji: {
    fontSize: 40,
  },
  resultIdentityText: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  resultSummary: {
    fontSize: 14,
    lineHeight: 20,
    color: '#46505C',
  },
  scoreList: {
    gap: 8,
    marginTop: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: '700',
    color: BRAND,
  },
  section: {
    gap: 6,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17202A',
  },
  bullet: {
    fontSize: 15,
    color: '#2D3640',
    lineHeight: 22,
  },
  abilityRow: {
    gap: 4,
    marginBottom: 8,
  },
  abilityLabel: {
    fontSize: 13,
    color: '#5A6472',
  },
  abilityTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EDF0F2',
    overflow: 'hidden',
  },
  abilityFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND,
  },
  primaryButton: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#5A6472',
    fontSize: 15,
    fontWeight: '600',
  },
});
