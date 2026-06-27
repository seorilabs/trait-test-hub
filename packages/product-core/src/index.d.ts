// product-core 공개 API 타입. 런타임은 index.js, 타입은 이 선언이 진실 소스입니다.
// apps/ait·apps/mobile 등 TS 소비자가 이 패키지를 import할 때 사용합니다.

export interface ManifestEntry {
  testId: string;
  version: number;
  status: string;
  titleKo: string;
  summaryKo?: string;
  category: string;
  tags?: string[];
  questionCount: number;
  resultCount: number;
  estimatedMinutes: string;
  path: string;
}

export interface Manifest {
  tests: ManifestEntry[];
}

export interface QuestionOption {
  code: string;
  textKo: string;
  descriptionKo?: string;
}

export interface Question {
  id: string;
  textKo: string;
  options: QuestionOption[];
}

export interface Axis {
  id: string;
  labelKo?: string;
}

export interface TraitTest {
  titleKo: string;
  questions: Question[];
  axes: Axis[];
  abilityLabelsKo?: Record<string, string>;
}

export interface TraitResult {
  titleKo: string;
  summaryKo: string;
  descriptionKo?: string;
  imagePath?: string;
  strengthsKo?: string[];
  watchoutsKo?: string[];
  abilities?: Record<string, number>;
  collaborationKo?: string;
}

export interface TraitScore {
  result: TraitResult;
  totals: Record<string, number>;
}

export function validateManifest(data: unknown): Manifest;
export function validateManifestEntry(data: unknown): ManifestEntry;
export function validateTraitTest(data: unknown): TraitTest;
export function scoreTraitTest(test: TraitTest, answers: Record<string, string>): TraitScore;
export function sortManifestEntries(entries: ManifestEntry[], sort: string): ManifestEntry[];
export function filterManifestEntries(entries: ManifestEntry[], filters: unknown): ManifestEntry[];
