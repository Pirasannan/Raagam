/** Link that opens the home-page finder pre-filled with a scale's swaras. */
export function finderLink(swaras: string[]): string {
  const unique = [...new Set(swaras.map((s) => s.replace(/['’,]/g, '')))];
  return `/?swaras=${encodeURIComponent(unique.join(','))}#finder`;
}
