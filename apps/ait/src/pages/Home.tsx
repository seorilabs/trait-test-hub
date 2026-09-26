import { useMemo } from 'react';
import {
  filterManifestEntries,
  sortManifestEntries,
  type ManifestEntry,
} from '@seorilabs/trait-test-core';

// 결과 테마(카테고리 무관하게 시드 기반으로 같은 testId면 같은 테마).
const DEFAULT_RESULT_THEME = { emoji: '🧭', background: '#EAF3F1', foreground: '#245C56' } as const;
const RESULT_THEMES = [
  DEFAULT_RESULT_THEME,
  { emoji: '✨', background: '#F4EEFF', foreground: '#62449A' },
  { emoji: '🌿', background: '#EEF5E8', foreground: '#456B35' },
  { emoji: '💡', background: '#FFF4D9', foreground: '#8A6418' },
  { emoji: '🌊', background: '#E8F3FA', foreground: '#2E6176' },
  { emoji: '🎯', background: '#FCECE8', foreground: '#8C493C' },
] as const;

export function getResultTheme(code: string) {
  let hash = 0;
  for (const character of code) {
    hash = (hash * 31 + character.codePointAt(0)!) >>> 0;
  }
  return RESULT_THEMES[hash % RESULT_THEMES.length] ?? DEFAULT_RESULT_THEME;
}

interface HomeProps {
  entries: ManifestEntry[];
  activeCategory: string;
  onChangeCategory: (next: string) => void;
  usingCachedFallback: boolean;
  onStart: (entry: ManifestEntry) => void;
  onStartRandom: () => void;
  onOpenList: () => void;
  pickDailyEntryFn: (entries: ManifestEntry[], nowMs?: number) => ManifestEntry | null;
  categoryOptions: Array<{ id: string; labelKo: string }>;
}

export function Home({
  entries,
  activeCategory,
  onChangeCategory,
  usingCachedFallback,
  onStart,
  onStartRandom,
  onOpenList,
  pickDailyEntryFn,
  categoryOptions,
}: HomeProps) {
  const categories = useMemo(() => {
    return [{ id: 'all', labelKo: '전체' }, ...categoryOptions.filter((c) => c.id !== 'all')];
  }, [categoryOptions]);

  const dailyEntry = pickDailyEntryFn(entries);
  const dailyTheme = dailyEntry ? getResultTheme(dailyEntry.testId) : DEFAULT_RESULT_THEME;

  const sections = useMemo(() => {
    const visible = activeCategory === 'all'
      ? categories.filter((c) => c.id !== 'all')
      : categories.filter((c) => c.id === activeCategory);

    return visible
      .map((cat) => {
        const filtered = filterManifestEntries(entries, { category: cat.id });
        const sorted = sortManifestEntries(filtered, 'featured');
        return { id: cat.id, labelKo: cat.labelKo, items: sorted };
      })
      .filter((section) => section.items.length > 0);
  }, [entries, activeCategory, categories]);

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>성향 테스트</h1>
        <p style={mutedStyle}>{entries.length}개의 테스트가 준비되어 있어요.</p>
        {usingCachedFallback ? <p style={cacheNoticeStyle}>오프라인 저장본을 표시 중이에요.</p> : null}
      </header>

      <nav aria-label="카테고리" style={chipBarStyle}>
        {categories.map((cat) => {
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChangeCategory(cat.id)}
              aria-pressed={isActive}
              style={isActive ? activeChipStyle : chipStyle}
            >
              {cat.labelKo}
            </button>
          );
        })}
      </nav>

      {dailyEntry ? (
        <section aria-label="오늘의 테스트" style={dailySectionStyle}>
          <h2 style={sectionTitleStyle}>오늘의 성향 테스트</h2>
          <button
            type="button"
            onClick={() => onStart(dailyEntry)}
            style={{ ...heroCardStyle, backgroundColor: dailyTheme.background }}
          >
            <span style={heroEmojiStyle}>{dailyTheme.emoji}</span>
            <span style={{ ...heroTitleStyle, color: dailyTheme.foreground }}>{dailyEntry.titleKo}</span>
            {dailyEntry.summaryKo ? <span style={heroSummaryStyle}>{dailyEntry.summaryKo}</span> : null}
            <span style={heroMetaStyle}>
              {dailyEntry.questionCount}문항 · {dailyEntry.estimatedMinutes}
            </span>
          </button>
        </section>
      ) : null}

      {sections.map((section) => (
        <section key={section.id} aria-label={`${section.labelKo} 카테고리`} style={categorySectionStyle}>
          <div style={categoryHeaderStyle}>
            <h2 style={sectionTitleStyle}>{section.labelKo}</h2>
            <span style={categoryCountStyle}>{section.items.length}개</span>
          </div>
          <ul style={cardListStyle}>
            {section.items.map((entry) => (
              <li key={entry.testId} style={cardListItemStyle}>
                <button type="button" style={cardStyle} onClick={() => onStart(entry)}>
                  <span style={cardMetaStyle}>
                    {entry.questionCount}문항 · {entry.estimatedMinutes}
                  </span>
                  <span style={cardTitleStyle}>{entry.titleKo}</span>
                  {entry.summaryKo ? <span style={cardSummaryStyle}>{entry.summaryKo}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div style={menuBarStyle}>
        <button type="button" style={menuButtonStyle} onClick={onStartRandom}>
          <span style={menuEmojiStyle}>🎲</span>
          <span style={menuTextWrapStyle}>
            <span style={menuTitleStyle}>랜덤 테스트</span>
            <span style={menuDescStyle}>아무거나 하나 바로 시작해요</span>
          </span>
        </button>
        <button type="button" style={menuButtonStyle} onClick={onOpenList}>
          <span style={menuEmojiStyle}>📚</span>
          <span style={menuTextWrapStyle}>
            <span style={menuTitleStyle}>전체 테스트 목록</span>
            <span style={menuDescStyle}>{entries.length}개 전체 보기</span>
          </span>
        </button>
      </div>
    </div>
  );
}

const BRAND = '#2F6F68';
const BRAND_SOFT = '#EAF3F1';

const pageStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 20,
  padding: '20px 20px 40px',
  backgroundColor: '#ffffff',
  color: '#1b1d1f',
  minHeight: '100vh',
  boxSizing: 'border-box' as const,
};

const headerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
};

const titleStyle = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  color: '#1b1d1f',
};

const mutedStyle = {
  margin: 0,
  color: '#6b7280',
  fontSize: 14,
};

const cacheNoticeStyle = {
  margin: 0,
  color: BRAND,
  fontSize: 13,
  fontWeight: 500,
};

const chipBarStyle = {
  display: 'flex',
  gap: 8,
  overflowX: 'auto' as const,
  paddingBottom: 4,
  marginRight: -20,
  paddingRight: 20,
};

const chipStyle = {
  flex: '0 0 auto',
  padding: '8px 14px',
  borderRadius: 999,
  border: `1px solid ${BRAND_SOFT}`,
  backgroundColor: '#ffffff',
  color: BRAND,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
};

const activeChipStyle = {
  ...chipStyle,
  backgroundColor: BRAND,
  color: '#ffffff',
  border: `1px solid ${BRAND}`,
};

const dailySectionStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 12,
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 600,
  color: '#1b1d1f',
};

const heroCardStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  gap: 8,
  padding: 20,
  borderRadius: 18,
  border: 'none',
  textAlign: 'left' as const,
  cursor: 'pointer',
};

const heroEmojiStyle = {
  fontSize: 36,
  lineHeight: 1,
};

const heroTitleStyle = {
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1.3,
};

const heroSummaryStyle = {
  fontSize: 14,
  color: '#3f4750',
  lineHeight: 1.5,
};

const heroMetaStyle = {
  fontSize: 12,
  color: '#5f6772',
};

const categorySectionStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 12,
};

const categoryHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const categoryCountStyle = {
  fontSize: 13,
  color: '#6b7280',
  fontWeight: 500,
};

const cardListStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
};

const cardListItemStyle = {
  display: 'block',
};

const cardStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
  width: '100%',
  padding: '16px 18px',
  borderRadius: 14,
  border: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  textAlign: 'left' as const,
  cursor: 'pointer',
  boxSizing: 'border-box' as const,
};

const cardMetaStyle = {
  fontSize: 12,
  color: '#6b7280',
  fontWeight: 500,
};

const cardTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: '#1b1d1f',
  lineHeight: 1.3,
};

const cardSummaryStyle = {
  fontSize: 13,
  color: '#3f4750',
  lineHeight: 1.5,
};

const menuBarStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
  marginTop: 8,
};

const menuButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '16px 18px',
  borderRadius: 14,
  border: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  textAlign: 'left' as const,
  cursor: 'pointer',
};

const menuEmojiStyle = {
  fontSize: 24,
};

const menuTextWrapStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 2,
};

const menuTitleStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: '#1b1d1f',
};

const menuDescStyle = {
  fontSize: 13,
  color: '#6b7280',
};