import { FormControl, ValidationErrors } from '@angular/forms';

export const today = new Date().toISOString().split('T')[0];

export const yearZero = new Date(Date.parse('20 Nov 2008 12:00:00 GMT'))
  .toISOString()
  .split('T')[0];

/** dateToUCT
/* @param {Date} localDate
/* @returns creates a UCT date from a local date, adjusted by the local date's offset
*/
export function dateToUCT(localDate: Date): Date {
  const dateUTC = new Date(localDate.toISOString());
  return new Date(dateUTC.getTime() - localDate.getTimezoneOffset() * 60000);
}

/** getDateAsISOString
/* @param {Date} localDate
/* - returns 'yyyy-mm-dd'
*/
export function getDateAsISOString(localDate: Date): string {
  return dateToUCT(localDate).toISOString().split('T')[0];
}

export function toInputSafeName(s: string): string {
  return s.replace(/\./g, '_____');
}

/** fromCSL
/* @param {string} s - the target string
/* - splits the string on commas and return the trimmed results
*/
export function fromCSL(s: string): Array<string> {
  return s
    .split(',')
    .map((part: string) => {
      return part.trim();
    })
    .filter((part: string) => {
      return part.length > 0;
    });
}
