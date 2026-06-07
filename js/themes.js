// js/themes.js

const THEMES = {
  light: {
    name: '极简白',
    vars: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f9fafb',
      '--text-primary': '#111827',
      '--text-secondary': '#6b7280',
      '--border-color': '#e5e7eb',
      '--accent-color': '#3b82f6',
      '--card-bg': '#ffffff',
      '--card-shadow': '0 1px 3px rgba(0,0,0,0.1)',
    }
  },
  dark: {
    name: '暗色主题',
    vars: {
      '--bg-primary': '#1a1a2e',
      '--bg-secondary': '#16213e',
      '--text-primary': '#e2e8f0',
      '--text-secondary': '#94a3b8',
      '--border-color': '#334155',
      '--accent-color': '#60a5fa',
      '--card-bg': '#1e293b',
      '--card-shadow': '0 1px 3px rgba(0,0,0,0.3)',
    }
  },
  gradient: {
    name: '渐变毛玻璃',
    vars: {
      '--bg-primary': 'linear-gradient(135deg, #667eea, #764ba2)',
      '--bg-secondary': 'rgba(255, 255, 255, 0.1)',
      '--text-primary': '#ffffff',
      '--text-secondary': 'rgba(255, 255, 255, 0.8)',
      '--border-color': 'rgba(255, 255, 255, 0.2)',
      '--accent-color': '#a78bfa',
      '--card-bg': 'rgba(255, 255, 255, 0.1)',
      '--card-shadow': '0 4px 30px rgba(0, 0, 0, 0.1)',
    }
  }
};

const THEME_STORAGE_KEY = 'qrcode-toolkit-theme';

/**
 * 应用主题
 * @param {string} themeName - 'light' | 'dark' | 'gradient'
 */
function setTheme(themeName) {
  const theme = THEMES[themeName];
  if (!theme) return;

  const root = document.documentElement;
  root.setAttribute('data-theme', themeName);
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // 渐变主题需要特殊处理 body 背景
  if (themeName === 'gradient') {
    document.body.style.background = theme.vars['--bg-primary'];
  } else {
    document.body.style.background = '';
  }

  localStorage.setItem(THEME_STORAGE_KEY, themeName);
}

/**
 * 获取当前主题名称
 * @returns {string}
 */
function getCurrentTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
}

/**
 * 初始化主题（页面加载时调用）
 */
function initTheme() {
  setTheme(getCurrentTheme());
}
