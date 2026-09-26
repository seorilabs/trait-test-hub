import type { Question as TraitQuestion, TraitTest } from '@seorilabs/trait-test-core';

type Screen = 'home' | 'list' | 'question' | 'result';

interface QuestionProps {
  test: TraitTest;
  question: TraitQuestion;
  currentIndex: number;
  total: number;
  returnTo: Screen;
  onAnswer: (code: string) => void;
  onBack: () => void;
  onHome: () => void;
}

export function Question({
  test,
  question,
  currentIndex,
  total,
  returnTo,
  onAnswer,
  onBack,
  onHome,
}: QuestionProps) {
  const progress = Math.round(((currentIndex + 1) / total) * 100);
  const atStart = currentIndex === 0;
  const backLabel = atStart ? (returnTo === 'list' ? '목록' : '홈') : '이전';
  const showHome = !(atStart && returnTo === 'home');

  return (
    <div style={pageStyle}>
      <nav style={navBarStyle}>
        <button type="button" style={navBackStyle} onClick={onBack}>
          ‹ {backLabel}
        </button>
        <div style={navRightStyle}>
          <span style={metaStyle}>
            {currentIndex + 1} / {total}
          </span>
          {showHome ? (
            <button type="button" style={navHomeStyle} onClick={onHome}>
              홈
            </button>
          ) : null}
        </div>
      </nav>

      <div style={progressTrackStyle}>
        <div style={{ ...progressFillStyle, width: `${progress}%` }} />
      </div>

      <p style={eyebrowStyle}>{test.titleKo}</p>
      <h2 style={questionStyle}>{question.textKo}</h2>

      <div style={optionsStyle}>
        {question.options.map((option) => (
          <button
            key={option.code}
            type="button"
            style={optionStyle}
            onClick={() => onAnswer(option.code)}
          >
            <span style={optionTitleStyle}>{option.textKo}</span>
            {option.descriptionKo ? <span style={optionDescStyle}>{option.descriptionKo}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
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

const navRightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const metaStyle = {
  fontSize: 13,
  color: '#6b7280',
};

const navHomeStyle = {
  background: 'none',
  border: 'none',
  padding: '6px 0',
  fontSize: 15,
  color: BRAND,
  fontWeight: 600,
  cursor: 'pointer',
};

const progressTrackStyle = {
  width: '100%',
  height: 6,
  backgroundColor: '#EAF3F1',
  borderRadius: 999,
  overflow: 'hidden' as const,
};

const progressFillStyle = {
  height: '100%',
  backgroundColor: BRAND,
  borderRadius: 999,
  transition: 'width 0.2s ease',
};

const eyebrowStyle = {
  margin: 0,
  fontSize: 13,
  color: '#6b7280',
  fontWeight: 500,
};

const questionStyle = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
  lineHeight: 1.35,
  color: '#1b1d1f',
};

const optionsStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
};

const optionStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 4,
  padding: '16px 18px',
  borderRadius: 14,
  border: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  textAlign: 'left' as const,
  cursor: 'pointer',
  boxSizing: 'border-box' as const,
};

const optionTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: '#1b1d1f',
  lineHeight: 1.35,
};

const optionDescStyle = {
  fontSize: 13,
  color: '#3f4750',
  lineHeight: 1.5,
};