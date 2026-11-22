/* Light/dark theme.
   Follows the system setting until the visitor picks one with the toggle.
   The choice is stored in localStorage and applied as <html data-theme="…">
   (an inline script in index.html applies it before the first paint). */

const STORAGE_KEY = "theme";
const root = document.documentElement;
const systemDark = matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set();

const systemTheme = () => (systemDark.matches ? "dark" : "light");
const notify = () => listeners.forEach((fn) => fn(getTheme()));

function store(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked (private mode etc.): the choice just won't be remembered */
  }
}

/** The theme currently shown: "light" | "dark". */
export function getTheme() {
  return root.dataset.theme ?? systemTheme();
}

/** Switch theme. Picking the system's own theme drops the override, so the page follows the system again. */
export function setTheme(theme) {
  if (theme === systemTheme()) {
    delete root.dataset.theme;
    store(null);
  } else {
    root.dataset.theme = theme;
    store(theme);
  }
  notify();
}

/** Call `fn(theme)` whenever the shown theme changes (toggle or system change). */
export function onThemeChange(fn) {
  listeners.add(fn);
}

systemDark.addEventListener("change", notify);
