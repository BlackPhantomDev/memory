/**
 * Public asset path helper.
 *
 * @module assets
 */

/**
 * Resolves a public asset path against Vite's configured base URL, so assets
 * load relative to wherever the app is deployed (e.g. a subfolder on a server).
 *
 * @param path - Asset path relative to the project root, e.g. `assets/icons/x.svg`.
 * @returns The base-prefixed URL.
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}
