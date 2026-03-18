export type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type EntryType = 'boolean' | 'quantitative';
export type GrowthStage = 'seed' | 'sprout' | 'plant' | 'tree' | 'grove';

export const COLOR_THEMES = {
  forest: { label: 'Forest', hues: [152, 152, 152, 152] },
  ocean: { label: 'Ocean', hues: [200, 200, 200, 200] },
  fire: { label: 'Fire', hues: [15, 15, 15, 15] },
  lavender: { label: 'Lavender', hues: [270, 270, 270, 270] },
  gold: { label: 'Gold', hues: [45, 45, 45, 45] },
  rose: { label: 'Rose', hues: [340, 340, 340, 340] },
  slate: { label: 'Slate', hues: [210, 210, 210, 210] },
  mint: { label: 'Mint', hues: [165, 165, 165, 165] },
} as const;

export type ColorThemeKey = keyof typeof COLOR_THEMES;

export interface Plot {
  id: string;
  name: string;
  icon: string;
  zone_id: string;
  frequency: Frequency;
  custom_frequency?: { times: number; per: 'week' | 'month' };
  entry_type: EntryType;
  unit?: string;
  target_per_period?: number;
  color_theme: ColorThemeKey;
  start_date: string;
  description?: string;
  is_archived: boolean;
  is_shareable: boolean;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  plot_id: string;
  date: string; // YYYY-MM-DD
  value: number;
  intensity?: 1 | 2 | 3 | 4 | 5;
  note?: string;
  is_backdated: boolean;
  created_at: string;
}

export interface Zone {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export function getGrowthStage(totalEntries: number): GrowthStage {
  if (totalEntries === 0) return 'seed';
  if (totalEntries <= 7) return 'sprout';
  if (totalEntries <= 30) return 'plant';
  if (totalEntries <= 99) return 'tree';
  return 'grove';
}

export const GROWTH_LABELS: Record<GrowthStage, string> = {
  seed: '🌱 Seed',
  sprout: '🌿 Sprout',
  plant: '🪴 Plant',
  tree: '🌳 Tree',
  grove: '🌲 Grove',
};

export function getColorForIntensity(theme: ColorThemeKey, level: 0 | 1 | 2 | 3 | 4): string {
  const hue = COLOR_THEMES[theme].hues[0];
  if (level === 0) return `hsl(${hue}, 5%, 88%)`;
  const sats = [25, 35, 40, 50];
  const lights = [72, 55, 42, 30];
  return `hsl(${hue}, ${sats[level - 1]}%, ${lights[level - 1]}%)`;
}

export function getColorForIntensityDark(theme: ColorThemeKey, level: 0 | 1 | 2 | 3 | 4): string {
  const hue = COLOR_THEMES[theme].hues[0];
  if (level === 0) return `hsl(${hue}, 5%, 15%)`;
  const sats = [20, 30, 40, 50];
  const lights = [22, 32, 45, 58];
  return `hsl(${hue}, ${sats[level - 1]}%, ${lights[level - 1]}%)`;
}
