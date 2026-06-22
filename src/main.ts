/**
 * Application entry point.
 *
 * Loads the styles and theme switcher, fills the theme-bound icons, renders the
 * board preview and colors the current-player icon.
 *
 * @module main
 */

import './styles/main.scss';
import './theme-switcher';
import { initBoardPreview } from './js/board';

/** Theme currently set on `<html data-theme>`. */
const theme: string | undefined = document.documentElement.dataset.theme;

/** Background rect of the current-player icon, tinted with the player color. */
const currentPlayerIcon = document.querySelector<SVGRectElement>('#current-player--icon rect');

/** CSS custom property holding the active player's color. */
let currentPlayer: string = "--color-player-two";

/**
 * Fills every theme-bound icon (those carrying `data-file-name`) with the
 * matching asset of the active theme. Board cards set their own sources in
 * {@link module:board}.
 */
document.querySelectorAll<HTMLImageElement>('img[data-file-name]').forEach(icon => {
    const file: string | undefined = icon.dataset.fileName;

    icon.src = `/assets/themes/${theme}/${file}`;
});

initBoardPreview();

if (currentPlayerIcon) {
    currentPlayerIcon.style.cssText = `fill: var(${currentPlayer})`;
}
