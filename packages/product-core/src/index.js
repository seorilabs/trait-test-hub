import { dptiTraitTest } from './dptiCatalog.js';
import { sampleTraitTests } from './sampleCatalog.js';

export { dptiTraitTest } from './dptiCatalog.js';
export { sampleTraitTests } from './sampleCatalog.js';
export { scoreTraitTest } from './scoring.js';
export {
  buildStatsKeys,
  filterManifestEntries,
  sortManifestEntries,
  validateManifest,
  validateManifestEntry,
  validateTraitTest,
} from './testPack.js';

export const traitTests = [dptiTraitTest, ...sampleTraitTests];
