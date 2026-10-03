// Theme switch: Night / Dim / Day. The visual tokens for each theme live in
// src/index.css (:root = cyberpunk, then the [data-theme="dim"] and
// [data-theme="professional"] blocks); the motion tokens live in ./motion.js.
// This file only holds the names and persistence.
//
//   id (stored, and the data-theme value)   label on the switch
//   cyberpunk                               Night  full cyberpunk look, the default
//   dim                                     Dim    softer dark: no glow, no moving background
//   professional                            Day    light page
//
// The attribute is first set by the inline script in index.html, before the
// stylesheet paints, so there is no flash of the wrong theme on load. Keep the
// storage key and DEFAULT_THEME in sync with that script.
//
// The default is Cyberpunk for everyone who has not picked a theme. It does not
// follow the system light/dark setting. Only a click on the toggle is stored
// (saveTheme), so changing the default later still reaches visitors who never chose.

export const THEME = { CYBERPUNK: 'cyberpunk', DIM: 'dim', PROFESSIONAL: 'professional' };
// `icon` is a key of ICONS in components/ThemeToggle.jsx; `hint` is the tooltip
// and the line the helper bot shows for the mode.
export const THEMES = [
  { id: THEME.CYBERPUNK, label: 'Night', icon: 'night', hint: 'Dark cyberpunk look. This is the default.' },
  { id: THEME.DIM, label: 'Dim', icon: 'dim', hint: 'Softer dark colours, with no glow or moving background.' },
  { id: THEME.PROFESSIONAL, label: 'Day', icon: 'day', hint: 'Light page with dark text.' },
];
export const DEFAULT_THEME = THEME.CYBERPUNK; // first-time visitors
export const THEME_STORAGE_KEY = 'mainframe.theme';

const isTheme = (value) => THEMES.some((t) => t.id === value);

// Whatever index.html already applied (stored choice or the default).
export function readTheme() {
  const applied = document.documentElement.dataset.theme;
  return isTheme(applied) ? applied : DEFAULT_THEME;
}

// Switches the token set. Does not store anything.
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  // Browser chrome colour (mobile address bar) follows the page background token.
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-void').trim();
  if (bg) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
}

// Remembers a choice the visitor made with the toggle.
export function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage blocked: the choice lasts for this page load only */
  }
}
