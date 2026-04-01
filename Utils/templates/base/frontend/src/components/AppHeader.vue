<template>
  <header class="app-header">
    <button class="menu-toggle" @click="$emit('toggle-sidebar')" :aria-label="$t('header.toggleMenu')">
      <span class="menu-icon">☰</span>
    </button>
    <div class="header-spacer"></div>
    <div class="header-actions">
      <NotificationBell />
      <LanguageSelector />
      <ThemeToggle />
      <div class="avatar" :title="user?.name || $t('header.profile')">
        <span class="avatar-initials">{{ initials }}</span>
      </div>
      <button class="logout-btn" @click="logout" :aria-label="$t('header.logout')">
        ⏻
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAuth } from '@/composables/useAuth';
import NotificationBell from '@/components/NotificationBell.vue';
import LanguageSelector from '@/components/LanguageSelector.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

defineEmits(['toggle-sidebar']);

const authStore = useAuthStore();
const { logout } = useAuth();

const user = computed(() => authStore.user);
const initials = computed(() => {
  const name = user.value?.name || '';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-primary);
  padding: 8px;
}

.header-spacer {
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-initials {
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

.logout-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: var(--text-secondary);
  padding: 8px;
}

.logout-btn:hover {
  color: var(--color-primary);
}
</style>
