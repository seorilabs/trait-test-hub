import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SITE_URL = 'https://traithub.vzyx.xyz';
const OG_IMAGE = `${SITE_URL}/public/share-og.png`;
const SITE_NAME = '성향 테스트 허브';
const SITE_DESCRIPTION = '일상, 관계, 업무 상황의 짧은 질문으로 나와 가까운 성향을 확인해 보세요.';

export function buildSeoPages({ outputRoot, manifest }) {
  const published = manifest.tests.filter((entry) => entry.status === 'published');
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: manifest.generatedAt, changefreq: 'weekly', priority: '1.0', image: true },
    ...published.map((entry) => ({
      loc: `${SITE_URL}/tests/${entry.testId}/`,
      lastmod: entry.updatedAt ?? entry.publishedAt ?? manifest.generatedAt,
      changefreq: 'monthly',
      priority: '0.8',
      image: true,
    })),
  ];

  writeText(join(outputRoot, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  writeText(join(outputRoot, 'sitemap.xml'), renderSitemap(urls));

  for (const entry of published) {
    const payloadPath = join(outputRoot, entry.path.replace(/^\//, ''));
    const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
    writeText(join(outputRoot, 'tests', entry.testId, 'index.html'), renderTestLanding({ entry, test: payload.test }));
  }
}

function renderTestLanding({ entry, test }) {
  const url = `${SITE_URL}/tests/${entry.testId}/`;
  const description = `${entry.summaryKo ?? ''} ${entry.questionCount}문항, 약 ${entry.estimatedMinutes} 소요.`.trim();
  const resultPreview = test.results
    .slice(0, 6)
    .map((result) => `<li><strong>${escapeHtml(result.titleKo)}</strong>${result.summaryKo ? ` — ${escapeHtml(result.summaryKo)}` : ''}</li>`)
    .join('');
  const moreResults = test.results.length > 6 ? `<p class="muted">이 외 ${test.results.length - 6}개의 결과 유형이 있습니다.</p>` : '';

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: entry.titleKo,
    description,
    url,
    inLanguage: 'ko-KR',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE },
    datePublished: entry.publishedAt,
    dateModified: entry.updatedAt ?? entry.publishedAt,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: entry.titleKo, item: url },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${entry.titleKo} 결과 유형`,
    numberOfItems: test.results.length,
    itemListElement: test.results.map((result, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: result.titleKo,
      description: result.summaryKo,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${entry.titleKo}는 어떤 테스트인가요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${entry.summaryKo ?? ''} ${entry.questionCount}개의 짧은 문항으로 구성됐고 약 ${entry.estimatedMinutes} 정도면 결과를 확인할 수 있어요.`.trim(),
        },
      },
      {
        '@type': 'Question',
        name: '결과는 진단이나 상담을 대신하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '아니요. 진단이나 전문 상담을 대체하지 않는 가벼운 자기 탐색용 콘텐츠입니다.',
        },
      },
    ],
  };

  const ldJson = [webPageSchema, breadcrumbSchema, itemListSchema, faqSchema]
    .map((schema) => JSON.stringify(schema).replaceAll('<', '\\u003c'))
    .join('\n');

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index,follow" />
    <title>${escapeHtml(entry.titleKo)} | ${escapeHtml(SITE_NAME)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />
    <meta property="og:title" content="${escapeAttr(entry.titleKo)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:locale" content="ko_KR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(entry.titleKo)} | ${escapeAttr(SITE_NAME)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
${ldJson
  .split('\n')
  .map((block) => `    <script type="application/ld+json">${block}</script>`)
  .join('\n')}
    <style>
      :root { color-scheme: light; --ink: #19211f; --muted: #68736f; --line: #d9e1dd; --panel: #fff; --primary: #2f6f68; --soft: #edf5f2; }
      * { box-sizing: border-box; } body { margin: 0; background: #f8faf7; color: var(--ink); font: 16px/1.6 Inter, system-ui, sans-serif; }
      main { width: min(100% - 32px, 720px); margin: 0 auto; padding: 36px 0 56px; } .eyebrow { color: var(--primary); font-weight: 800; font-size: 14px; }
      h1 { font-size: clamp(30px, 6vw, 44px); line-height: 1.2; margin: 8px 0 14px; } h2 { margin-top: 32px; font-size: 22px; } p { margin: 0 0 14px; }
      .card { padding: 20px; border: 1px solid var(--line); border-radius: 16px; background: var(--panel); } .meta { display: flex; gap: 8px; flex-wrap: wrap; margin: 18px 0; }
      .meta span { padding: 4px 10px; border-radius: 999px; background: var(--soft); color: var(--primary); font-size: 14px; font-weight: 700; } .cta { display: inline-block; padding: 14px 20px; border-radius: 10px; background: var(--primary); color: white; font-weight: 800; text-decoration: none; }
      ul { padding-left: 20px; } .muted, footer { color: var(--muted); font-size: 14px; } footer { margin-top: 40px; } footer a { color: inherit; }
      nav.crumbs { font-size: 13px; color: var(--muted); margin: 0 0 12px; } nav.crumbs a { color: inherit; }
    </style>
  </head>
  <body>
    <main>
      <nav class="crumbs" aria-label="breadcrumb"><a href="/">${escapeHtml(SITE_NAME)}</a> · ${escapeHtml(entry.titleKo)}</nav>
      <p class="eyebrow">${escapeHtml(SITE_NAME)}</p>
      <h1>${escapeHtml(entry.titleKo)}</h1>
      <p>${escapeHtml(entry.summaryKo ?? '짧은 질문에 답하고 나와 가까운 성향을 확인해 보세요.')}</p>
      <div class="meta"><span>${entry.questionCount}문항</span><span>${escapeHtml(entry.estimatedMinutes ?? '짧은 시간')}</span><span>${test.results.length}개 결과 유형</span></div>
      <a class="cta" href="/?test=${encodeURIComponent(entry.testId)}">테스트 시작하기</a>
      <section class="card" aria-label="테스트 안내">
        <h2>이 테스트에서 확인하는 점</h2>
        <p>각 질문에서 지금의 나와 가장 가까운 선택지를 고르면 결과 유형과 성향 힌트를 확인할 수 있어요. 진단이나 전문 상담을 대체하지 않는 가벼운 자기 탐색용 콘텐츠입니다.</p>
      </section>
      <section>
        <h2>결과 유형 미리 보기</h2>
        <ul>${resultPreview}</ul>${moreResults}
      </section>
      <footer><a href="/">다른 성향 테스트 보기</a></footer>
    </main>
  </body>
</html>`;
}

function renderSitemap(urls) {
  const items = urls
    .map(({ loc, lastmod, changefreq, priority, image }) => {
      const lastmodTag = `    <lastmod>${formatLastmod(lastmod)}</lastmod>`;
      const changefreqTag = `    <changefreq>${changefreq}</changefreq>`;
      const priorityTag = `    <priority>${priority}</priority>`;
      const imageTag = image
        ? `    <image:image>
      <image:loc>${OG_IMAGE}</image:loc>
      <image:title>${escapeXml(SITE_NAME)}</image:title>
      <image:caption>${escapeXml(SITE_DESCRIPTION)}</image:caption>
    </image:image>`
        : '';
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
${lastmodTag}
${changefreqTag}
${priorityTag}
${imageTag}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${items}
</urlset>
`;
}

// ISO 8601 with timezone. manifest timestamps는 UTC ISO 또는 date-only일 수 있어 둘 다 정규화한다.
function formatLastmod(value) {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00+09:00`;
  }
  return new Date(value).toISOString();
}

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function writeText(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('\n', ' ');
}