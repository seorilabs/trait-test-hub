import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildTestPackOutput } from './lib/test-pack-output.mjs';

const root = process.cwd();
const distRoot = join(root, 'pages-dist');

rmSync(distRoot, { recursive: true, force: true });
mkdirSync(distRoot, { recursive: true });

mkdirSync(join(distRoot, 'apps'), { recursive: true });
cpSync(join(root, 'apps', 'preview'), join(distRoot, 'apps', 'preview'), { recursive: true });
mkdirSync(join(distRoot, 'packages'), { recursive: true });
cpSync(join(root, 'packages', 'product-core'), join(distRoot, 'packages', 'product-core'), {
  recursive: true,
});
cpSync(join(root, 'public'), join(distRoot, 'public'), { recursive: true });
rmSync(join(distRoot, 'public', 'test-packs'), { recursive: true, force: true });
buildTestPackOutput({
  root,
  outputRoot: join(distRoot, 'test-packs'),
});
cpSync(join(distRoot, 'test-packs'), join(distRoot, 'public', 'test-packs'), { recursive: true });
cpSync(join(root, 'apps', 'preview', 'index.html'), join(distRoot, 'index.html'));

writeFileSync(join(distRoot, 'CNAME'), 'traithub.vzyx.xyz\n');
writeFileSync(join(distRoot, '.nojekyll'), '');

console.log('built GitHub Pages artifact at pages-dist');
