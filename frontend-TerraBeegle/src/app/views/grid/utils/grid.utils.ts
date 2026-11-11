export function getReleaseYear(releasedDate: string): string {
  if (!releasedDate) return '';
  return releasedDate.split('-')[0] || releasedDate;
}
