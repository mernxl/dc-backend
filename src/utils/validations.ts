import moment from 'moment';

export const invariant = <T>(checkValue: T, errorMessage: string): void => {
  if (!checkValue) {
    throw Error(errorMessage);
  }
};

export type StaleConfig = {
  [key in moment.DurationInputArg2]?: number; // object moment will parse to date
};

export const getStaleTimestamp = (staleConfig: StaleConfig): number =>
  moment().add(staleConfig).unix();
export const getStaleDate = (staleConfig: StaleConfig): Date => moment().add(staleConfig).toDate();

export const isItemStale = (stale = 0): boolean => moment().unix() > stale;

export const isEmailValid = (email: string): boolean =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email,
  );

/**
 * Ensure all emails are lower cased
 */
export const sanitizeEmail = (email = ''): string => email.trim().toLowerCase();

/**
 * Use for sanitizing phones ensure we store numbers without +
 */
export const sanitizePhone = (phone = ''): string => phone.trim().replace(/^\+|\s/g, '');

/**
 * For escaping using input when using that input as regex.
 * It can cause errors when passed directly to example db.
 *
 * $& means the whole matched string
 */
export const escapeRegExp = (string = ''): string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Remove diacritics from a word
 *
 * normalize()ing to NFD Unicode normal form decomposes combined graphemes into the combination of simple ones.
 * The è of Crème ends up expressed as e +  ̀.
 *
 * @see https://stackoverflow.com/a/37511463/7387312
 */
export const removeDiacritics = (string = ''): string =>
  string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const parseRawStrInputForMatching = (str: unknown): string =>
  removeDiacritics(
    // remove all white spaces
    String(str).replace(/\s/g, ''),
  ).toLowerCase();
