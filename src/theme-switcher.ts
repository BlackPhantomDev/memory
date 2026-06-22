/**
 * Development-only theme switcher.
 *
 * Adds a small fixed dropdown that updates `<html data-theme>`, which in turn
 * drives the themed CSS variables and triggers a board redraw.
 *
 * @module theme-switcher
 */

/** Selectable themes, in the order shown in the dropdown. */
const THEMES = ['code_vibes', 'games', 'da_projects', 'food'] as const;

/**
 * Builds the theme dropdown, preselects the active theme and writes the chosen
 * value back to `<html data-theme>` on change, then mounts it to the page.
 */
function initThemeSwitcher() {
    const bar = document.createElement('div');
    bar.style.cssText =
        'position:fixed;bottom:8px;right:8px;z-index:9999;display:flex;gap:4px;';

    const select = document.createElement('select');
    select.style.cssText = 'padding:4px 8px;font:12px sans-serif;cursor:pointer;';

    THEMES.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme;
        select.append(option);
    });

    const current = document.documentElement.dataset.theme;
    if (current) select.value = current;

    select.addEventListener('change', () => {
        document.documentElement.dataset.theme = select.value;
    });

    bar.append(select);
    document.body.append(bar);
}

initThemeSwitcher();
