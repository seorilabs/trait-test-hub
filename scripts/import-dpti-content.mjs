import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { Script } from 'node:vm';

const root = process.cwd();
const dptiRoot = resolve(root, '../dpti-app');
const require = createRequire(import.meta.url);
const ts = require(join(dptiRoot, 'node_modules/typescript/lib/typescript.js'));
const dptiSource = join(dptiRoot, 'src/dpti.ts');
const outputFile = join(root, 'packages/product-core/src/dptiCatalog.js');

const source = readFileSync(dptiSource, 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const module = { exports: {} };
new Script(transpiled, { filename: dptiSource }).runInNewContext({
  exports: module.exports,
  module,
  console,
});

const {
  ABILITY_LABELS,
  AXES,
  QUESTIONS,
  RESULT_CODES,
  RESULTS,
} = module.exports;

const letterLabelsKo = {
  A: '독립',
  T: '협업',
  C: '창의',
  P: '실용',
  L: '논리',
  E: '공감',
  O: '계획',
  F: '유연',
};

const resultVector = (code) =>
  Object.fromEntries(
    AXES.map((axis, index) => [axis.key, code[index] === axis.letters[0] ? 1 : -1]),
  );

const dptiTraitTest = {
  id: 'dpti',
  version: 1,
  status: 'published',
  titleKo: 'DPTI 개발자 성향 테스트',
  category: 'work',
  estimatedMinutes: '3-5분',
  questionCount: QUESTIONS.length,
  resultCount: RESULT_CODES.length,
  source: {
    appId: 'dpti-app',
    file: 'src/dpti.ts',
    importedAt: new Date().toISOString().slice(0, 10),
  },
  scoring: {
    type: 'axis-letter-majority',
  },
  axes: AXES.map((axis) => ({
    id: axis.key,
    labelKo: axis.label,
    shortLabelKo: axis.shortLabel,
    letters: [...axis.letters],
    tieBreakerQuestionId: axis.tieBreakerQuestionId,
    letterLabelsKo: Object.fromEntries(
      axis.letters.map((letter) => [letter, letterLabelsKo[letter]]),
    ),
  })),
  abilityLabelsKo: ABILITY_LABELS,
  questions: QUESTIONS.map((question) => {
    const axis = AXES.find((candidate) => candidate.key === question.axis);
    return {
      id: question.id,
      axis: question.axis,
      textKo: question.question,
      options: question.options.map((option) => ({
        code: option.value,
        textKo: option.label,
        descriptionKo: option.description,
        scores: {
          [question.axis]: option.value === axis.letters[0] ? 1 : -1,
        },
      })),
    };
  }),
  results: RESULT_CODES.map((code) => {
    const result = RESULTS[code];
    return {
      code: result.code,
      titleKo: result.title,
      summaryKo: result.summary,
      descriptionKo: result.description,
      strengthsKo: [...result.strengths],
      watchoutsKo: [...result.watchouts],
      collaborationKo: result.collaboration,
      shareIntroKo: result.shareIntro,
      abilities: result.abilities,
      career: result.career,
      referenceMappings: {
        mbti: result.mbti,
      },
      vector: resultVector(code),
    };
  }),
};

mkdirSync(join(root, 'packages/product-core/src'), { recursive: true });
writeFileSync(
  outputFile,
  [
    '// Generated from ../dpti-app/src/dpti.ts by scripts/import-dpti-content.mjs.',
    '// Do not edit the data body manually; update the source or importer instead.',
    `export const dptiTraitTest = ${JSON.stringify(dptiTraitTest, null, 2)};`,
    '',
  ].join('\n'),
);

console.log(`Imported DPTI: ${QUESTIONS.length} questions, ${RESULT_CODES.length} results`);
