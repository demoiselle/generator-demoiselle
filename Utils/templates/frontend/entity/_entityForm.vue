<template>
  <div class="entity-form">
    <div class="card">
      <div class="card-header">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
        <strong>{{ action }} {{ $t('<%= name.lower %>.entityName') }}</strong>
<% } else { %>
        <strong>{{ action }} <%= name.capital %></strong>
<% } %>
      </div>
      <div class="card-body">
        <form @submit.prevent="save" ref="formRef">
          <fieldset :disabled="isLoading">
<%_ (properties || []).forEach(function(property) { _%>
<%_ if (property.isReadOnly) { _%>
            <div class="form-group">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                {{ $t('<%= name.lower %>.fields.<%= property.name %>') }}
              </label>
<% } else { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                <%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>
              </label>
<% } %>
              <input
                type="text"
                id="<%= name.lower %>-<%= property.name %>"
                class="form-control"
                v-model="entity.<%= property.name %>"
                readonly
              />
            </div>
<%_ } else if (!property.isPrimitive) { _%>
            <div class="form-group">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                {{ $t('<%= name.lower %>.fields.<%= property.name %>') }}
              </label>
<% } else { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                <%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>
              </label>
<% } %>
              <select
                id="<%= name.lower %>-<%= property.name %>"
                class="form-control"
                v-model="entity.<%= property.name %>"
              >
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
                <option :value="null">{{ $t('common.select') }}</option>
<% } else { %>
                <option :value="null">Selecione</option>
<% } %>
                <option
                  v-for="opt in <%= property.name %>Options"
                  :key="opt.id"
                  :value="opt"
                >
                  {{ opt.description }}
                </option>
              </select>
            </div>
<%_ } else if (/^boolean$/i.test(property.type)) { _%>
            <div class="form-group form-check">
              <input
                type="checkbox"
                id="<%= name.lower %>-<%= property.name %>"
                class="form-check-input"
                v-model="entity.<%= property.name %>"
              />
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              <label for="<%= name.lower %>-<%= property.name %>" class="form-check-label">
                {{ $t('<%= name.lower %>.fields.<%= property.name %>') }}
              </label>
<% } else { %>
              <label for="<%= name.lower %>-<%= property.name %>" class="form-check-label">
                <%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>
              </label>
<% } %>
            </div>
<%_ } else if (/^(date|localdate|localdatetime)$/i.test(property.type)) { _%>
            <div class="form-group">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                {{ $t('<%= name.lower %>.fields.<%= property.name %>') }}
              </label>
<% } else { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                <%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>
              </label>
<% } %>
              <input
                type="date"
                id="<%= name.lower %>-<%= property.name %>"
                class="form-control"
                v-model="entity.<%= property.name %>"
              />
            </div>
<%_ } else if (/^(integer|int|long|double|float|bigdecimal|number|short)$/i.test(property.type)) { _%>
            <div class="form-group">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                {{ $t('<%= name.lower %>.fields.<%= property.name %>') }}
              </label>
<% } else { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                <%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>
              </label>
<% } %>
              <input
                type="number"
                id="<%= name.lower %>-<%= property.name %>"
                class="form-control"
                v-model="entity.<%= property.name %>"
              />
            </div>
<%_ } else if (/email/i.test(property.name)) { _%>
            <div class="form-group">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                {{ $t('<%= name.lower %>.fields.<%= property.name %>') }}
              </label>
<% } else { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                <%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>
              </label>
<% } %>
              <input
                type="email"
                id="<%= name.lower %>-<%= property.name %>"
                class="form-control"
                v-model="entity.<%= property.name %>"
              />
            </div>
<%_ } else if (/pass/i.test(property.name)) { _%>
            <div class="form-group">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                {{ $t('<%= name.lower %>.fields.<%= property.name %>') }}
              </label>
<% } else { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                <%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>
              </label>
<% } %>
              <input
                type="password"
                id="<%= name.lower %>-<%= property.name %>"
                class="form-control"
                v-model="entity.<%= property.name %>"
              />
            </div>
<%_ } else { _%>
            <div class="form-group">
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                {{ $t('<%= name.lower %>.fields.<%= property.name %>') }}
              </label>
<% } else { %>
              <label for="<%= name.lower %>-<%= property.name %>">
                <%= property.name.charAt(0).toUpperCase() + property.name.slice(1) %>
              </label>
<% } %>
              <input
                type="text"
                id="<%= name.lower %>-<%= property.name %>"
                class="form-control"
                v-model="entity.<%= property.name %>"
              />
            </div>
<%_ } _%>
<%_ }); _%>
          </fieldset>
          <div class="form-actions">
            <button
              v-if="entity.id"
              type="button"
              class="btn btn-danger"
              :disabled="isLoading"
              @click="remove"
            >
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              {{ $t('common.remove') }}
<% } else { %>
              Remover
<% } %>
            </button>
            <button
              type="button"
              class="btn btn-default"
              :disabled="isLoading"
              @click="goBack"
            >
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              {{ $t('common.cancel') }}
<% } else { %>
              Cancelar
<% } %>
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading"
            >
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
              {{ $t('common.save') }}
<% } else { %>
              Salvar
<% } %>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
import { useI18n } from 'vue-i18n';
<% } %>
import { use<%= name.capital %>Service } from './<%= name.lower %>.service';
<%_ if (typeof hasCustomEntity !== 'undefined' && hasCustomEntity) { _%>
import { useApi } from '@/composables/useApi';
<%_ } _%>

const route = useRoute();
const router = useRouter();
<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
const { t } = useI18n();
<% } %>
const service = use<%= name.capital %>Service();
<%_ if (typeof hasCustomEntity !== 'undefined' && hasCustomEntity) { _%>
const api = useApi();
<%_ } _%>

const entity = reactive({
<%_ (properties || []).forEach(function(property) { _%>
<%_ if (/^boolean$/i.test(property.type)) { _%>
  <%= property.name %>: false,
<%_ } else { _%>
  <%= property.name %>: null,
<%_ } _%>
<%_ }); _%>
});

const isLoading = ref(false);

<% if (typeof packages !== 'undefined' && packages.includes('i18n')) { %>
const action = computed(() =>
  entity.id ? t('common.edit') : t('common.create')
);
<% } else { %>
const action = computed(() =>
  entity.id ? 'Editar' : 'Criar'
);
<% } %>

<%_ if (typeof hasCustomEntity !== 'undefined' && hasCustomEntity) { _%>
<%_ (properties || []).filter(function(p) { return !p.isPrimitive; }).forEach(function(property) { _%>
const <%= property.name %>Options = ref([]);
<%_ }); _%>

async function populateCombos() {
<%_ (properties || []).filter(function(p) { return !p.isPrimitive; }).forEach(function(property) { _%>
  try {
    const response = await api.get('/api/v1/<%= property.type.toLowerCase() %>s');
    <%= property.name %>Options.value = response.data || [];
    if (entity.<%= property.name %> && entity.<%= property.name %>.id) {
      entity.<%= property.name %> = <%= property.name %>Options.value.find(
        (opt) => opt.id === entity.<%= property.name %>.id
      ) || entity.<%= property.name %>;
    }
  } catch (error) {
    console.error('Error loading <%= property.name %> options:', error);
  }
<%_ }); _%>
}
<%_ } _%>

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    isLoading.value = true;
    try {
      const data = await service.findById(id);
      Object.assign(entity, data);
    } catch (error) {
      console.error('Error loading entity:', error);
    } finally {
      isLoading.value = false;
    }
  }
<%_ if (typeof hasCustomEntity !== 'undefined' && hasCustomEntity) { _%>
  await populateCombos();
<%_ } _%>
});

async function save() {
  isLoading.value = true;
  try {
    if (entity.id) {
      await service.update(entity);
    } else {
      const data = { ...entity };
      delete data.id;
      await service.create(data);
    }
    goBack();
  } catch (error) {
    console.error('Error saving entity:', error);
  } finally {
    isLoading.value = false;
  }
}

async function remove() {
  if (!entity.id) return;
  isLoading.value = true;
  try {
    await service.remove(entity.id);
    goBack();
  } catch (error) {
    console.error('Error removing entity:', error);
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  router.push({ name: '<%= name.lower %>-list' });
}
</script>

<style scoped>
.entity-form {
  padding: 16px;
}

.card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  border-radius: 8px 8px 0 0;
  color: var(--text-primary);
}

.card-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-control[readonly] {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-check-input {
  width: 18px;
  height: 18px;
}

.form-check-label {
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
