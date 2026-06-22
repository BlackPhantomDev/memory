/**
 * Screen controller.
 *
 * Renders the templates into `#play-area` and drives the flow
 * Start → Main menu → Game. Holds the menu selection state.
 *
 * @module screens
 */

import { themePreviewSrc, THEMES, type Theme } from './board';
import { initGame } from './game';
import {
    returnStartScreen,
    returnMainMenu,
    returnPlayingHeader,
    type MenuState,
} from './templates';

/** Current menu selection. */
const state: MenuState = {
    player: 'one',
    theme: 'code_vibes',
    cards: 16,
};

/**
 * Returns the screen container element.
 *
 * @returns The `#play-area` element.
 */
function playArea(): HTMLElement {
    return document.querySelector<HTMLElement>('#play-area')!;
}

/**
 * Replaces the screen container's content.
 *
 * @param html - Markup to render.
 */
function mount(html: string): void {
    playArea().innerHTML = html;
}

/**
 * Applies a theme to the document so themed CSS variables and assets take
 * effect across menu preview and game.
 *
 * @param theme - Theme to apply.
 */
function applyTheme(theme: Theme): void {
    document.documentElement.dataset.theme = theme;
}

/**
 * Renders the start screen and wires the play button to the main menu.
 */
function showStart(): void {
    document.body.classList.remove('menu-open');
    mount(returnStartScreen());
    document.querySelector('#play-btn')?.addEventListener('click', showMenu);
}

/**
 * Renders the main menu (on a neutral light background) and wires the selection
 * inputs and the start button.
 */
function showMenu(): void {
    document.body.classList.add('menu-open');
    mount(returnMainMenu(state));
    syncSummary();

    const form = document.querySelector<HTMLFormElement>('#main-menu');
    form?.addEventListener('change', onMenuChange);
    form?.addEventListener('submit', e => {
        e.preventDefault();
        showGame();
    });
}

/**
 * Updates the selection state from a changed input, swaps the preview image on
 * a theme change and refreshes the summary bar.
 *
 * @param e - The change event from the menu form.
 */
function onMenuChange(e: Event): void {
    const input = e.target as HTMLInputElement;

    if (input.name === 'player') state.player = input.value as MenuState['player'];
    if (input.name === 'board-size') state.cards = Number(input.value);
    if (input.name === 'theme') {
        state.theme = input.value as Theme;
        const preview = document.querySelector<HTMLImageElement>('#theme-preview');
        if (preview) preview.src = themePreviewSrc(state.theme);
    }

    syncSummary();
}

/**
 * Writes the current selection (theme, player, board size) into the summary bar.
 */
function syncSummary(): void {
    const themeLabel = THEMES.find(t => t.id === state.theme)?.label ?? '';
    setText('#summary-theme', themeLabel);
    setText('#summary-player', state.player === 'one' ? 'Blue' : 'Orange');
    setText('#summary-size', `${state.cards} cards`);
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
 * Renders the game screen: header and board container, fills the themed icons,
 * starts the match logic and wires the exit button back to the menu.
 */
function showGame(): void {
    document.body.classList.remove('menu-open');
    applyTheme(state.theme);
    mount(returnPlayingHeader() + '<section id="memory-board"></section>');

    fillThemeIcons();
    initGame({
        pairs: state.cards / 2,
        theme: state.theme,
        startingPlayer: state.player,
        onRestart: showMenu,
    });

    document.querySelector('#exit-btn')?.addEventListener('click', showMenu);
}

/**
 * Fills every theme-bound icon (those carrying `data-file-name`) with the
 * matching asset of the active theme.
 */
function fillThemeIcons(): void {
    document.querySelectorAll<HTMLImageElement>('img[data-file-name]').forEach(icon => {
        icon.src = `/assets/themes/${state.theme}/${icon.dataset.fileName}`;
    });
}

/**
 * Boots the app on the start screen.
 */
export function initApp(): void {
    showStart();
}
