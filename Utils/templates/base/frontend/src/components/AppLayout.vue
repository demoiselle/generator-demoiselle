<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <span class="sidebar-logo">{{ $t('app.name') }}</span>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ $t(item.label) }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <span class="sidebar-version">v1.0.0</span>
      </div>
    </aside>
    <div class="main-wrapper">
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="main-content">
        <router-view />
      </main>
      <footer class="app-footer">
        <span>{{ $t('footer.copyright') }}</span>
      </footer>
    </div>
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AppHeader from '@/components/AppHeader.vue';

const authStore = useAuthStore();
const sidebarOpen = ref(true);

const allMenuItems = [
  { to: '/dashboard', icon: '📊', label: 'menu.dashboard' },
  { to: '/notifications', icon: '🔔', label: 'menu.notifications' },
  { to: '/audit', icon: '📋', label: 'menu.audit', roles: ['ADMIN'] }
  // Generated CRUD routes will be added here
];

const menuItems = computed(() =>
  allMenuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some((role) => authStore.hasRole(role));
  })
);
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background-color: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  transition: transform 0.2s ease;
}

.sidebar-collapsed .sidebar {
  transform: translateX(-240px);
}

.sidebar-header {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-logo {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 2px;
}

.nav-item:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item--active {
  background-color: var(--bg-secondary);
  color: var(--color-primary);
  font-weight: 600;
}

.nav-icon {
  font-size: 1.1rem;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.sidebar-version {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.main-wrapper {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.2s ease;
}

.sidebar-collapsed .main-wrapper {
  margin-left: 0;
}

.main-content {
  flex: 1;
  padding: 24px;
}

.app-footer {
  padding: 12px 24px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-240px);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-wrapper {
    margin-left: 0;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
  }
}
</style>
