import test from 'node:test';
import assert from 'node:assert/strict';
import { dptiTraitTest, sampleTraitTests, scoreTraitTest } from '../src/index.js';

test('scores answers and resolves the nearest result', () => {
  const fixture = sampleTraitTests[0];
  const score = scoreTraitTest(fixture, {
    q1: 'share',
    q2: 'ask',
    q3: 'talk',
  });

  assert.deepEqual(score.totals, {
    pace: 1,
    social: 6,
  });
  assert.equal(score.result.code, 'warm-connector');
});

test('rejects missing answers', () => {
  const fixture = sampleTraitTests[0];

  assert.throws(
    () => scoreTraitTest(fixture, { q1: 'plan' }),
    /Missing or invalid answer for question: q2/,
  );
});

test('scores DPTI content with original tie-breaker semantics', () => {
  const answers = Object.fromEntries(
    dptiTraitTest.questions.map((question) => [question.id, question.options[0].code]),
  );

  answers.q02 = 'T';
  answers.q04 = 'T';

  const score = scoreTraitTest(dptiTraitTest, answers);

  assert.equal(score.result.code, 'ACLO');
  assert.deepEqual(score.axisBreakdown.work, {
    A: 2,
    T: 2,
  });
});
