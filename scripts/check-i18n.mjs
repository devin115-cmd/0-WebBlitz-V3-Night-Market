// Verifies key coverage, placeholder parity and demo copy across the English, Sinhala and Tamil catalogues.
import { readFile } from 'node:fs/promises';

const load = async (locale) => {
  const text = await readFile(new URL(`../src/i18n/${locale}.json`, import.meta.url), 'utf8');
  const keys = [...text.matchAll(/^\s*"([^"]+)":/gm)].map((match) => match[1]);
  const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
  return { messages: JSON.parse(text), duplicates };
};
const tokens = (value) => [...value.matchAll(/\{([a-zA-Z]+)\}/g)].map((match) => match[1]).sort().join(',');

const errors = [];
const en = await load('en');
const demoSource = await readFile(new URL('../src/data/demos.ts', import.meta.url), 'utf8');
const slugs = [...demoSource.matchAll(/slug: "([^"]+)"/g)].map((match) => match[1]);
if (slugs.length !== 40) errors.push(`expected 40 demos, found ${slugs.length}`);

for (const locale of ['en', 'si', 'ta']) {
  const { messages, duplicates } = locale === 'en' ? en : await load(locale);
  duplicates.forEach((key) => errors.push(`${locale}: duplicate key ${key}`));
  for (const key of Object.keys(en.messages)) {
    if (typeof messages[key] !== 'string' || !messages[key].trim()) errors.push(`${locale}: missing ${key}`);
    else if (tokens(messages[key]) !== tokens(en.messages[key])) errors.push(`${locale}: placeholder mismatch in ${key}`);
  }
  for (const key of Object.keys(messages)) if (!(key in en.messages)) errors.push(`${locale}: unexpected key ${key}`);
  for (const slug of slugs) {
    for (const field of ['name', 'description']) if (!messages[`demo.${slug}.${field}`]) errors.push(`${locale}: missing demo.${slug}.${field}`);
  }
  if (locale !== 'en') {
    const script = locale === 'si' ? /[\u0D80-\u0DFF]/ : /[\u0B80-\u0BFF]/;
    for (const slug of slugs) if (!script.test(messages[`demo.${slug}.description`] || '')) errors.push(`${locale}: demo.${slug}.description is not in the target script`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`i18n check passed: ${Object.keys(en.messages).length} keys x 3 locales, ${slugs.length} demos.`);
