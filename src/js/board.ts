/**
 * Modular memory board.
 *
 * {@link renderBoard} rebuilds the playing field. The number of cards and the
 * theme are chosen later in the main menu and passed into the function.
 *
 * @module board
 */

/** Available themes (matches the folders under `/assets/themes`). */
type Theme = 'code_vibes' | 'games' | 'da_projects' | 'food';

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
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--card-aspect')
        .trim();
    const [w, h] = raw.split('/').map(part => parseFloat(part));
    return w > 0 && h > 0 ? w / h : 1;
}

/**
 * Builds the markup for a single card (back and front face).
 *
 * @param id - Motif number (1…{@link MAX_PAIRS}).
 * @param theme - Theme used to build the image paths.
 * @returns The `<button class="card">` HTML as a string.
 */
function cardMarkup(id: number, theme: Theme): string {
    const ext = FRONT_EXT[theme];
    return `
        <button class="card" type="button" data-card-id="${id}" aria-label="Memory card">
            <span class="card__inner">
                <span class="card__face card__face--back">
                    <img src="/assets/themes/${theme}/card-back.svg" alt="" />
                </span>
                <span class="card__face card__face--front">
                    <img src="/assets/themes/${theme}/cards-front/${id}.${ext}" alt="" />
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

    const cols = Math.ceil(Math.sqrt(deck.length));
    board.style.setProperty('--cols', String(cols));
    board.style.setProperty('--aspect', String(themeAspect()));

    board.innerHTML = deck.map(id => cardMarkup(id, theme)).join('');
}

/**
 * Enables flipping a card on click for the preview.
 * Does not yet include match logic.
 */
function enablePreviewFlip(): void {
    const board = document.querySelector<HTMLElement>('#memory-board');
    board?.addEventListener('click', e => {
        const card = (e.target as HTMLElement).closest('.card');
        card?.classList.toggle('is-flipped');
    });
}

/**
 * Watches `data-theme` on `<html>` and redraws the board with the same number
 * of pairs whenever the theme changes.
 */
function observeThemeChange(): void {
    new MutationObserver(() => renderBoard(currentBoardPairs(), currentTheme()))
        .observe(document.documentElement, { attributeFilter: ['data-theme'] });
}

/**
 * Determines the number of pairs currently shown from the DOM.
 *
 * @returns The number of pairs on the board, falling back to {@link DEFAULT_PAIRS}.
 */
function currentBoardPairs(): number {
    const count = document.querySelectorAll('#memory-board .card').length;
    return count ? count / 2 : DEFAULT_PAIRS;
}

/**
 * Initializes the board preview: renders a default board, enables click-to-flip
 * and reacts to theme changes.
 */
export function initBoardPreview(): void {
    renderBoard();
    enablePreviewFlip();
    observeThemeChange();
}
