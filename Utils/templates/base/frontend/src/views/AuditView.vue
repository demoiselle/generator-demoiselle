<template>
  <div class="audit-view">
    <h1 class="page-title">{{ $t('audit.title') }}</h1>
    <div class="audit-filters">
      <div class="filter-group">
        <label for="filterEntity">{{ $t('audit.filterEntity') }}</label>
        <input
          id="filterEntity"
          v-model="filters.entityName"
          type="text"
          :placeholder="$t('audit.filterEntityPlaceholder')"
        />
      </div>
      <div class="filter-group">
        <label for="filterUser">{{ $t('audit.filterUser') }}</label>
        <input
          id="filterUser"
          v-model="filters.userId"
          type="text"
          :placeholder="$t('audit.filterUserPlaceholder')"
        />
      </div>
      <div class="filter-group">
        <label for="filterDateFrom">{{ $t('audit.filterDateFrom') }}</label>
        <input
          id="filterDateFrom"
          v-model="filters.dateFrom"
          type="date"
        />
      </div>
      <div class="filter-group">
        <label for="filterDateTo">{{ $t('audit.filterDateTo') }}</label>
        <input
          id="filterDateTo"
          v-model="filters.dateTo"
          type="date"
        />
      </div>
      <button class="btn btn-primary filter-btn" @click="applyFilters">
        {{ $t('audit.applyFilters') }}
      </button>
    </div>

    <div v-if="loading" class="audit-loading">{{ $t('common.loading') }}</div>
    <div v-else-if="logs.length === 0" class="audit-empty">{{ $t('audit.empty') }}</div>
    <div v-else class="audit-table-wrapper">
      <table class="audit-table">
        <thead>
          <tr>
            <th>{{ $t('audit.columns.timestamp') }}</th>
            <th>{{ $t('audit.columns.action') }}</th>
            <th>{{ $t('audit.columns.entityName') }}</th>
            <th>{{ $t('audit.columns.entityId') }}</th>
            <th>{{ $t('audit.columns.userId') }}</th>
            <th>{{ $t('audit.columns.changes') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ formatDate(log.timestamp) }}</td>
            <td>
              <span class="action-badge" :class="log.action?.toLowerCase()">
                {{ log.action }}
              </span>
            </td>
            <td>{{ log.entityName }}</td>
            <td class="mono">{{ log.entityId }}</td>
            <td>{{ log.userId }}</td>
            <td>
              <button
                v-if="log.changes"
                class="btn-link"
                @click="showChanges(log)"
              >
                {{ $t('audit.viewChanges') }}
              </button>
              <span v-else class="text-muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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

    <div v-if="selectedLog" class="modal-overlay" @click.self="selectedLog = null">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ $t('audit.changesTitle') }}</h2>
          <button class="modal-close" @click="selectedLog = null">&times;</button>
        </div>
        <pre class="modal-body">{{ formatChanges(selectedLog.changes) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';

const { t } = useI18n();
const api = useApi();

const logs = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;
const totalPages = ref(1);
const selectedLog = ref(null);

const filters = reactive({
  entityName: '',
  userId: '',
  dateFrom: '',
  dateTo: ''
});

async function fetchLogs() {
  loading.value = true;
  try {
    const params = { page: page.value, size: pageSize };
    if (filters.entityName) params.entityName = filters.entityName;
    if (filters.userId) params.userId = filters.userId;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;

    const response = await api.get('/api/audit', { params });
    logs.value = response.data.content || response.data;
    totalPages.value = response.data.totalPages || 1;
  } catch {
    logs.value = [];
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  page.value = 1;
  fetchLogs();
}

function goToPage(p) {
  page.value = p;
  fetchLogs();
}

function showChanges(log) {
  selectedLog.value = log;
}

function formatChanges(changes) {
  if (!changes) return '';
  try {
    const parsed = typeof changes === 'string' ? JSON.parse(changes) : changes;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return changes;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString();
}

onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.audit-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.audit-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 160px;
}

.filter-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.filter-group input {
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.85rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.filter-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.filter-btn {
  align-self: flex-end;
  white-space: nowrap;
}

.audit-loading,
.audit-empty {
  text-align: center;
  padding: 48px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.audit-table-wrapper {
  overflow-x: auto;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.audit-table th,
.audit-table td {
  padding: 10px 14px;
  text-align: left;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--border-color);
}

.audit-table th {
  background-color: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.audit-table td {
  color: var(--text-primary);
}

.mono {
  font-family: monospace;
  font-size: 0.8rem;
}

.action-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.action-badge.create {
  background-color: #d1fae5;
  color: #065f46;
}

.action-badge.update {
  background-color: #dbeafe;
  color: #1e40af;
}

.action-badge.delete {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.text-muted {
  color: var(--text-secondary);
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

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
}

.btn-primary:hover {
  opacity: 0.9;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.modal {
  background-color: var(--bg-card);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  font-size: 0.8rem;
  font-family: monospace;
  white-space: pre-wrap;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  margin: 0;
}
</style>
