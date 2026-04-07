import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const current = ref(localStorage.getItem('theme') || 'light');

  function initTheme() {
    applyTheme(current.value);
  }

  function toggle() {
    const next = current.value === 'light' ? 'dark' : 'light';
    setTheme(next);
  }

  function setTheme(theme) {
    current.value = theme;
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  return {
    current,
    initTheme,
    toggle,
    setTheme
  };
});
