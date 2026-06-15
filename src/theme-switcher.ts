const THEMES = ['code_vibes', 'games', 'da_projects', 'food'] as const;

function initThemeSwitcher() {
    const bar = document.createElement('div');
    bar.style.cssText =
        'position:fixed;bottom:8px;right:8px;z-index:9999;display:flex;gap:4px;';

    // Dropdown
    const select = document.createElement('select');
    select.style.cssText = 'padding:4px 8px;font:12px sans-serif;cursor:pointer;';


    THEMES.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme;
        option.textContent = theme;
        select.append(option);
    });

    // aktuelles Theme vorauswählen
    const current = document.documentElement.dataset.theme;
    if (current) select.value = current;

    select.addEventListener('change', () => {
        document.documentElement.dataset.theme = select.value;
    });

    bar.append(select);
    document.body.append(bar);
}

initThemeSwitcher();