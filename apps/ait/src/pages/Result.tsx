import { useCallback, useEffect, useState } from 'react';
import {
  computeResultRarity,
  filterManifestEntries,
  formatRarityKo,
  type ManifestEntry,
  type ResultDistribution,
  type TraitScore,
  type TraitTest,
} from '@seorilabs/trait-test-core';
import { getResultTheme } from './Home';
import type { InterstitialAdPort } from '../lib/ads/interstitialPort';
import type { ShareOutcome, ShareResultPort } from '../lib/share/sharePort';

interface ResultProps {
  test: TraitTest;
  score: TraitScore;
  testId: string;
  version: number;
  activeEntry: ManifestEntry;
  entries: ManifestEntry[];
  onRestart: () => void;
  onHome: () => void;
  onStartSimilar: (entry: ManifestEntry) => void;
  sharePort: ShareResultPort;
  appDeepLink: string;
  shareOgImageUrl: string;
  interstitialAdPortFactory: (args: { adGroupId: string }) => InterstitialAdPort;
  resolveAdGroupId: () => string;
  recordCompletion: (testId: string, version: number, resultCode: string) => void;
  fetchStats: (testId: string, version: number) => Promise<ResultDistribution | null>;
}

function pickSimilarTests(
  activeEntry: ManifestEntry,
  allEntries: ManifestEntry[],
  limit = 3
): ManifestEntry[] {
  const filtered = filterManifestEntries(allEntries, { category: activeEntry.category });
  return filtered
    .filter((entry) => entry.testId !== activeEntry.testId)
    .slice(0, limit);
}

export function Result({
  test,
  score,
  testId,
  version,
  activeEntry,
  entries,
  onRestart,
  onHome,
  onStartSimilar,
  sharePort,
  appDeepLink,
  shareOgImageUrl,
  interstitialAdPortFactory,
  resolveAdGroupId,
  recordCompletion,
  fetchStats,
}: ResultProps) {
  const result = score.result;
  const [rarityText, setRarityText] = useState<string>('아직 집계 중이에요');
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'failed'>('idle');
  // 광고는 결과 화면 진입 시 자동으로 띄우지 않고 "비슷한 테스트 추천" CTA 탭으로만 노출한다.
  // 추천 카드 자체는 광고 시청 후에만 펼쳐진다 → CTA와 광고 노출 타이밍이 항상 일치.
  const [adState, setAdState] = useState<'idle' | 'showing' | 'done'>('idle');

  const onWatchAd = useCallback(async () => {
    if (adState !== 'idle') return;
    setAdState('showing');
    try {
      const port = interstitialAdPortFactory({ adGroupId: resolveAdGroupId() });
      await port.showInterstitial();
    } catch {
      // 광고 실패/미지원 환경은 CTA만 통과시켜 추천 카드를 노출한다.
    } finally {
      setAdState('done');
    }
  }, [adState, interstitialAdPortFactory, resolveAdGroupId]);

  const onShare = async () => {
    setShareState('sharing');
    const outcome: ShareOutcome = await sharePort.share({
      testTitle: test.titleKo,
      resultTitle: result.titleKo,
      resultSummary: result.summaryKo,
      deepLinkPath: appDeepLink,
      ogImageUrl: shareOgImageUrl,
    });
    setShareState(outcome === 'shared' ? 'idle' : 'failed');
  };

  // 결과 화면 진입 시 완료 1건 기록 + 최신 분포로 희소성을 계산.
  useEffect(() => {
    let alive = true;
    recordCompletion(testId, version, result.code);
    fetchStats(testId, version).then((distribution) => {
      if (!alive || !distribution) return;
      setRarityText(formatRarityKo(computeResultRarity(distribution, result.code)));
    });
    return () => {
      alive = false;
    };
  }, [testId, version, result.code, recordCompletion, fetchStats]);

  const axisLabels: Record<string, string> = Object.fromEntries(
    test.axes.map((axis) => [axis.id, axis.labelKo ?? axis.id])
  );
  const abilityLabels: Record<string, string> = test.abilityLabelsKo ?? {};
  const resultTheme = getResultTheme(result.code);

  const similarTests = pickSimilarTests(activeEntry, entries);

  return (
    <div style={pageStyle}>
      <nav style={navBarStyle}>
        <button type="button" style={navBackStyle} onClick={onHome}>
          ‹ 홈
        </button>
      </nav>

      <p style={eyebrowStyle}>테스트 결과</p>

      <div style={{ ...resultIdentityStyle, backgroundColor: resultTheme.background }}>
        <span style={resultEmojiStyle}>{resultTheme.emoji}</span>
        <div style={resultIdentityTextStyle}>
          <h2 style={{ ...resultTitleStyle, color: resultTheme.foreground }}>{result.titleKo}</h2>
          <p style={resultSummaryStyle}>{result.summaryKo}</p>
        </div>
      </div>

      <div style={rarityCardStyle}>
        <p style={rarityLabelStyle}>나와 같은 성향</p>
        <p style={rarityValueStyle}>{rarityText}</p>
      </div>

      {result.descriptionKo ? <p style={bodyStyle}>{result.descriptionKo}</p> : null}

      <ul style={scoreListStyle}>
        {Object.entries(score.totals).map(([axis, value]) => (
          <li key={axis} style={scoreRowStyle}>
            <span style={bodyStyle}>{axisLabels[axis] ?? axis}</span>
            <span style={scoreValueStyle}>{formatScore(value)}</span>
          </li>
        ))}
      </ul>

      {result.abilities ? (
        <Section title="역량 힌트">
          {Object.entries(result.abilities).map(([code, value]) => (
            <div key={code} style={abilityRowStyle}>
              <span style={abilityLabelStyle}>{abilityLabels[code] ?? code}</span>
              <div style={abilityTrackStyle}>
                <div style={{ ...abilityFillStyle, width: `${value}%` }} />
              </div>
            </div>
          ))}
        </Section>
      ) : null}

      <BulletSection title="강점" items={result.strengthsKo} />
      <BulletSection title="주의할 점" items={result.watchoutsKo} />

      {result.collaborationKo ? (
        <Section title="협업 팁">
          <p style={bodyStyle}>{result.collaborationKo}</p>
        </Section>
      ) : null}

      {similarTests.length > 0 ? (
        adState === 'done' ? (
          <Section title="비슷한 테스트 더 보기">
            <ul style={similarListStyle}>
              {similarTests.map((entry) => (
                <li key={entry.testId}>
                  <button type="button" style={similarCardStyle} onClick={() => onStartSimilar(entry)}>
                    <span style={similarCardMetaStyle}>
                      {entry.questionCount}문항 · {entry.estimatedMinutes}
                    </span>
                    <span style={similarCardTitleStyle}>{entry.titleKo}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        ) : (
          <section style={ctaSectionStyle} aria-label="광고 후 추천 안내">
            <h3 style={ctaTitleStyle}>비슷한 성향 테스트 추천</h3>
            <p style={ctaDescStyle}>
              같은 카테고리의 다른 테스트 {similarTests.length}개를 추천해 드려요. 짧은 광고 후
              바로 보여드릴게요.
            </p>
            <button
              type="button"
              style={ctaButtonStyle}
              onClick={() => void onWatchAd()}
              disabled={adState === 'showing'}
            >
              {adState === 'showing' ? '광고 준비 중…' : '▶ 광고 보고 추천 테스트 보기'}
            </button>
          </section>
        )
      ) : null}

      <button type="button" style={primaryButtonStyle} onClick={onShare}>
        {shareState === 'sharing' ? '공유 준비 중…' : '결과 공유하기'}
      </button>
      {shareState === 'failed' ? (
        <p style={shareErrorStyle}>공유를 시작하지 못했어요. 잠시 후 다시 시도해 주세요.</p>
      ) : null}

      <button type="button" style={secondaryButtonStyle} onClick={onRestart}>
        다시 하기
      </button>
      <button type="button" style={secondaryButtonStyle} onClick={onHome}>
        홈으로
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={sectionStyle}>
      <h3 style={sectionTitleStyle}>{title}</h3>
      {children}
    </section>
  );
}

function BulletSection({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <Section title={title}>
      {items.map((item, index) => (
        <p key={index} style={bulletStyle}>
          · {item}
        </p>
      ))}
    </Section>
  );
}

function formatScore(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

const BRAND = '#2F6F68';

const pageStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16,
  padding: '20px 20px 40px',
  backgroundColor: '#ffffff',
  color: '#1b1d1f',
  minHeight: '100vh',
  boxSizing: 'border-box' as const,
};

const navBarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const navBackStyle = {
  background: 'none',
  border: 'none',
  padding: '6px 0',
  fontSize: 15,
  color: BRAND,
  fontWeight: 600,
  cursor: 'pointer',
};

const eyebrowStyle = {
  margin: 0,
  fontSize: 13,
  color: '#6b7280',
  fontWeight: 500,
};

const resultIdentityStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
  padding: 20,
  borderRadius: 18,
};

const resultEmojiStyle = {
  fontSize: 40,
  lineHeight: 1,
};

const resultIdentityTextStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
  flex: 1,
  minWidth: 0,
};

const resultTitleStyle = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  lineHeight: 1.3,
};

const resultSummaryStyle = {
  margin: 0,
  fontSize: 14,
  color: '#3f4750',
  lineHeight: 1.5,
};

const rarityCardStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 4,
  padding: 18,
  borderRadius: 14,
  backgroundColor: '#F4F8F7',
  border: '1px solid #E0EAE7',
};

const rarityLabelStyle = {
  margin: 0,
  fontSize: 13,
  color: '#3f4750',
  fontWeight: 500,
};

const rarityValueStyle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: BRAND,
};

const bodyStyle = {
  margin: 0,
  fontSize: 15,
  color: '#3f4750',
  lineHeight: 1.6,
};

const scoreListStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
};

const scoreRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px',
  borderRadius: 12,
  backgroundColor: '#F7F8F9',
};

const scoreValueStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: BRAND,
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 600,
  color: '#1b1d1f',
};

const abilityRowStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
};

const abilityLabelStyle = {
  fontSize: 14,
  color: '#3f4750',
};

const abilityTrackStyle = {
  width: '100%',
  height: 8,
  backgroundColor: '#EAF3F1',
  borderRadius: 999,
  overflow: 'hidden' as const,
};

const abilityFillStyle = {
  height: '100%',
  backgroundColor: BRAND,
  borderRadius: 999,
};

const bulletStyle = {
  margin: 0,
  fontSize: 15,
  color: '#3f4750',
  lineHeight: 1.6,
};

const primaryButtonStyle = {
  padding: '14px 20px',
  backgroundColor: BRAND,
  color: '#ffffff',
  border: 'none',
  borderRadius: 14,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  padding: '12px 20px',
  backgroundColor: '#ffffff',
  color: BRAND,
  border: `1px solid ${BRAND}`,
  borderRadius: 14,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
};

const shareErrorStyle = {
  margin: 0,
  color: '#8C493C',
  fontSize: 13,
};

const similarListStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
};

const similarCardStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 4,
  width: '100%',
  padding: '14px 16px',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  textAlign: 'left' as const,
  cursor: 'pointer',
  boxSizing: 'border-box' as const,
};

const similarCardMetaStyle = {
  fontSize: 12,
  color: '#6b7280',
  fontWeight: 500,
};

const similarCardTitleStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: '#1b1d1f',
  lineHeight: 1.35,
};

const ctaSectionStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
  padding: 20,
  borderRadius: 16,
  border: `1px dashed ${BRAND}`,
  backgroundColor: '#F4F8F7',
};

const ctaTitleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 600,
  color: '#1b1d1f',
};

const ctaDescStyle = {
  margin: 0,
  fontSize: 14,
  color: '#3f4750',
  lineHeight: 1.55,
};

const ctaButtonStyle = {
  marginTop: 4,
  padding: '14px 18px',
  backgroundColor: BRAND,
  color: '#ffffff',
  border: 'none',
  borderRadius: 14,
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
};