<template>
  <div class="notification-bell" ref="bellRef">
    <button
      class="bell-btn"
      @click="toggleDropdown"
      :aria-label="$t('notifications.bell')"
    >
      <span class="bell-icon">🔔</span>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>
    <div v-if="open" class="dropdown">
      <div class="dropdown-header">
        <span class="dropdown-title">{{ $t('notifications.title') }}</span>
        <router-link to="/notifications" class="view-all" @click="open = false">
          {{ $t('notifications.viewAll') }}
        </router-link>
      </div>
      <div v-if="loading" class="dropdown-loading">{{ $t('common.loading') }}</div>
      <ul v-else-if="notifications.length" class="dropdown-list">
        <li
          v-for="n in notifications.slice(0, 5)"
          :key="n.id"
          class="dropdown-item"
          :class="{ unread: !n.read }"
          @click="markRead(n)"
        >
          <span class="item-type" :class="n.type?.toLowerCase()">●</span>
          <div class="item-content">
            <span class="item-title">{{ n.title }}</span>
            <span class="item-time">{{ formatTime(n.createdAt) }}</span>
          </div>
        </li>
      </ul>
      <div v-else class="dropdown-empty">{{ $t('notifications.empty') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';

const store = useNotificationsStore();
const open = ref(false);
const bellRef = ref(null);

const notifications = computed(() => store.notifications);
const unreadCount = computed(() => store.unreadCount);
const loading = computed(() => store.loading);

function toggleDropdown() {
  open.value = !open.value;
  if (open.value) {
    store.fetchNotifications();
  }
}

function markRead(notification) {
  if (!notification.read) {
    store.markAsRead(notification.id);
  }
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function handleClickOutside(e) {
  if (bellRef.value && !bellRef.value.contains(e.target)) {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  store.fetchNotifications();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 8px;
  position: relative;
  color: var(--text-primary);
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow);
  z-index: 200;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.view-all {
  font-size: 0.8rem;
  color: var(--color-primary);
}

.dropdown-list {
  list-style: none;
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-item:hover {
  background-color: var(--bg-secondary);
}

.dropdown-item.unread {
  background-color: var(--bg-secondary);
}

.item-type.info { color: var(--color-primary); }
.item-type.warning { color: #f59e0b; }
.item-type.error { color: #ef4444; }

.item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-title {
  font-size: 0.85rem;
  color: var(--text-primary);
}

.item-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.dropdown-loading,
.dropdown-empty {
  padding: 24px 16px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
</style>
