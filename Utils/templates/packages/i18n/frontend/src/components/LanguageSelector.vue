<template>
  <div class="language-selector" ref="selectorRef">
    <button
      class="lang-btn"
      @click="open = !open"
      :aria-label="$t('language.select')"
    >
      <span class="lang-flag">{{ currentFlag }}</span>
      <span class="lang-code">{{ locale.toUpperCase() }}</span>
    </button>
    <ul v-if="open" class="lang-dropdown" role="listbox">
      <li
        v-for="lang in languages"
        :key="lang.code"
        class="lang-option"
        :class="{ active: locale === lang.code }"
        role="option"
        :aria-selected="locale === lang.code"
        @click="selectLanguage(lang.code)"
      >
        <span class="lang-flag">{{ lang.flag }}</span>
        <span>{{ lang.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const open = ref(false);
const selectorRef = ref(null);

const languages = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

const currentFlag = computed(() => {
  const lang = languages.find((l) => l.code === locale.value);
  return lang ? lang.flag : '🌐';
});

function selectLanguage(code) {
  locale.value = code;
  localStorage.setItem('locale', code);
  open.value = false;
}

function handleClickOutside(e) {
  if (selectorRef.value && !selectorRef.value.contains(e.target)) {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.language-selector {
  position: relative;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 6px 8px;
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
}

.lang-btn:hover {
  background-color: var(--bg-secondary);
}

.lang-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  list-style: none;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow);
  z-index: 200;
  min-width: 150px;
  overflow: hidden;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.lang-option:hover {
  background-color: var(--bg-secondary);
}

.lang-option.active {
  color: var(--color-primary);
  font-weight: 600;
}

.lang-flag {
  font-size: 1.1rem;
}

.lang-code {
  font-weight: 500;
}
</style>
