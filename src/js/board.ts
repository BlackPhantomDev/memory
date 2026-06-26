/**
 * Modular memory board.
 *
 * {@link renderBoard} generates the playing field from a pair count and theme.
 * The number of cards and the theme are chosen in the main menu and passed in.
 *
 * @module board
 */

import { asset } from './assets';

/** Available themes (matches the folders under `/assets/themes`). */
export type Theme = 'code_vibes' | 'games' | 'da_projects' | 'food';

/** Selectable themes with their menu labels, in display order. */
export const THEMES: ReadonlyArray<{ id: Theme; label: string }> = [
  { id: 'code_vibes', label: 'Code vibes theme' },
  { id: 'games', label: 'Gaming theme' },
  { id: 'da_projects', label: 'DA Projects theme' },
  { id: 'food', label: 'Foods theme' },
];

/** Selectable board sizes in number of cards (pairs = cards / 2). */
export const BOARD_SIZES = [16, 24, 36] as const;

/** File extension of the motif images per theme (some ship PNG instead of SVG). */
const FRONT_EXT: Record<Theme, string> = {
  code_vibes: 'svg',
  games: 'svg',
  da_projects: 'png',
  food: 'svg',
};

/** Maximum number of pairs — every theme provides 18 motifs. */
const MAX_PAIRS = 18;

/** Minimum number of pairs for a meaningful board. */
const MIN_PAIRS = 2;

/** Default number of pairs until the main menu provides a selection. */
const DEFAULT_PAIRS = 8;

/**
 * Returns the path to a theme's card back image.
 *
 * @param theme - The theme to use.
 * @returns The card back asset URL.
 */
export function cardBackSrc(theme: Theme): string {
  return asset(`assets/themes/${theme}/card-back.svg`);
}

/**
 * Returns the path to a theme's front motif image.
 *
 * @param theme - The theme to use.
 * @param id - Motif number (1…{@link MAX_PAIRS}).
 * @returns The motif asset URL.
 */
export function cardFrontSrc(theme: Theme, id: number): string {
  return asset(`assets/themes/${theme}/cards-front/${id}.${FRONT_EXT[theme]}`);
}

/**
 * Returns the path to a theme's ready-made preview image (the composed mini
 * board panel) shown in the main menu.
 *
 * @param theme - The theme to use.
 * @returns The theme preview asset URL.
 */
export function themePreviewSrc(theme: Theme): string {
  return asset(`assets/themes/${theme}/theme-preview.svg`);
}

/**
 * Shuffles an array in place using Fisher–Yates.
 *
 * @typeParam T - Element type of the array.
 * @param arr - The array to shuffle (mutated).
 * @returns The same, now shuffled array.
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Returns the theme currently set on `<html data-theme>`.
 *
 * @returns The active theme, falling back to `'food'`.
 */
function currentTheme(): Theme {
  return (document.documentElement.dataset.theme as Theme) ?? 'food';
}

/**
 * Reads the active theme's `--card-aspect` (e.g. `"3 / 2"`) and returns it as a
 * number (width / height). Used so a card can keep both edges within
 * `--card-size` (see `_card.scss`).
 *
 * @returns The aspect ratio as a number, falling back to `1`.
 */
function themeAspect(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--card-aspect').trim();
  const [w, h] = raw.split('/').map((part) => parseFloat(part));
  return w > 0 && h > 0 ? w / h : 1;
}

/**
 * Builds the markup for a single card (back and front face).
 *
 * @param id - Motif number.
 * @param theme - Theme used to build the image paths.
 * @returns The `<button class="card">` HTML as a string.
 */
function cardMarkup(id: number, theme: Theme): string {
  return `
        <button class="card" type="button" data-card-id="${id}" aria-label="Memory card">
            <span class="card__inner">
                <span class="card__face card__face--back">
                    <img src="${cardBackSrc(theme)}" alt="" />
                </span>
                <span class="card__face card__face--front">
                    <img src="${cardFrontSrc(theme, id)}" alt="" />
                </span>
            </span>
        </button>`;
}

/**
 * Redraws the board: picks `pairs` unique motifs, duplicates and shuffles them,
 * sets the column count and aspect ratio as CSS variables, and writes the card
 * markup into `#memory-board`.
 *
 * @param pairs - Desired number of pairs, clamped to {@link MIN_PAIRS}…{@link MAX_PAIRS}.
 * @param theme - Theme to use.
 */
export function renderBoard(pairs: number = DEFAULT_PAIRS, theme: Theme = currentTheme()): void {
  const board = document.querySelector<HTMLElement>('#memory-board');
  if (!board) return;

  pairs = Math.min(Math.max(Math.round(pairs), MIN_PAIRS), MAX_PAIRS);

  const motifs = shuffle(Array.from({ length: MAX_PAIRS }, (_, i) => i + 1)).slice(0, pairs);
  const deck = shuffle([...motifs, ...motifs]);

  // Pick the column count closest to a square that divides the deck evenly,
  // so every row is full (e.g. 24 -> 6x4 instead of 5x5 with a short row).
  let cols = Math.ceil(Math.sqrt(deck.length));
  while (deck.length % cols !== 0) cols++;
  const rows = deck.length / cols;
  board.style.setProperty('--cols', String(cols));
  board.style.setProperty('--rows', String(rows));
  board.style.setProperty('--aspect', String(themeAspect()));

  board.innerHTML = deck.map((id) => cardMarkup(id, theme)).join('');
}
