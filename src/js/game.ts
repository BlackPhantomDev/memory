/**
 * In-game match logic for a two-player memory round.
 *
 * Renders the board, handles flipping, pair matching, scoring, turn switching
 * and the end-of-game result.
 *
 * @module game
 */

import { renderBoard, type Theme } from './board';
import { returnGameOverScreen, returnResultScreen } from './templates';

/** Player identifier: `'one'` = Blue, `'two'` = Orange. */
type Player = 'one' | 'two';

/** Delay (ms) before a matched pair locks in. */
const MATCH_DELAY = 450;

/** Delay (ms) before a non-matching pair flips back. */
const MISMATCH_DELAY = 900;

/** Delay (ms) after the last pair before the game-over screen appears. */
const GAME_OVER_DELAY = 2000;

/** Delay (ms) after the game-over screen before the result screen appears. */
const RESULT_DELAY = 3000;

/** Options for starting a game round. */
export interface GameOptions {
    /** Number of pairs on the board. */
    pairs: number;
    /** Theme to play with. */
    theme: Theme;
    /** Player who takes the first turn. */
    startingPlayer: Player;
    /** Called when the player chooses to leave the result screen. */
    onRestart: () => void;
}

/**
 * Sets the text content of the first element matching the selector.
 *
 * @param selector - CSS selector of the target element.
 * @param text - Text to set.
 */
function setText(selector: string, text: string): void {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
}

/**
 * Renders the board and wires up the full match loop for one round.
 *
 * @param opts - Round configuration.
 */
export function initGame(opts: GameOptions): void {
    renderBoard(opts.pairs, opts.theme);

    const boardEl = document.querySelector<HTMLElement>('#memory-board');
    if (!boardEl) return;
    const board: HTMLElement = boardEl;

    let current: Player = opts.startingPlayer;
    const scores: Record<Player, number> = { one: 0, two: 0 };
    let matchedPairs = 0;
    let first: HTMLButtonElement | null = null;
    let locked = false;

    setCurrentPlayer(current);
    updateScores();

    board.addEventListener('click', onClick);

    /**
     * Handles a click on a card: flips it and, once two are open, evaluates
     * them.
     *
     * @param e - The click event.
     */
    function onClick(e: MouseEvent): void {
        const card = (e.target as HTMLElement).closest<HTMLButtonElement>('.card');
        if (!card || locked) return;
        if (card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;

        card.classList.add('is-flipped');

        if (!first) {
            first = card;
            return;
        }

        locked = true;
        if (first.dataset.cardId === card.dataset.cardId) {
            resolveMatch(first, card);
        } else {
            resolveMismatch(first, card);
        }
    }

    /**
     * Locks a matched pair, awards a point and lets the player play again.
     *
     * @param a - First card of the pair.
     * @param b - Second card of the pair.
     */
    function resolveMatch(a: HTMLButtonElement, b: HTMLButtonElement): void {
        window.setTimeout(() => {
            a.classList.add('is-matched');
            b.classList.add('is-matched');
            scores[current]++;
            matchedPairs++;
            updateScores();
            first = null;
            locked = false;
            if (matchedPairs === opts.pairs) finish();
        }, MATCH_DELAY);
    }

    /**
     * Flips a non-matching pair back and passes the turn to the other player.
     *
     * @param a - First card.
     * @param b - Second card.
     */
    function resolveMismatch(a: HTMLButtonElement, b: HTMLButtonElement): void {
        window.setTimeout(() => {
            a.classList.remove('is-flipped');
            b.classList.remove('is-flipped');
            first = null;
            locked = false;
            current = current === 'one' ? 'two' : 'one';
            setCurrentPlayer(current);
        }, MISMATCH_DELAY);
    }

    /**
     * Writes both score counters.
     */
    function updateScores(): void {
        setText('#player-one--counter', String(scores.one));
        setText('#player-two--counter', String(scores.two));
    }

    /**
     * Tints the current-player indicator and marks the active player label.
     *
     * @param player - The player whose turn it is.
     */
    function setCurrentPlayer(player: Player): void {
        const rect = document.querySelector<SVGRectElement>('#current-player--icon rect');
        if (rect) {
            rect.style.fill = `var(${player === 'one' ? '--color-player-one' : '--color-player-two'})`;
        }
        document.querySelector('#player-one-label')?.classList.toggle('is-active', player === 'one');
        document.querySelector('#player-two-label')?.classList.toggle('is-active', player === 'two');
    }

    /**
     * Runs the end sequence: wait, show the game-over screen, wait again, then
     * show the winner / draw screen with a button back to the menu.
     */
    function finish(): void {
        const result: Player | 'draw' =
            scores.one === scores.two ? 'draw' : scores.one > scores.two ? 'one' : 'two';

        window.setTimeout(() => {
            showEndscreen(returnGameOverScreen(opts.theme, scores.one, scores.two));

            window.setTimeout(() => {
                showEndscreen(returnResultScreen(opts.theme, result));
                document.querySelector('#play-again-btn')?.addEventListener('click', () => {
                    document.querySelector('#endscreen')?.remove();
                    opts.onRestart();
                });
            }, RESULT_DELAY);
        }, GAME_OVER_DELAY);
    }
}

/**
 * Renders an end screen into a full-screen overlay, creating it if needed.
 *
 * @param html - The end screen markup.
 */
function showEndscreen(html: string): void {
    let overlay = document.querySelector<HTMLElement>('#endscreen');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'endscreen';
        document.body.append(overlay);
    }
    overlay.innerHTML = html;
}
