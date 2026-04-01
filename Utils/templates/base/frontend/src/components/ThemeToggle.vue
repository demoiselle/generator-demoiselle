<template>
  <button
    class="theme-toggle"
    @click="themeStore.toggle()"
    :aria-label="$t('theme.toggle')"
    :title="$t('theme.toggle')"
  >
    <span v-if="themeStore.current === 'light'" class="theme-icon">🌙</span>
    <span v-else class="theme-icon">☀️</span>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  font-size: 1.15rem;
  padding: 8px;
  color: var(--text-primary);
  border-radius: 6px;
  transition: background-color 0.15s;
}

.theme-toggle:hover {
  background-color: var(--bg-secondary);
}
</style>
