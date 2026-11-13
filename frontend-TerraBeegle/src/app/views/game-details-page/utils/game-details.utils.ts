import { GameWebsiteItem } from '../../../models-services/game.model';

// Names for the IGDB website types; any other link shows its domain
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

// IGDB rating 0-100 shown out of 10, like on the cards (87.5 -> 8.8)
export function toTen(rating: number): number {
  return Math.round(rating) / 10;
}

// "FromSoftware, Bandai Namco" from a list of objects with a name
export function joinNames(items: { name: string }[] | null | undefined): string {
  return (items ?? []).map((item) => item.name).join(', ');
}

// "Steam", "GOG"... or the domain of the link when the type is unknown
export function websiteLabel(site: GameWebsiteItem): string {
  if (WEBSITE_NAMES[site.type]) return WEBSITE_NAMES[site.type];
  try {
    return new URL(site.url).hostname.replace(/^www\./, '');
  } catch {
    return 'Website';
  }
}
