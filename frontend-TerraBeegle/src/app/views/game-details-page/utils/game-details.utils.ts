import { GameWebsiteItem } from '../../../models-services/game.model';

const WEBSITE_NAMES: Record<number, string> = {
  2: 'Community wiki',
  3: 'Wikipedia',
  4: 'Facebook',
  5: 'X / Twitter',
  6: 'Twitch',
  8: 'Instagram',
  9: 'YouTube',
  10: 'App Store (iPhone)',
  11: 'App Store (iPad)',
  12: 'Google Play',
  13: 'Steam',
  14: 'Reddit',
  15: 'itch.io',
  16: 'Epic Games',
  17: 'GOG',
  18: 'Discord',
  19: 'Bluesky',
  22: 'Xbox Store',
  23: 'PlayStation Store',
  24: 'Nintendo eShop',
};

/** Converts an IGDB 0-100 rating to a 0-10 scale rounded to one decimal. */
export function toTen(rating: number): number {
  return Math.round(rating) / 10;
}

/** Joins named items into a comma-separated string. */
export function joinNames(items: { name: string }[] | null | undefined): string {
  return (items ?? []).map((item) => item.name).join(', ');
}

/** Returns a human-readable label for a website item, falling back to its hostname. */
export function websiteLabel(site: GameWebsiteItem): string {
  if (WEBSITE_NAMES[site.type]) return WEBSITE_NAMES[site.type];
  try {
    return new URL(site.url).hostname.replace(/^www\./, '');
  } catch {
    return 'Website';
  }
}
