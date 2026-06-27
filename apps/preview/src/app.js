import {
  computeResultRarity,
  filterManifestEntries,
  formatRarityKo,
  scoreTraitTest,
  sortManifestEntries,
  validateManifest,
  validateTraitTest,
} from '/packages/product-core/src/index.js';

const state = {
  status: 'loading',
  error: null,
  manifest: null,
  entries: [],
  selectedEntry: null,
  screen: 'home',
  test: null,
  testCache: new Map(),
  answers: {},
  currentIndex: 0,
  score: null,
  rarityText: '아직 집계 중이에요',
  searchOpen: false,
  filters: {
    category: 'all',
    tag: 'all',
    sort: 'featured',
    search: '',
  },
};

const app = document.querySelector('#app');
const MANIFEST_URL = '/test-packs/manifest.json';
// firestore REST API로 직접 접근(공개 apiKey). org 정책상 함수 직접 호출이 막혀,
// 완료 기록은 completions에 write(트리거가 test_stats로 집계)하고, 분포는 test_stats를 공개 read한다.
const API_KEY = 'AIzaSyAsnTm_vGStpsD7R1Qxop-8FZnFPHrCcmk';
const DOCS_BASE = 'https://firestore.googleapis.com/v1/projects/trait-test-hub/databases/(default)/documents';

// 완료 1건을 completions 큐에 기록한다(트리거가 집계). 실패는 조용히 무시.
async function recordCompletion(testId, version, resultCode) {
  try {
    await fetch(`${DOCS_BASE}/completions?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          testId: { stringValue: testId },
          version: { integerValue: String(version) },
          resultCode: { stringValue: resultCode },
        },
      }),
    });
  } catch {
    // 네트워크/권한 실패는 무시 — 화면은 fallback 문구를 유지한다.
  }
}

// test_stats 분포를 공개 read한다. 문서가 없으면 빈 분포.
async function readStats(testId, version) {
  try {
    const versionKey = encodeURIComponent(`${testId}@${version}`);
    const response = await fetch(`${DOCS_BASE}/test_stats/${versionKey}?key=${API_KEY}`);
    if (response.status === 404) {
      return { total: 0, counts: {} };
    }
    if (!response.ok) {
      return null;
    }
    const docData = await response.json();
    const fields = docData.fields ?? {};
    const total = Number(fields.total?.integerValue ?? 0);
    const countFields = fields.counts?.mapValue?.fields ?? {};
    const counts = {};
    for (const [code, value] of Object.entries(countFields)) {
      counts[code] = Number(value.integerValue ?? 0);
    }
    return { total, counts };
  } catch {
    return null;
  }
}

async function requestRarity() {
  const entry = state.selectedEntry;
  const code = state.score?.result?.code;
  if (!entry || !code) {
    return;
  }
  // 완료 기록은 fire-and-forget. 본인 1건은 트리거 집계 후 다음 조회부터 반영된다.
  recordCompletion(entry.testId, entry.version, code);
  const distribution = await readStats(entry.testId, entry.version);
  if (!distribution || state.screen !== 'result') {
    return;
  }
  state.rarityText = formatRarityKo(computeResultRarity(distribution, code));
  render();
}

loadManifest();

function render() {
  if (state.status === 'loading') {
    renderLoading();
    return;
  }
  if (state.status === 'error') {
    renderError();
    return;
  }
  if (state.screen === 'home') {
    renderHome();
    return;
  }
  if (state.screen === 'question') {
    renderQuestion();
    return;
  }
  renderResult();
}

async function loadManifest() {
  try {
    const manifest = validateManifest(await fetchJson(MANIFEST_URL));
    const entries = manifest.tests.filter((entry) => entry.status === 'published');
    state.status = 'ready';
    state.manifest = manifest;
    state.entries = entries;
    state.selectedEntry = null;
    render();
  } catch (error) {
    state.status = 'error';
    state.error = error;
    render();
  }
}

function renderLoading() {
  app.innerHTML = `
    <section class="shell compact">
      <section class="result">
        <p class="eyebrow">Trait Test Hub</p>
        <h1>테스트팩을 불러오는 중</h1>
        <p>manifest를 확인하고 테스트 목록을 준비하고 있습니다.</p>
      </section>
    </section>
  `;
}

function renderError() {
  app.innerHTML = `
    <section class="shell compact">
      <section class="result">
        <p class="eyebrow">Trait Test Hub</p>
        <h1>테스트팩을 불러오지 못했습니다</h1>
        <p>${state.error?.message ?? '알 수 없는 오류가 발생했습니다.'}</p>
        <button class="primary" data-action="reload-manifest">다시 시도</button>
      </section>
    </section>
  `;
}

function renderHome() {
  const visibleEntries = getVisibleEntries();
  const entry = visibleEntries.find((candidate) => candidate.testId === state.selectedEntry?.testId) ?? null;
  state.selectedEntry = entry;

  if (!entry) {
    app.innerHTML = `
      <section class="shell app-shell">
        ${renderTopbar(visibleEntries.length)}
        ${state.searchOpen ? renderFilters(visibleEntries) : ''}
        ${
          visibleEntries.length === 0
            ? `<section class="empty-state">
          <p class="eyebrow">검색 결과</p>
          <h1>조건에 맞는 테스트가 없습니다</h1>
          <p>필터를 바꾸거나 검색어를 지워 다시 확인하세요.</p>
        </section>`
            : `<section class="test-list" aria-label="테스트 목록">
          ${visibleEntries.map((candidate) => renderTestCard(candidate, entry)).join('')}
        </section>`
        }
      </section>
    `;
    return;
  }

  app.innerHTML = `
    <section class="shell app-shell">
      ${renderTopbar(visibleEntries.length)}
      ${state.searchOpen ? renderFilters(visibleEntries) : ''}
      <section class="test-list" aria-label="테스트 목록">
        ${visibleEntries.map((candidate) => renderTestCard(candidate, entry)).join('')}
      </section>
    </section>
  `;
}

function renderTopbar(visibleCount = state.entries.length) {
  const label = state.searchOpen ? '검색 닫기' : '검색';
  return `
    <header class="topbar">
      <div class="title-copy">
        <h1>성향 테스트</h1>
        <p>${visibleCount}개 표시</p>
      </div>
      <button class="search-toggle ${state.searchOpen ? 'active' : ''}" data-action="toggle-search" aria-pressed="${state.searchOpen}">
        ${label}
      </button>
    </header>
  `;
}

function renderFilters(visibleEntries) {
  const { filters } = state.manifest;
  return `
    <section class="filter-panel" aria-label="테스트 필터">
      <label class="search">
        <span>검색</span>
        <input type="search" value="${escapeAttr(state.filters.search)}" placeholder="테스트명, 태그 검색" data-action="search" />
      </label>

      <div class="filter-row" role="group" aria-label="카테고리">
        ${renderSegment('category', 'all', '전체')}
        ${filters.categories.map((category) => renderSegment('category', category.id, category.labelKo)).join('')}
      </div>

      <div class="filter-row tag-row" role="group" aria-label="태그">
        ${renderSegment('tag', 'all', '모든 태그')}
        ${filters.tags.map((tag) => renderSegment('tag', tag.id, tag.labelKo)).join('')}
      </div>

      <div class="sort-row">
        <label>
          <span>정렬</span>
          <select data-action="sort">
            ${filters.sortOptions
              .map(
                (option) => `
                  <option value="${option.id}" ${state.filters.sort === option.id ? 'selected' : ''}>${option.labelKo}</option>
                `,
              )
              .join('')}
          </select>
        </label>
        <span>${visibleEntries.length}개 표시</span>
      </div>
    </section>
  `;
}

function renderSegment(kind, value, label) {
  const active = state.filters[kind] === value;
  return `
    <button class="segment ${active ? 'active' : ''}" data-action="filter" data-filter-kind="${kind}" data-filter-value="${value}">
      ${label}
    </button>
  `;
}

function renderTestCard(candidate, activeEntry) {
  const expanded = candidate.testId === activeEntry?.testId;
  return `
    <article class="test-card ${expanded ? 'active' : ''}">
      <button class="test-row" data-action="select-test" data-test-id="${candidate.testId}" aria-expanded="${expanded}">
        <span class="test-title">
          <small>${getCategoryLabel(candidate.category)}</small>
          <strong>${candidate.titleKo}</strong>
        </span>
        <span class="test-meta">${candidate.questionCount}문항 · ${candidate.estimatedMinutes}</span>
      </button>
      ${
        expanded
          ? `<div class="test-detail">
        <p>${candidate.summaryKo ?? '짧은 질문에 답하고 내 성향이 어떤 방식에 가까운지 확인합니다.'}</p>
        <div class="detail-metrics" aria-label="테스트 정보">
          <span>${candidate.questionCount}문항</span>
          <span>${candidate.resultCount}개 결과</span>
          <span>${candidate.stats.versionKey}</span>
        </div>
        <button class="primary compact-button" data-action="start" data-test-id="${candidate.testId}">시작</button>
      </div>`
          : ''
      }
    </article>
  `;
}

function renderQuestion() {
  const test = state.test;
  const question = test.questions[state.currentIndex];
  const progress = Math.round(((state.currentIndex + 1) / test.questions.length) * 100);

  app.innerHTML = `
    <section class="shell compact">
      <header class="question-header">
        <button class="ghost" data-action="back">뒤로</button>
        <span>${state.currentIndex + 1} / ${test.questions.length}</span>
      </header>

      <div class="progress" aria-label="진행률">
        <span style="width: ${progress}%"></span>
      </div>

      <section class="question">
        <p class="eyebrow">${test.titleKo}</p>
        <h2>${question.textKo}</h2>
        <div class="options">
          ${question.options
            .map(
              (option) => `
                <button class="option" data-action="answer" data-code="${option.code}">
                  <strong>${option.textKo}</strong>
                  ${option.descriptionKo ? `<span>${option.descriptionKo}</span>` : ''}
                </button>
              `,
            )
            .join('')}
        </div>
      </section>
    </section>
  `;
}

function renderResult() {
  const result = state.score.result;
  const axisLabels = Object.fromEntries(state.test.axes.map((axis) => [axis.id, axis.labelKo ?? axis.id]));
  const totals = Object.entries(state.score.totals)
    .map(([axis, value]) => `<li><span>${axisLabels[axis] ?? axis}</span><strong>${formatScore(value)}</strong></li>`)
    .join('');
  const strengths = renderList('강점', result.strengthsKo);
  const watchouts = renderList('주의할 점', result.watchoutsKo);
  const abilities = renderAbilities(result.abilities, state.test.abilityLabelsKo);

  app.innerHTML = `
    <section class="shell compact">
      <section class="result">
        <p class="eyebrow">테스트 결과</p>
        <h1>${result.titleKo}</h1>
        <p>${result.summaryKo}</p>
        <div style="background:#EAF3F1;border-radius:14px;padding:16px;margin:12px 0;display:flex;flex-direction:column;gap:4px;">
          <span style="font-size:13px;color:#3C7A70;font-weight:600;">나와 같은 성향</span>
          <strong style="font-size:18px;color:#2F6F68;">${state.rarityText ?? '아직 집계 중이에요'}</strong>
        </div>
        ${result.imagePath ? `<img class="result-image" src="${result.imagePath}" alt="${result.titleKo} 이미지" />` : ''}
        ${result.descriptionKo ? `<p>${result.descriptionKo}</p>` : ''}
        <ul class="score-list">${totals}</ul>
        ${abilities}
        ${strengths}
        ${watchouts}
        ${result.collaborationKo ? `<section class="result-note"><h2>협업 팁</h2><p>${result.collaborationKo}</p></section>` : ''}
        <div class="actions">
          <button class="primary" data-action="restart">다시 하기</button>
          <button class="secondary" data-action="home">홈</button>
        </div>
      </section>
    </section>
  `;
}

function renderList(title, items) {
  if (!items?.length) {
    return '';
  }
  return `
    <section class="result-note">
      <h2>${title}</h2>
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderAbilities(abilities, labels = {}) {
  if (!abilities) {
    return '';
  }
  return `
    <section class="result-note">
      <h2>역량 힌트</h2>
      <div class="ability-list">
        ${Object.entries(abilities)
          .map(
            ([code, value]) => `
              <div class="ability">
                <span>${labels[code] ?? code}</span>
                <strong>${value}</strong>
                <i style="width: ${value}%"></i>
              </div>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function formatScore(value) {
  if (value > 0) {
    return `+${value}`;
  }
  return String(value);
}

app.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) {
    return;
  }

  const action = target.dataset.action;
  if (action === 'toggle-search') {
    state.searchOpen = !state.searchOpen;
    render();
    if (state.searchOpen) {
      focusSearchInput();
    }
    return;
  }

  if (action === 'reload-manifest') {
    state.status = 'loading';
    state.error = null;
    render();
    loadManifest();
    return;
  }

  if (action === 'filter') {
    state.filters[target.dataset.filterKind] = target.dataset.filterValue;
    state.selectedEntry = null;
    render();
    return;
  }

  if (action === 'sort') {
    state.filters.sort = target.value;
    state.selectedEntry = null;
    render();
    return;
  }

  if (action === 'search') {
    return;
  }

  if (action === 'select-test') {
    const selected = state.entries.find((candidate) => candidate.testId === target.dataset.testId);
    if (selected) {
      state.selectedEntry = state.selectedEntry?.testId === selected.testId ? null : selected;
      state.test = null;
      state.answers = {};
      state.currentIndex = 0;
      state.score = null;
      state.screen = 'home';
    }
  }

  if (action === 'start') {
    const selected = state.entries.find((candidate) => candidate.testId === target.dataset.testId);
    if (selected) {
      state.selectedEntry = selected;
    }
    startSelectedTest();
    return;
  }

  if (action === 'back') {
    if (state.currentIndex === 0) {
      state.screen = 'home';
    } else {
      state.currentIndex -= 1;
    }
  }

  if (action === 'answer') {
    const question = state.test.questions[state.currentIndex];
    state.answers[question.id] = target.dataset.code;
    if (state.currentIndex < state.test.questions.length - 1) {
      state.currentIndex += 1;
    } else {
      state.score = scoreTraitTest(state.test, state.answers);
      state.rarityText = '아직 집계 중이에요';
      state.screen = 'result';
      requestRarity();
    }
  }

  if (action === 'restart') {
    state.answers = {};
    state.currentIndex = 0;
    state.score = null;
    state.rarityText = '아직 집계 중이에요';
    state.screen = 'question';
  }

  if (action === 'home') {
    state.screen = 'home';
  }

  render();
});

app.addEventListener('input', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target || target.dataset.action !== 'search') {
    return;
  }
  state.filters.search = target.value;
  state.selectedEntry = null;
  render();
  focusSearchInput();
});

app.addEventListener('change', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target || target.dataset.action !== 'sort') {
    return;
  }
  state.filters.sort = target.value;
  state.selectedEntry = null;
  render();
});

render();

async function startSelectedTest() {
  if (!state.selectedEntry) {
    return;
  }
  try {
    state.test = await loadTest(state.selectedEntry);
    state.answers = {};
    state.currentIndex = 0;
    state.score = null;
    state.screen = 'question';
    render();
  } catch (error) {
    state.status = 'error';
    state.error = error;
    render();
  }
}

async function loadTest(entry) {
  const key = `${entry.testId}@${entry.version}`;
  if (state.testCache.has(key)) {
    return state.testCache.get(key);
  }
  const payload = await fetchJson(entry.path);
  if (payload.schemaVersion !== 1 || !payload.test) {
    throw new Error(`Invalid test payload: ${entry.path}`);
  }
  const test = validateTraitTest(payload.test);
  state.testCache.set(key, test);
  return test;
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${path}`);
  }
  return response.json();
}

function getVisibleEntries() {
  return sortManifestEntries(filterManifestEntries(state.entries, state.filters), state.filters.sort);
}

function getCategoryLabel(categoryId) {
  return state.manifest.filters.categories.find((category) => category.id === categoryId)?.labelKo ?? categoryId;
}

function escapeAttr(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function focusSearchInput() {
  const input = app.querySelector('[data-action="search"]');
  if (!input) {
    return;
  }
  input.focus();
  const end = input.value.length;
  input.setSelectionRange(end, end);
}
