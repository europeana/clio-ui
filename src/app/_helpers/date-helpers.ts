export function toInputSafeName(s: string): string {
  return s.replace(/\./g, '_____'); // NOSONAR
}

export function fromInputSafeName(s: string): string {
  return s.replace(/_____/g, '.'); // NOSONAR
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
