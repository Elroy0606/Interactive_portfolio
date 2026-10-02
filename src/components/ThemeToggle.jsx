import { useApp } from '../state/AppContext';
import { THEMES, saveTheme } from '../theme/theme';
import { sfx } from '../lib/sound';

// Two-button switch between the visual themes. Both names stay visible, the
// active one is marked with aria-pressed, and all of its colours come from
// tokens, so the control restyles itself with the theme it switches to.
export default function ThemeToggle() {
  const { state, dispatch } = useApp();
  return (
    <div role="group" aria-label="Visual theme" className="theme-toggle">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={state.theme === t.id}
          onClick={() => {
            sfx.click();
            saveTheme(t.id); // only an explicit choice is remembered
            dispatch({ type: 'SET_THEME', theme: t.id });
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
