const target = process.argv[2] ?? 'unknown';
const strict = process.argv.includes('--strict');
const artifactIndex = process.argv.indexOf('--artifact');
const artifact = artifactIndex === -1 ? 'target artifact' : process.argv[artifactIndex + 1];

const labels = {
  mobile: 'Google Play/App Store React Native target',
  ait: 'AppsInToss Granite React Native target',
};

console.log(`${labels[target] ?? target}: scaffold 확정 전 placeholder 상태입니다.`);

if (strict) {
  console.error(`${artifact} build는 native/Granite scaffold 이후 실행할 수 있습니다.`);
  process.exit(1);
}
