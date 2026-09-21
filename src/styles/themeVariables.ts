import { ThemeId, THEMES_LIST } from '../types/themes';

export const DEFAULT_THEME_ID: ThemeId = 'sakura-hill';
export const DEFAULT_GLASS_OPACITY = 70; // 70% opacity

export const applyThemeToDocument = (themeId: ThemeId, opacityPercent: number) => {
  const theme = THEMES_LIST.find((t) => t.id === themeId) || THEMES_LIST[0];
  const root = document.documentElement;

  const opacityDecimal = Math.max(0.15, Math.min(0.98, opacityPercent / 100));
  const blurPx = Math.round(12 + (1 - opacityDecimal) * 16);
  const borderAlpha = (0.08 + (1 - opacityDecimal) * 0.15).toFixed(3);

  root.style.setProperty('--theme-bg', theme.colors.bg);
  root.style.setProperty('--theme-card-rgb', theme.colors.cardRgb);
  root.style.setProperty('--glass-opacity', opacityDecimal.toString());
  root.style.setProperty('--theme-card-bg', `rgba(${theme.colors.cardRgb}, ${opacityDecimal})`);
  root.style.setProperty('--glass-blur', `${blurPx}px`);
  root.style.setProperty('--glass-border', `rgba(255, 255, 255, ${borderAlpha})`);

  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-accent-glow', theme.colors.accentGlow);
  root.style.setProperty('--theme-accent-hover', theme.colors.accentHover);
  root.style.setProperty('--theme-accent-text', theme.colors.accentText);
  root.style.setProperty('--theme-secondary-accent', theme.colors.secondaryAccent);
};
