<template>
  <router-view />
</template>

<script setup>
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
themeStore.initTheme();
</script>
