<template>
  <div class="entity-list">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
    <h1>{{ $t('<%= name.lower %>.title') }}</h1>
<% } else { %>
    <h1><%= name.capital %></h1>
<% } %>

    <AdvancedFilter :fields="filterFields" @filter="onFilter" />

    <div class="list-actions">
      <router-link
        :to="{ name: '<%= name.lower %>-create' }"
        class="btn btn-success"
      >
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
        {{ $t('common.create') }}
<% } else { %>
        Criar
<% } %>
      </router-link>
<% if (typeof packages !== 'undefined' && packages.includes('export')) { %>
      <button class="btn btn-secondary" @click="exportCsv">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
        {{ $t('common.exportCsv') }}
<% } else { %>
        Exportar CSV
<% } %>
      </button>
      <button class="btn btn-secondary" @click="exportPdf">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
        {{ $t('common.exportPdf') }}
<% } else { %>
        Exportar PDF
<% } %>
      </button>
<% } %>
      <button
        class="btn btn-danger"
        :disabled="selecteds.length === 0"
        @click="showDeleteModal = true"
      >
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
        {{ $t('common.removeSelected') }}
<% } else { %>
        Remover Selecionados
<% } %>
      </button>
    </div>

    <div class="card">
      <div class="card-body">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
        <table class="table" role="grid" :aria-label="$t('<%= name.lower %>.title')">
<% } else { %>
        <table class="table" role="grid" aria-label="<%= name.capital %>">
<% } %>
          <thead>
            <tr>
<%_ (properties || []).forEach(function(property) { _%>
              <th scope="col">
<%_ if (!/^id$/i.test(property.name)) { _%>
                <button
                  type="button"
                  class="th-button"
                  @click="orderBy('<%= property.name %>')"
                >
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
                  {{ $t('<%= name.lower %>.fields.<%= property.name %>') }}
<% } else { %>
                  <%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>
<% } %>
                  <span v-if="sortField === '<%= property.name %>'">
                    {{ sortDirection === 'ASC' ? '⇧' : '⇩' }}
                  </span>
                </button>
<%_ } else { _%>
                <input
                  type="checkbox"
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
                  :aria-label="$t('common.selectAll')"
<% } else { %>
                  aria-label="Selecionar Todos"
<% } %>
                  @change="toggleSelectAll($event)"
                />
<%_ } _%>
              </th>
<%_ }); _%>
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              <th scope="col">{{ $t('common.actions') }}</th>
<% } else { %>
              <th scope="col">Ações</th>
<% } %>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
<%_ (properties || []).forEach(function(property) { _%>
<%_ if (/^id$/i.test(property.name)) { _%>
              <td>
                <input
                  type="checkbox"
                  :checked="selecteds.includes(item)"
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
                  :aria-label="$t('common.select')"
<% } else { %>
                  aria-label="Selecionar"
<% } %>
                  @change="toggleSelected(item)"
                />
              </td>
<%_ } else if (property.isPrimitive) { _%>
              <td>{{ item.<%= property.name %> }}</td>
<%_ } else { _%>
              <td>{{ item.<%= property.name %> ? item.<%= property.name %>.description : '' }}</td>
<%_ } _%>
<%_ }); _%>
              <td>
                <router-link
                  class="btn btn-sm btn-primary"
                  :to="{ name: '<%= name.lower %>-edit', params: { id: item.id } }"
                >
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
                  {{ $t('common.edit') }}
<% } else { %>
                  Editar
<% } %>
                </router-link>
                <button
                  class="btn btn-sm btn-danger"
                  @click="confirmDelete(item)"
                >
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
                  {{ $t('common.remove') }}
<% } else { %>
                  Remover
<% } %>
                </button>
              </td>
            </tr>
            <tr v-if="items.length === 0 && !isLoading">
              <td :colspan="columnCount" class="text-center">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
                {{ $t('common.noRecords') }}
<% } else { %>
                Nenhum registro encontrado
<% } %>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="isLoading" class="loading-indicator">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
          {{ $t('common.loading') }}
<% } else { %>
          Carregando...
<% } %>
        </div>

        <div class="pagination-controls" v-if="totalItems > 0">
          <button
            class="btn btn-sm"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            &lsaquo;
          </button>
          <span class="page-info">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            class="btn btn-sm"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            &rsaquo;
          </button>
          <select v-model="itemsPerPage" @change="loadList()" class="page-size-select">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content" role="dialog" :aria-label="$t('common.confirmDelete')">
        <p>{{ $t('common.confirmDeleteMessage') }}</p>
        <div class="modal-actions">
          <button class="btn btn-default" @click="showDeleteModal = false">
            {{ $t('common.no') }}
          </button>
          <button class="btn btn-danger" @click="deleteSelecteds">
            {{ $t('common.yes') }}
          </button>
        </div>
      </div>
    </div>
<% } else { %>
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content" role="dialog" aria-label="Confirmar Exclusão">
        <p>Tem certeza que deseja excluir?</p>
        <div class="modal-actions">
          <button class="btn btn-default" @click="showDeleteModal = false">
            Não
          </button>
          <button class="btn btn-danger" @click="deleteSelecteds">
            Sim
          </button>
        </div>
      </div>
    </div>
<% } %>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
import { useI18n } from 'vue-i18n';
<% } %>
import AdvancedFilter from '@/components/AdvancedFilter.vue';
import { use<%= name.capital %>Service } from './<%= name.lower %>.service';
<% if (typeof packages !== 'undefined' && packages.includes('export')) { %>
import { useExport } from '@/composables/useExport';
<% } %>

<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
const { t } = useI18n();
<% } %>
const service = use<%= name.capital %>Service();
<% if (typeof packages !== 'undefined' && packages.includes('export')) { %>
const { downloadCsv, downloadPdf } = useExport();
<% } %>

const items = ref([]);
const isLoading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const sortField = ref('');
const sortDirection = ref('ASC');
const activeFilters = reactive({});
const selecteds = ref([]);
const showDeleteModal = ref(false);
const deleteTarget = ref(null);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value))
);

const columnCount = computed(() => {
  const propCount = <%= (properties || []).length %>;
  return propCount + 1; // +1 for actions column
});

const filterFields = [
<%_ (properties || []).filter(function(p) { return !p.isReadOnly && !/^id$/i.test(p.name); }).forEach(function(property, index, arr) { _%>
  {
    name: '<%= property.name %>',
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
    label: t('<%= name.lower %>.fields.<%= property.name %>'),
<% } else { %>
    label: '<%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>',
<% } %>
<%_ if (/^(date|localdate|localdatetime)$/i.test(property.type)) { _%>
    type: 'date-range'
<%_ } else if (/^(integer|int|long|double|float|bigdecimal|number|short)$/i.test(property.type)) { _%>
    type: 'number-range'
<%_ } else if (/^boolean$/i.test(property.type)) { _%>
    type: 'boolean'
<%_ } else if (!property.isPrimitive) { _%>
    type: 'select',
    options: []
<%_ } else { _%>
    type: 'text'
<%_ } _%>
  }<%= index < arr.length - 1 ? ',' : '' %>
<%_ }); _%>
];

onMounted(() => {
  loadList();
});

async function loadList() {
  isLoading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: itemsPerPage.value,
      ...activeFilters
    };
    if (sortField.value) {
      params.sort = sortField.value + ',' + sortDirection.value;
    }
    const response = await service.findAll(params);
    items.value = response.data || [];
    const contentRange = response.headers['content-range'];
    if (contentRange) {
      totalItems.value = Number(contentRange.split('/')[1]) || 0;
    }
  } catch (error) {
    console.error('Error loading list:', error);
  } finally {
    isLoading.value = false;
  }
}

function onFilter(filters) {
  Object.keys(activeFilters).forEach((key) => delete activeFilters[key]);
  Object.assign(activeFilters, filters);
  currentPage.value = 1;
  loadList();
}

function orderBy(field) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'ASC' ? 'DESC' : 'ASC';
  } else {
    sortField.value = field;
    sortDirection.value = 'ASC';
  }
  loadList();
}

function goToPage(page) {
  currentPage.value = page;
  loadList();
}

function toggleSelected(item) {
  const idx = selecteds.value.indexOf(item);
  if (idx === -1) {
    selecteds.value.push(item);
  } else {
    selecteds.value.splice(idx, 1);
  }
}

function toggleSelectAll(event) {
  if (event.target.checked) {
    selecteds.value = [...items.value];
  } else {
    selecteds.value = [];
  }
}

function confirmDelete(item) {
  deleteTarget.value = item;
  selecteds.value = [item];
  showDeleteModal.value = true;
}

async function deleteSelecteds() {
  isLoading.value = true;
  try {
    for (const item of selecteds.value) {
      await service.remove(item.id);
    }
    selecteds.value = [];
    showDeleteModal.value = false;
    await loadList();
  } catch (error) {
    console.error('Error deleting items:', error);
  } finally {
    isLoading.value = false;
  }
}

<% if (typeof packages !== 'undefined' && packages.includes('export')) { %>
function exportCsv() {
  downloadCsv('<%= name.lower %>s', activeFilters);
}

function exportPdf() {
  downloadPdf('<%= name.lower %>s', activeFilters);
}
<% } %>
</script>

<style scoped>
.entity-list {
  padding: 16px;
}

.list-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.card-body {
  padding: 16px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.table thead th {
  background-color: var(--bg-secondary);
  font-weight: 600;
  font-size: 0.85rem;
}

.th-button {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
  padding: 0;
}

.text-center {
  text-align: center;
}

.loading-indicator {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.page-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.page-size-select {
  margin-left: 12px;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn-success {
  background-color: var(--color-success, #28a745);
  color: #fff;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-danger {
  background-color: var(--color-danger, #dc3545);
  color: #fff;
}

.btn-default {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-sm {
  padding: 4px 10px;
  font-size: 0.8rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-card);
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}
</style>
