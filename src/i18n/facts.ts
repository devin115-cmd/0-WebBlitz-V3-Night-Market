import { demos } from '../data/demos';
import { offer } from '../data/site';
import { num, type Locale } from './index';

/** Raw numbers for placeholders that count up when they enter view. */
export const countable: Record<string, number> = {
  aboutWords: offer.aboutWordLimit,
  serviceCount: offer.maxServices,
  photoCount: offer.galleryPhotos,
  testimonialCount: offer.maxTestimonials,
  hostingMonths: offer.hostingMonthsIncluded,
  correctionRounds: offer.correctionRoundsIncluded,
  standardPrice: offer.standardBaseLkr,
  demoCount: demos.length,
};

export function factValues(locale: Locale) {
  return {
    standardPrice: num(locale, offer.standardBaseLkr),
    demoCount: num(locale, demos.length),
    aboutWords: num(locale, offer.aboutWordLimit),
    serviceCount: num(locale, offer.maxServices),
    photoCount: num(locale, offer.galleryPhotos),
    testimonialCount: num(locale, offer.maxTestimonials),
    hostingMonths: num(locale, offer.hostingMonthsIncluded),
    correctionRounds: num(locale, offer.correctionRoundsIncluded),
    correctionHours: num(locale, offer.correctionSubmissionHours),
    renewalFee: num(locale, offer.hostingRenewalLkr),
    renewalMonths: num(locale, offer.hostingRenewalMonths),
    baseDeliveryDays: num(locale, offer.baseDeliveryWorkingDays),
  };
}
