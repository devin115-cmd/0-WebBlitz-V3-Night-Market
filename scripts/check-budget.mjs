// Fails the build when gzipped JS, CSS or HTML output grows past the agreed limits.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const limits = { js: { largest: 60_000, total: 70_000 }, css: { largest: 16_000, total: 20_000 }, html: { largest: 24_000, total: 140_000 } };
const walk = async (dir) => (await Promise.all((await readdir(dir)).map(async (name) => {
  const path = join(dir, name);
  return (await stat(path)).isDirectory() ? walk(path) : [path];
}))).flat();

const files = await walk('dist');
const report = {};
const errors = [];
for (const kind of Object.keys(limits)) {
  const sizes = await Promise.all(files.filter((file) => file.endsWith(`.${kind}`)).map(async (file) => ({ file, gzip: gzipSync(await readFile(file), { level: 9 }).length })));
  const largest = sizes.reduce((max, item) => (item.gzip > max.gzip ? item : max), { file: '-', gzip: 0 });
  const total = sizes.reduce((sum, item) => sum + item.gzip, 0);
  report[kind] = { files: sizes.length, largest: `${largest.file} ${largest.gzip}B`, total: `${total}B` };
  if (largest.gzip > limits[kind].largest) errors.push(`${kind}: ${largest.file} is ${largest.gzip}B gzip (limit ${limits[kind].largest}B)`);
  if (total > limits[kind].total) errors.push(`${kind}: total ${total}B gzip (limit ${limits[kind].total}B)`);
}
console.table(report);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Asset budget check passed.');
