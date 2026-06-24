/**
 * In-game match logic for a two-player memory round.
 *
 * @module game
 */

import { renderBoard, type Theme } from './board';
import { returnGameOverScreen, returnResultScreen } from './templates';

/** Player identifier: `'one'` = Blue, `'two'` = Orange. */
type Player = 'one' | 'two';

/** Round outcome: a winning player or a draw. */
type Result = Player | 'draw';

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
 * Drives a single memory round: flipping, pair matching, scoring, turn
 * switching and the end-of-game result.
 */
class MemoryGame {
  private readonly opts: GameOptions;
  private readonly board: HTMLElement;
  private readonly scores: Record<Player, number> = { one: 0, two: 0 };
  private current: Player;
  private matchedPairs = 0;
  private first: HTMLButtonElement | null = null;
  private locked = false;

  /**
   * Renders the board and wires the click handler for one round.
   *
   * @param opts - Round configuration.
   */
  constructor(opts: GameOptions) {
    this.opts = opts;
    this.current = opts.startingPlayer;
    renderBoard(opts.pairs, opts.theme);
    this.board = document.querySelector<HTMLElement>('#memory-board')!;
    this.board.addEventListener('click', (e) => this.onClick(e));
    this.setCurrentPlayer();
    this.updateScores();
  }

  /** Flips the clicked card and evaluates once two cards are open. */
  private onClick(e: MouseEvent): void {
    const card = (e.target as HTMLElement).closest<HTMLButtonElement>('.card');
    if (!card || this.locked) return;
    if (card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;

    card.classList.add('is-flipped');
    if (!this.first) {
      this.first = card;
      return;
    }
    this.locked = true;
    this.evaluatePair(this.first, card);
  }

  /** Resolves an open pair as a match or a mismatch after a short delay. */
  private evaluatePair(a: HTMLButtonElement, b: HTMLButtonElement): void {
    const matched = a.dataset.cardId === b.dataset.cardId;
    const resolve = (): void => (matched ? this.keepPair(a, b) : this.hidePair(a, b));
    window.setTimeout(resolve, matched ? MATCH_DELAY : MISMATCH_DELAY);
  }

  /** Locks a matched pair and scores it for the current player. */
  private keepPair(a: HTMLButtonElement, b: HTMLButtonElement): void {
    a.classList.add('is-matched');
    b.classList.add('is-matched');
    this.scores[this.current]++;
    this.matchedPairs++;
    this.updateScores();
    this.endTurn(false);
  }

  /** Flips a non-matching pair back. */
  private hidePair(a: HTMLButtonElement, b: HTMLButtonElement): void {
    a.classList.remove('is-flipped');
    b.classList.remove('is-flipped');
    this.endTurn(true);
  }

  /** Clears the open cards, then ends the game or hands over the turn. */
  private endTurn(switchPlayer: boolean): void {
    this.first = null;
    this.locked = false;
    if (this.matchedPairs === this.opts.pairs) {
      this.finish();
    } else if (switchPlayer) {
      this.current = this.current === 'one' ? 'two' : 'one';
      this.setCurrentPlayer();
    }
  }

  /** Writes both score counters. */
  private updateScores(): void {
    setText('#player-one--counter', String(this.scores.one));
    setText('#player-two--counter', String(this.scores.two));
  }

  /** Tints the current-player indicator and marks the active player label. */
  private setCurrentPlayer(): void {
    const rect = document.querySelector<SVGRectElement>('#current-player--icon rect');
    const color = this.current === 'one' ? '--color-player-one' : '--color-player-two';
    if (rect) rect.style.fill = `var(${color})`;
    document.querySelector('#player-one-label')?.classList.toggle('is-active', this.current === 'one');
    document.querySelector('#player-two-label')?.classList.toggle('is-active', this.current === 'two');
  }

  /** Starts the end sequence once the last pair is found. */
  private finish(): void {
    window.setTimeout(() => this.showGameOver(), GAME_OVER_DELAY);
  }

  /** Shows the game-over screen, then the result after a delay. */
  private showGameOver(): void {
    showEndscreen(returnGameOverScreen(this.opts.theme, this.scores.one, this.scores.two));
    window.setTimeout(() => this.showResult(), RESULT_DELAY);
  }

  /** Shows the winner / draw screen and wires the play-again button. */
  private showResult(): void {
    showEndscreen(returnResultScreen(this.opts.theme, this.outcome()));
    document.querySelector('#play-again-btn')?.addEventListener('click', () => this.restart());
  }

  /** Removes the overlay and returns to the menu. */
  private restart(): void {
    document.querySelector('#endscreen')?.remove();
    this.opts.onRestart();
  }

  /** Determines the round outcome from the scores. */
  private outcome(): Result {
    if (this.scores.one === this.scores.two) return 'draw';
    return this.scores.one > this.scores.two ? 'one' : 'two';
  }
}

/**
 * Starts a new memory round.
 *
 * @param opts - Round configuration.
 */
export function initGame(opts: GameOptions): void {
  new MemoryGame(opts);
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
