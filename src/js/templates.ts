/**
 * HTML string templates for the game screens.
 *
 * @module templates
 */

import { THEMES, BOARD_SIZES, themePreviewSrc, type Theme } from './board';

/** Selection state shared between the main menu and the game screen. */
export interface MenuState {
    /** Starting player: `'one'` = Blue, `'two'` = Orange. */
    player: 'one' | 'two';
    /** Selected theme. */
    theme: Theme;
    /** Selected board size in number of cards. */
    cards: number;
}

/**
 * Returns the start screen markup (title and play button).
 *
 * @returns The start screen HTML.
 */
export function returnStartScreen(): string {
    return `
        <section id="start-screen">
            <div id="main-title">
                <h3 id="subtitle">It's play time.</h3>
                <h1>Ready to play?</h1>
            </div>
            <button id="play-btn">
                <img id="play-btn--controller" src="/assets/icons/controller.svg" alt="Controller icon">
                Play
                <img id="play-btn--arrow" src="/assets/icons/arrow.svg" alt="Arrow icon">
            </button>
            <div id="background-icon">
                <img src="/assets/icons/controller-background.svg" alt="Background icon">
            </div>
        </section>
    `;
}

/**
 * Builds a single radio option row with a custom dot and selection arrow.
 *
 * @param name - Radio group name.
 * @param value - Option value.
 * @param label - Visible label.
 * @param checked - Whether the option is preselected.
 * @returns The option HTML.
 */
function option(name: string, value: string, label: string, checked: boolean): string {
    return `
        <label class="option">
            <input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''} />
            <span class="option__label">${label}</span>
            <span class="option__arrow" aria-hidden="true"></span>
        </label>`;
}

/**
 * Builds a settings group: an icon + title legend and its radio options.
 *
 * @param icon - Icon file name in `/assets/icons`.
 * @param title - Group title.
 * @param options - Pre-rendered option rows.
 * @returns The group HTML.
 */
function group(icon: string, title: string, options: string): string {
    return `
        <fieldset class="menu-group">
            <legend><img class="menu-group__icon" src="/assets/icons/${icon}" alt="" /> ${title}</legend>
            ${options}
        </fieldset>`;
}

/**
 * Returns the main menu ("Settings") markup: the three setting groups (game
 * themes, player, board size), the themed preview image and the summary bar
 * with the start button. Inputs are preselected from the given state.
 *
 * @param state - Current selection state.
 * @returns The main menu HTML.
 */
export function returnMainMenu(state: MenuState): string {
    const themeOptions = THEMES
        .map(t => option('theme', t.id, t.label, t.id === state.theme))
        .join('');
    const playerOptions =
        option('player', 'one', 'Blue', state.player === 'one') +
        option('player', 'two', 'Orange', state.player === 'two');
    const sizeOptions = BOARD_SIZES
        .map(n => option('board-size', String(n), `${n} cards`, n === state.cards))
        .join('');

    return `
        <form id="main-menu">
            <h2 id="menu-title">Settings</h2>
            <div id="menu-groups">
                ${group('choose-theme.svg', 'Game themes', themeOptions)}
                ${group('choose-player-color.svg', 'Choose player', playerOptions)}
                ${group('choose-board-size.svg', 'Board size', sizeOptions)}
            </div>
            <aside id="menu-side">
                <img id="theme-preview" src="${themePreviewSrc(state.theme)}" alt="Theme preview" />
                <div id="menu-summary">
                    <span class="summary-item" id="summary-theme"></span>
                    <span class="summary-sep" aria-hidden="true">/</span>
                    <span class="summary-item" id="summary-player"></span>
                    <span class="summary-sep" aria-hidden="true">/</span>
                    <span class="summary-item" id="summary-size"></span>
                    <button id="start-btn" type="submit">
                        <img src="/assets/icons/start-game.svg" alt="" /> Start
                    </button>
                </div>
            </aside>
        </form>
    `;
}

/**
 * Returns the in-game header markup: both player labels with score counters,
 * the current-player indicator and the exit button. The player icons carry
 * `data-file-name` and are filled with the active theme's assets at runtime.
 *
 * @returns The playing header HTML.
 */
export function returnPlayingHeader(): string {
    return `
        <section id="header">
            <div id="players-label">
                <div id="player-one-label">
                <figure>
                    <img class="player-icon" data-file-name="player-one.svg" alt="Player one icon" />
                    <figcaption>
                    Blue
                    <span id="player-one--counter">0</span>
                    </figcaption>
                </figure>
                </div>
                <div id="player-two-label">
                <figure>
                    <img class="player-icon" data-file-name="player-two.svg" alt="Player two icon" />
                    <figcaption>
                    Orange
                    <span id="player-two--counter">0</span>
                    </figcaption>
                </figure>
                </div>
            </div>
            <div id="current-player">
                <figure>
                <figcaption>Current player: </figcaption>
                <svg id="current-player--icon" width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="41" height="40" rx="8" fill="none"/>
                    <path d="M11.125 36C10.2656 36 9.52995 35.6867 8.91797 35.06C8.30599 34.4333 8 33.68 8 32.8V29.64C8 29.1067 8.11719 28.6133 8.35156 28.16C8.58594 27.7067 8.89844 27.32 9.28906 27C11.0859 25.5067 12.4336 24 13.332 22.48C14.2305 20.96 14.862 19.6 15.2266 18.4H12.6875C12.2448 18.4 11.8737 18.2467 11.5742 17.94C11.2747 17.6333 11.125 17.2533 11.125 16.8C11.125 16.3467 11.2747 15.9667 11.5742 15.66C11.8737 15.3533 12.2448 15.2 12.6875 15.2H14.6406C14.276 14.6133 13.9896 13.9867 13.7812 13.32C13.5729 12.6533 13.4688 11.9467 13.4688 11.2C13.4688 9.2 14.1523 7.5 15.5195 6.1C16.8867 4.7 18.5469 4 20.5 4C22.4531 4 24.1133 4.7 25.4805 6.1C26.8477 7.5 27.5312 9.2 27.5312 11.2C27.5312 11.9467 27.4271 12.6533 27.2188 13.32C27.0104 13.9867 26.724 14.6133 26.3594 15.2H28.3125C28.7552 15.2 29.1263 15.3533 29.4258 15.66C29.7253 15.9667 29.875 16.3467 29.875 16.8C29.875 17.2533 29.7253 17.6333 29.4258 17.94C29.1263 18.2467 28.7552 18.4 28.3125 18.4H25.7734C26.138 19.6 26.7695 20.96 27.668 22.48C28.5664 24 29.9141 25.5067 31.7109 27C32.1016 27.32 32.4141 27.7067 32.6484 28.16C32.8828 28.6133 33 29.1067 33 29.64V32.8C33 33.68 32.694 34.4333 32.082 35.06C31.4701 35.6867 30.7344 36 29.875 36H11.125ZM11.125 32.8H29.875V29.6C27.4792 27.68 25.7474 25.7 24.6797 23.66C23.612 21.62 22.8958 19.8667 22.5312 18.4H18.4688C18.1042 19.8667 17.388 21.62 16.3203 23.66C15.2526 25.7 13.5208 27.68 11.125 29.6V32.8ZM20.5 15.2C21.5938 15.2 22.5182 14.8133 23.2734 14.04C24.0286 13.2667 24.4062 12.32 24.4062 11.2C24.4062 10.08 24.0286 9.13333 23.2734 8.36C22.5182 7.58667 21.5938 7.2 20.5 7.2C19.4062 7.2 18.4818 7.58667 17.7266 8.36C16.9714 9.13333 16.5938 10.08 16.5938 11.2C16.5938 12.32 16.9714 13.2667 17.7266 14.04C18.4818 14.8133 19.4062 15.2 20.5 15.2Z" fill="white"/>
                </svg>
                </figure>
            </div>
            <button id="exit-btn" class="primary-btn">
                <svg width="26" height="23" viewBox="0 0 26 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.4375 12.5H7.5C7.14583 12.5 6.84896 12.3802 6.60938 12.1406C6.36979 11.901 6.25 11.6042 6.25 11.25C6.25 10.8958 6.36979 10.599 6.60938 10.3594C6.84896 10.1198 7.14583 10 7.5 10H21.4375L20.375 8.9375C20.125 8.6875 20.0052 8.39583 20.0156 8.0625C20.026 7.72917 20.1458 7.4375 20.375 7.1875C20.625 6.9375 20.9219 6.80729 21.2656 6.79688C21.6094 6.78646 21.9062 6.90625 22.1562 7.15625L25.375 10.375C25.625 10.625 25.75 10.9167 25.75 11.25C25.75 11.5833 25.625 11.875 25.375 12.125L22.1562 15.3438C21.9062 15.5938 21.6094 15.7135 21.2656 15.7031C20.9219 15.6927 20.625 15.5625 20.375 15.3125C20.1458 15.0625 20.026 14.7708 20.0156 14.4375C20.0052 14.1042 20.125 13.8125 20.375 13.5625L21.4375 12.5ZM15 6.25V2.5H2.5V20H15V16.25C15 15.8958 15.1198 15.599 15.3594 15.3594C15.599 15.1198 15.8958 15 16.25 15C16.6042 15 16.901 15.1198 17.1406 15.3594C17.3802 15.599 17.5 15.8958 17.5 16.25V20C17.5 20.6875 17.2552 21.276 16.7656 21.7656C16.276 22.2552 15.6875 22.5 15 22.5H2.5C1.8125 22.5 1.22396 22.2552 0.734375 21.7656C0.244792 21.276 0 20.6875 0 20V2.5C0 1.8125 0.244792 1.22396 0.734375 0.734375C1.22396 0.244792 1.8125 0 2.5 0H15C15.6875 0 16.276 0.244792 16.7656 0.734375C17.2552 1.22396 17.5 1.8125 17.5 2.5V6.25C17.5 6.60417 17.3802 6.90104 17.1406 7.14062C16.901 7.38021 16.6042 7.5 16.25 7.5C15.8958 7.5 15.599 7.38021 15.3594 7.14062C15.1198 6.90104 15 6.60417 15 6.25Z"/>
                </svg>
                Exit game
            </button>
        </section>
    `;
}

/**
 * Returns the "Game over" end screen with the final score of both players.
 *
 * @param theme - Active theme (for the player icons).
 * @param scoreOne - Blue player's score.
 * @param scoreTwo - Orange player's score.
 * @returns The game-over screen HTML.
 */
export function returnGameOverScreen(theme: Theme, scoreOne: number, scoreTwo: number): string {
    return `
        <div class="endscreen endscreen--gameover">
            <h1 class="endscreen__title">GAME OVER</h1>
            <p class="endscreen__label">Final score</p>
            <div class="final-score">
                <span class="final-score__item final-score__item--one">
                    <img src="/assets/themes/${theme}/player-one.svg" alt="" /> Blue <b>${scoreOne}</b>
                </span>
                <span class="final-score__item final-score__item--two">
                    <img src="/assets/themes/${theme}/player-two.svg" alt="" /> Orange <b>${scoreTwo}</b>
                </span>
            </div>
        </div>
    `;
}

/**
 * Returns the result end screen: the winner ("The winner is ... Player") or a
 * draw, with the themed graphic and a button back to the menu. The code_vibes
 * theme adds confetti for a win.
 *
 * @param theme - Active theme (for the result asset).
 * @param result - `'one'` / `'two'` for a winner, or `'draw'`.
 * @returns The result screen HTML.
 */
export function returnResultScreen(theme: Theme, result: 'one' | 'two' | 'draw'): string {
    const isDraw = result === 'draw';
    const label = isDraw ? "It's a" : 'The winner is';
    const title = isDraw ? 'DRAW' : result === 'one' ? 'Blue Player' : 'Orange Player';
    const titleClass = isDraw ? '' : ` endscreen__title--player-${result}`;
    const image = isDraw ? 'draw.svg' : `player-${result}-won.svg`;
    const confetti =
        theme === 'code_vibes' && !isDraw
            ? `<img class="endscreen__confetti" src="/assets/themes/code_vibes/Confetti.svg" alt="" />`
            : '';
    const buttonText = theme === 'code_vibes' ? 'Back to start' : 'Home';

    return `
        <div class="endscreen endscreen--result">
            ${confetti}
            <p class="endscreen__label">${label}</p>
            <h1 class="endscreen__title${titleClass}">${title}</h1>
            <img class="endscreen__graphic" src="/assets/themes/${theme}/${image}" alt="" />
            <button id="play-again-btn" type="button">${buttonText}</button>
        </div>
    `;
}
