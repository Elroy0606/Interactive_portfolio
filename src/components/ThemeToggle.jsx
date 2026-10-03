import { Moon, Sun, SunDim } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { THEMES, saveTheme } from '../theme/theme';
import { sfx } from '../lib/sound';

export const THEME_ICONS = { night: Moon, dim: SunDim, day: Sun };

// Three-button switch between the visual themes: Night / Dim / Day. All names
// stay visible from `sm` up (icons only on phones), the active one is marked
// with aria-pressed, and all of its colours come from tokens, so the control
// restyles itself with the theme it switches to.
// `data-helper` is the hook the helper bot points at (data/helper.js).
export default function ThemeToggle() {
  const { state, dispatch } = useApp();
  return (
    <div role="group" aria-label="Visual theme" data-helper="theme-toggle" className="theme-toggle">
      {THEMES.map((t) => {
        const Icon = THEME_ICONS[t.icon];
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={state.theme === t.id}
            aria-label={`${t.label} mode`}
            title={`${t.label} mode: ${t.hint}`}
            onClick={() => {
              sfx.click();
              saveTheme(t.id); // only an explicit choice is remembered
              dispatch({ type: 'SET_THEME', theme: t.id });
            }}
          >
            <Icon size={12} aria-hidden />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
