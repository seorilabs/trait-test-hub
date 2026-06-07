import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distRoot = join(root, 'pages-dist');

rmSync(distRoot, { recursive: true, force: true });
mkdirSync(distRoot, { recursive: true });

cpSync(join(root, 'apps'), join(distRoot, 'apps'), { recursive: true });
cpSync(join(root, 'packages'), join(distRoot, 'packages'), { recursive: true });
cpSync(join(root, 'public'), join(distRoot, 'public'), { recursive: true });
cpSync(join(root, 'public', 'test-packs'), join(distRoot, 'test-packs'), { recursive: true });
cpSync(join(root, 'apps', 'preview', 'index.html'), join(distRoot, 'index.html'));

writeFileSync(join(distRoot, 'CNAME'), 'traithub.vzyx.xyz\n');
writeFileSync(join(distRoot, '.nojekyll'), '');

console.log('built GitHub Pages artifact at pages-dist');
