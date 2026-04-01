<template>
  <div class="advanced-filter">
    <div class="filter-toggle" @click="expanded = !expanded">
      <span class="filter-icon">🔍</span>
      <span class="filter-label">{{ $t('filter.title') }}</span>
      <span class="filter-count" v-if="activeCount > 0">({{ activeCount }})</span>
      <span class="toggle-arrow" :class="{ open: expanded }">▾</span>
    </div>
    <div v-if="expanded" class="filter-body">
      <div class="filter-fields">
        <div
          v-for="field in fields"
          :key="field.name"
          class="filter-field"
        >
          <label class="field-label" :for="'filter-' + field.name">
            {{ field.label || $t(`fields.${field.name}`) }}
          </label>

          <select
            v-if="field.type === 'select'"
            :id="'filter-' + field.name"
            v-model="values[field.name]"
            class="field-input"
          >
            <option value="">{{ $t('filter.all') }}</option>
            <option
              v-for="opt in field.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>

          <select
            v-else-if="field.type === 'boolean'"
            :id="'filter-' + field.name"
            v-model="values[field.name]"
            class="field-input"
          >
            <option value="">{{ $t('filter.all') }}</option>
            <option value="true">{{ $t('common.yes') }}</option>
            <option value="false">{{ $t('common.no') }}</option>
          </select>

          <div v-else-if="field.type === 'date-range'" class="date-range">
            <input
              type="date"
              :id="'filter-' + field.name + '-from'"
              v-model="values[field.name + 'From']"
              class="field-input"
              :placeholder="$t('filter.from')"
            />
            <span class="range-sep">–</span>
            <input
              type="date"
              :id="'filter-' + field.name + '-to'"
              v-model="values[field.name + 'To']"
              class="field-input"
              :placeholder="$t('filter.to')"
            />
          </div>

          <div v-else-if="field.type === 'number-range'" class="date-range">
            <input
              type="number"
              :id="'filter-' + field.name + '-min'"
              v-model="values[field.name + 'Min']"
              class="field-input"
              :placeholder="$t('filter.min')"
            />
            <span class="range-sep">–</span>
            <input
              type="number"
              :id="'filter-' + field.name + '-max'"
              v-model="values[field.name + 'Max']"
              class="field-input"
              :placeholder="$t('filter.max')"
            />
          </div>

          <input
            v-else
            type="text"
            :id="'filter-' + field.name"
            v-model="values[field.name]"
            class="field-input"
            :placeholder="$t('filter.search')"
          />
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-primary" @click="applyFilter">
          {{ $t('filter.apply') }}
        </button>
        <button class="btn btn-secondary" @click="clearFilter">
          {{ $t('filter.clear') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const props = defineProps({
  fields: {
    type: Array,
    required: true,
    validator: (v) => v.every((f) => f.name)
  }
});

const emit = defineEmits(['filter']);

const expanded = ref(false);
const values = reactive({});

const activeCount = computed(() =>
  Object.values(values).filter((v) => v !== '' && v !== null && v !== undefined).length
);

function applyFilter() {
  const filters = {};
  for (const [key, val] of Object.entries(values)) {
    if (val !== '' && val !== null && val !== undefined) {
      filters[key] = val;
    }
  }
  emit('filter', filters);
}

function clearFilter() {
  for (const key of Object.keys(values)) {
    values[key] = '';
  }
  emit('filter', {});
}
</script>

<style scoped>
.advanced-filter {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 16px;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}

.filter-icon {
  font-size: 1rem;
}

.filter-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.filter-count {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 600;
}

.toggle-arrow {
  margin-left: auto;
  transition: transform 0.15s;
  color: var(--text-secondary);
}

.toggle-arrow.open {
  transform: rotate(180deg);
}

.filter-body {
  padding: 0 16px 16px;
}

.filter-fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.field-input {
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.85rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.field-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-range .field-input {
  flex: 1;
  min-width: 0;
}

.range-sep {
  color: var(--text-secondary);
}

.filter-actions {
  display: flex;
  gap: 8px;
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

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--border-color);
}
</style>
