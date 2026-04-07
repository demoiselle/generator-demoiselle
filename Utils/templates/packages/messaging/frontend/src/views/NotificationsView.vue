<template>
  <div class="notifications-view">
    <h1 class="page-title">{{ $t('notifications.title') }}</h1>
    <div v-if="loading && notifications.length === 0" class="notifications-loading">
      {{ $t('common.loading') }}
    </div>
    <div v-else-if="notifications.length === 0" class="notifications-empty">
      {{ $t('notifications.empty') }}
    </div>
    <ul v-else class="notifications-list">
      <li
        v-for="n in notifications"
        :key="n.id"
        class="notification-item"
        :class="{ unread: !n.read }"
      >
        <div class="notification-indicator">
          <span class="type-dot" :class="n.type?.toLowerCase()">●</span>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">{{ n.title }}</span>
            <span class="notification-time">{{ formatTime(n.createdAt) }}</span>
          </div>
          <p class="notification-message">{{ n.message }}</p>
        </div>
        <button
          v-if="!n.read"
          class="mark-read-btn"
          :title="$t('notifications.markAsRead')"
          @click="markRead(n.id)"
        >
          ✓
        </button>
      </li>
    </ul>

    <div v-if="totalPages > 1" class="pagination">
      <button
        class="btn btn-secondary"
        :disabled="page <= 1"
        @click="goToPage(page - 1)"
      >
        {{ $t('common.previous') }}
      </button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button
        class="btn btn-secondary"
        :disabled="page >= totalPages"
        @click="goToPage(page + 1)"
      >
        {{ $t('common.next') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';

const { t } = useI18n();
const api = useApi();

const notifications = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;
const totalPages = ref(1);

async function fetchNotifications() {
  loading.value = true;
  try {
    const response = await api.get('/api/notifications', {
      params: { page: page.value, size: pageSize }
    });
    notifications.value = response.data.content || response.data;
    totalPages.value = response.data.totalPages || 1;
  } catch {
    notifications.value = [];
  } finally {
    loading.value = false;
  }
}

async function markRead(id) {
  try {
    await api.put(`/api/notifications/${id}/read`);
    const notification = notifications.value.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  } catch {
    // silent
  }
}

function goToPage(p) {
  page.value = p;
  fetchNotifications();
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString();
}

onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.notifications-view {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.notifications-loading,
.notifications-empty {
  text-align: center;
  padding: 48px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.notifications-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.notification-item.unread {
  border-left: 3px solid var(--color-primary);
  background-color: var(--bg-secondary);
}

.notification-indicator {
  padding-top: 2px;
}

.type-dot {
  font-size: 0.7rem;
}

.type-dot.info { color: var(--color-primary); }
.type-dot.warning { color: #f59e0b; }
.type-dot.error { color: #ef4444; }

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 4px;
}

.notification-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.notification-message {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.mark-read-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
}

.mark-read-btn:hover {
  background-color: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.page-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--border-color);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
