const THEME_KEYS = {
  hawker: 'hawker-theme',
  buyer: 'buyer-theme',
};

const applyThemeClass = (isDark) => {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('dark-mode', isDark);
  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
};

export const HAWKER_THEME_KEY = THEME_KEYS.hawker;
export const BUYER_THEME_KEY = THEME_KEYS.buyer;

export const setThemePreference = (themeKey, isDark) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(themeKey, isDark ? 'dark' : 'light');
  applyThemeClass(isDark);
};

export const syncThemeFromStorage = (themeKey, options = {}) => {
  if (typeof window === 'undefined') return false;
  const { respectExisting = false } = options;
  const savedTheme = localStorage.getItem(themeKey);

  if (savedTheme === null && respectExisting) {
    const currentIsDark = document.body.classList.contains('dark-mode');
    document.documentElement.setAttribute('data-bs-theme', currentIsDark ? 'dark' : 'light');
    return currentIsDark;
  }

  const isDark = savedTheme === 'dark';
  applyThemeClass(isDark);
  return isDark;
};

