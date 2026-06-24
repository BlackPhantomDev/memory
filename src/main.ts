/**
 * Application entry point.
 *
 * Loads the styles, wires the imprint dialog and boots the screen flow.
 *
 * @module main
 */

import './styles/main.scss';
import { initApp } from './js/screens';
import { initImprint } from './js/imprint';

initApp();
initImprint();
