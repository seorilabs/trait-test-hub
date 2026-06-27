import test from 'node:test';
import assert from 'node:assert/strict';
import { computeResultRarity, formatRarityKo } from '../src/index.js';

test('computes one-in-N rarity from a distribution doc', () => {
  const distribution = { total: 999, counts: { a: 80, b: 120, c: 800 } };
  const rarity = computeResultRarity(distribution, 'a');

  assert.equal(rarity.total, 1000); // counts 합에서 재계산
  assert.equal(rarity.count, 80);
  assert.equal(rarity.oneInN, 13); // round(1000/80)
  assert.ok(Math.abs(rarity.share - 0.08) < 1e-9);
  assert.equal(rarity.enoughSample, true);
});

test('accepts a bare counts map', () => {
  const rarity = computeResultRarity({ x: 50, y: 50 }, 'x');
  assert.equal(rarity.total, 100);
  assert.equal(rarity.oneInN, 2);
});

test('marks insufficient sample below the share threshold (<30)', () => {
  const rarity = computeResultRarity({ a: 3, b: 4 }, 'a');
  assert.equal(rarity.showShare, false);
  assert.equal(rarity.showCount, false);
  assert.equal(formatRarityKo(rarity), '아직 집계 중이에요');
});

test('shows share only between 30 and 99 samples', () => {
  const rarity = computeResultRarity({ a: 10, b: 40 }, 'a'); // total 50
  assert.equal(rarity.showShare, true);
  assert.equal(rarity.showCount, false);
  assert.equal(formatRarityKo(rarity), '전체의 20%');
});

test('shows one-in-N once 100 samples reached', () => {
  const rarity = computeResultRarity({ a: 20, b: 80 }, 'a'); // total 100
  assert.equal(rarity.showCount, true);
  assert.equal(formatRarityKo(rarity), '5명 중 1명 · 전체의 20%');
});

test('handles a result code with zero completions', () => {
  const rarity = computeResultRarity({ a: 500, b: 500 }, 'unseen');
  assert.equal(rarity.count, 0);
  assert.equal(rarity.oneInN, null);
  assert.equal(rarity.enoughSample, false);
});

test('formats the Korean rarity line', () => {
  const rarity = computeResultRarity({ a: 100, b: 1900 }, 'a');
  assert.equal(rarity.oneInN, 20);
  assert.equal(formatRarityKo(rarity), '20명 중 1명 · 전체의 5%');
});

test('formats sub-1% share as 1% 미만', () => {
  const counts = { rare: 1 };
  for (let i = 0; i < 300; i += 1) counts[`c${i}`] = 1;
  const rarity = computeResultRarity(counts, 'rare');
  assert.equal(formatRarityKo(rarity), '301명 중 1명 · 전체의 1% 미만');
});

test('rejects invalid counts', () => {
  assert.throws(() => computeResultRarity({ a: -1 }, 'a'), /Invalid count/);
  assert.throws(() => computeResultRarity(null, 'a'), /counts must be an object/);
  assert.throws(() => computeResultRarity({ a: 1 }, ''), /non-empty string/);
});
