/**
 * Commercial and contact facts. Values mirror the WebBlitz standard offer
 * (`web-blitz-v2-2026-07-30` contract) and must change only with that contract.
 */
export const offer = {
  standardBaseLkr: 22_000,
  baseDeliveryWorkingDays: 3,
  hostingMonthsIncluded: 12,
  hostingRenewalLkr: 2_500,
  hostingRenewalMonths: 12,
  correctionRoundsIncluded: 1,
  correctionSubmissionHours: 48,
  aboutWordLimit: 150,
  maxServices: 6,
  galleryPhotos: 8,
  maxTestimonials: 3,
} as const;

export const languageAddOns = [
  { key: 'offer.languages.clientOne', standardLkr: 5_000, extraDays: 1 },
  { key: 'offer.languages.assistedOne', standardLkr: 10_000, extraDays: 2 },
  { key: 'offer.languages.clientTwo', standardLkr: 10_000, extraDays: 2 },
  { key: 'offer.languages.mixedTwo', standardLkr: 15_000, extraDays: 3 },
  { key: 'offer.languages.assistedTwo', standardLkr: 20_000, extraDays: 4 },
] as const;

export const contact = {
  whatsappDigits: '94777192825',
  phoneE164: '+94777192825',
  phoneDisplay: '+94 777 192 825',
  email: 'info@serendib.tech',
} as const;

/** Full terms and privacy notices are served by the existing WebBlitz application, which has one unprefixed URL per notice for every locale. */
const legalBaseUrl = (process.env.LEGAL_BASE_URL || 'https://serendib.tech').replace(/\/$/, '');

export function legalHref(page: 'terms' | 'privacy'): string {
  return `${legalBaseUrl}/${page}/`;
}

export function whatsappHref(message: string): string {
  return `https://wa.me/${contact.whatsappDigits}?text=${encodeURIComponent(message)}`;
}
