/**
 * Screen controller.
 *
 * Renders the templates into `#play-area` and drives the flow
 * Start → Main menu → Game. Holds the menu selection state.
 *
 * @module screens
 */

import { asset } from './assets';
import { themePreviewSrc, THEMES, type Theme } from './board';
import { initGame } from './game';
import {
  returnStartScreen,
  returnMainMenu,
  returnPlayingHeader,
  returnExitDialog,
  type MenuState,
} from './templates';

/** Current menu selection. Nothing is preselected; the user picks each value. */
const state: MenuState = {
  player: null,
  theme: null,
  cards: null,
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
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isComplete(state)) showGame(state);
  });

  wireThemeHover();
}

/**
 * Shows each theme's preview while its option is hovered. The preview is left on
 * the last hovered theme (no revert on mouse-out) so it doesn't jump back.
 */
function wireThemeHover(): void {
  const preview = document.querySelector<HTMLImageElement>('#theme-preview');
  if (!preview) return;

  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((input) => {
    input.closest('.option')?.addEventListener('mouseenter', () => {
      preview.src = themePreviewSrc(input.value as Theme);
    });
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

/** Menu selection with every value chosen (no `null`s). */
type CompleteMenuState = { [K in keyof MenuState]: NonNullable<MenuState[K]> };

/**
 * Reports whether every setting has been chosen, narrowing the state so the
 * game can be started with non-null values.
 *
 * @param s - Current menu selection.
 * @returns `true` when theme, player and board size are all set.
 */
function isComplete(s: MenuState): s is CompleteMenuState {
  return s.theme !== null && s.player !== null && s.cards !== null;
}

/**
 * Writes the current selection into the summary bar, showing a placeholder
 * label for each value that has not been chosen yet, and enables the start
 * button only once everything is selected.
 */
function syncSummary(): void {
  const themeLabel = state.theme ? (THEMES.find((t) => t.id === state.theme)?.label ?? '') : '';
  setText('#summary-theme', themeLabel || 'Game theme');
  setText('#summary-player', state.player ? (state.player === 'one' ? 'Blue' : 'Orange') : 'Player');
  setText('#summary-size', state.cards ? `${state.cards} cards` : 'Board size');

  const startBtn = document.querySelector<HTMLButtonElement>('#start-btn');
  if (startBtn) startBtn.disabled = !isComplete(state);
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
 * Renders the game screen: header, board container and exit dialog, fills the
 * themed icons, starts the match logic and wires the exit confirmation.
 */
function showGame(selection: CompleteMenuState): void {
  document.body.classList.remove('menu-open');
  applyTheme(selection.theme);
  mount(
    returnPlayingHeader() +
      '<section id="memory-board"></section>' +
      returnExitDialog(selection.theme),
  );

  fillThemeIcons(selection.theme);
  initGame({
    pairs: selection.cards / 2,
    theme: selection.theme,
    startingPlayer: selection.player,
    onRestart: showMenu,
  });
  wireExitDialog();
}

/**
 * Wires the exit confirmation dialog: the header button opens it, "back to
 * game" / a backdrop click closes it, and confirming returns to the menu.
 */
function wireExitDialog(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#exit-dialog');

  document.querySelector('#exit-btn')?.addEventListener('click', () => dialog?.showModal());
  document.querySelector('#exit-cancel')?.addEventListener('click', () => dialog?.close());
  document.querySelector('#exit-confirm')?.addEventListener('click', () => {
    dialog?.close();
    showMenu();
  });
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}

/**
 * Fills every theme-bound icon (those carrying `data-file-name`) with the
 * matching asset of the given theme.
 *
 * @param theme - Theme whose assets the icons are filled from.
 */
function fillThemeIcons(theme: Theme): void {
  document.querySelectorAll<HTMLImageElement>('img[data-file-name]').forEach((icon) => {
    icon.src = asset(`assets/themes/${theme}/${icon.dataset.fileName}`);
  });
}

/**
 * Boots the app on the start screen.
 */
export function initApp(): void {
  showStart();
}
