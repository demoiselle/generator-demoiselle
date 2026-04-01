import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useApi } from '@/composables/useApi';

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([]);
  const loading = ref(false);

  const unreadCount = computed(() =>
    notifications.value.filter((n) => !n.read).length
  );

  async function fetchNotifications() {
    loading.value = true;
    try {
      const api = useApi();
      const response = await api.get('/api/notifications');
      notifications.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function markAsRead(id) {
    const api = useApi();
    await api.put(`/api/notifications/${id}/read`);
    const notification = notifications.value.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead
  };
});
