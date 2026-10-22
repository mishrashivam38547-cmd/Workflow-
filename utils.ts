export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const inr = (n: number): string => '₹' + n.toLocaleString('en-IN');

export const fmtDate = (iso: string): string => {
  try {
    return new Intl.DateTimeFormat('hi-IN-u-nu-latn', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};
