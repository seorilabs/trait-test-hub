import { useMemo } from 'react';
import {
  filterManifestEntries,
  type ManifestEntry,
} from '@seorilabs/trait-test-core';

interface ListProps {
  entries: ManifestEntry[];
  categoryOptions: Array<{ id: string; labelKo: string }>;
  activeCategory: string;
  onChangeCategory: (next: string) => void;
  onBack: () => void;
  onStart: (entry: ManifestEntry) => void;
}

export function List({
  entries,
  categoryOptions,
  activeCategory,
  onChangeCategory,
  onBack,
  onStart,
}: ListProps) {
  const categories = useMemo(
    () => [{ id: 'all', labelKo: '전체' }, ...categoryOptions.filter((c) => c.id !== 'all')],
    [categoryOptions]
  );

  const filtered = useMemo(
    () =>
      filterManifestEntries(entries, {
        category: activeCategory === 'all' ? undefined : activeCategory,
      }),
    [entries, activeCategory]
  );

  return (
    <div style={pageStyle}>
      <nav style={navBarStyle}>
        <button type="button" style={navBackStyle} onClick={onBack}>
          ‹ 홈
        </button>
        <span style={navMetaStyle}>{filtered.length}개</span>
      </nav>

      <h1 style={titleStyle}>전체 테스트</h1>

      <nav aria-label="카테고리 필터" style={chipBarStyle}>
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

      {filtered.length === 0 ? (
        <p style={emptyStyle}>해당 카테고리에 등록된 테스트가 없어요.</p>
      ) : (
        <ul style={cardListStyle}>
          {filtered.map((entry) => (
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
      )}
    </div>
  );
}

const BRAND = '#2F6F68';
const BRAND_SOFT = '#EAF3F1';

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

const navMetaStyle = {
  fontSize: 13,
  color: '#6b7280',
};

const titleStyle = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
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

const emptyStyle = {
  margin: 0,
  color: '#6b7280',
  fontSize: 14,
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