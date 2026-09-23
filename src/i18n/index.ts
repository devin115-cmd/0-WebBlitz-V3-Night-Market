import en from './en.json';
import si from './si.json';
import ta from './ta.json';

export const locales = ['si', 'en', 'ta'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'si';
export type MessageKey = keyof typeof en;
export type Values = Record<string, string | number>;

const catalogues: Record<Locale, Record<MessageKey, string>> = { en, si, ta };

export const localeTag: Record<Locale, string> = { si: 'si-LK', en: 'en-LK', ta: 'ta-LK' };
export const nativeName: Record<Locale, string> = { si: 'සිංහල', en: 'English', ta: 'தமிழ்' };
export const shortName: Record<Locale, string> = { si: 'සිං', en: 'EN', ta: 'த' };

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function num(locale: Locale, value: number): string {
  return new Intl.NumberFormat(localeTag[locale]).format(value);
}

export interface Part {
  text: string;
  token?: string;
}

/** Splits a message into literal text and interpolated values; unknown keys or missing values fail the build. */
export function tParts(locale: Locale, key: MessageKey, values: Values = {}): Part[] {
  const template = catalogues[locale][key];
  if (template === undefined) throw new Error(`Missing ${locale} message: ${key}`);
  const parts: Part[] = [];
  let cursor = 0;
  for (const match of template.matchAll(/\{([a-zA-Z]+)\}/g)) {
    const token = match[1];
    if (!(token in values)) throw new Error(`Missing value {${token}} for ${locale}:${key}`);
    if (match.index > cursor) parts.push({ text: template.slice(cursor, match.index) });
    parts.push({ text: String(values[token]), token });
    cursor = match.index + match[0].length;
  }
  if (cursor < template.length) parts.push({ text: template.slice(cursor) });
  return parts;
}

export function t(locale: Locale, key: MessageKey, values: Values = {}): string {
  return tParts(locale, key, values).map((part) => part.text).join('');
}

export function plural(locale: Locale, base: 'catalogue.results', count: number): string {
  const form = count === 0 ? 'zero' : count === 1 ? 'one' : 'other';
  return t(locale, `${base}.${form}` as MessageKey, { count: num(locale, count) });
}

export function localePath(locale: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === defaultLocale ? clean : `/${locale}${clean}`;
}

/** Every key the browser needs at runtime, rendered per locale into a JSON island. */
export function runtimeMessages(locale: Locale) {
  return {
    pause: t(locale, 'showcase.pause'),
    resume: t(locale, 'showcase.resume'),
    pauseLabel: t(locale, 'showcase.pause.label'),
    resumeLabel: t(locale, 'showcase.resume.label'),
    menuOpen: t(locale, 'nav.menu.open'),
    menuClose: t(locale, 'nav.menu.close'),
    results: {
      zero: catalogues[locale]['catalogue.results.zero'],
      one: catalogues[locale]['catalogue.results.one'],
      other: catalogues[locale]['catalogue.results.other'],
    },
    numberTag: localeTag[locale],
  };
}
