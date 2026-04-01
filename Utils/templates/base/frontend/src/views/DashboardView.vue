<template>
  <div class="dashboard">
    <h1 class="page-title">{{ $t('dashboard.title') }}</h1>
    <div v-if="loading" class="dashboard-loading">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="dashboard-error">
      <p>{{ $t('dashboard.error') }}</p>
      <button class="btn btn-secondary" @click="fetchStats">{{ $t('common.retry') }}</button>
    </div>
    <div v-else class="stats-grid">
      <div
        v-for="stat in stats"
        :key="stat.entity"
        class="stat-card"
      >
        <div class="stat-icon">{{ stat.icon || '📦' }}</div>
        <div class="stat-info">
          <span class="stat-count">{{ stat.count }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
      <!-- ENTITY_DASHBOARD_CARDS -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';

const { t } = useI18n();
const api = useApi();

const stats = ref([]);
const loading = ref(false);
const error = ref(false);

async function fetchStats() {
  loading.value = true;
  error.value = false;
  try {
    const response = await api.get('/api/dashboard/stats');
    const data = response.data;
    stats.value = Object.entries(data).map(([entity, count]) => ({
      entity,
      count,
      label: t(`dashboard.entities.${entity}`, entity),
      icon: getEntityIcon(entity)
    }));
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function getEntityIcon(entity) {
  const icons = {
    users: '👥',
    notifications: '🔔',
    files: '📁',
    auditLogs: '📋'
  };
  return icons[entity] || '📦';
}

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.dashboard-loading {
  text-align: center;
  padding: 48px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.dashboard-error {
  text-align: center;
  padding: 48px;
  color: var(--text-secondary);
}

.dashboard-error p {
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow);
  transition: transform 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 2px;
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

.btn-secondary:hover {
  background-color: var(--border-color);
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
