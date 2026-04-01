<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">{{ $t('forgotPassword.title') }}</h1>
      <p class="auth-description">{{ $t('forgotPassword.description') }}</p>
      <p v-if="successMessage" class="auth-alert auth-alert--success">
        {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="auth-alert auth-alert--error">
        {{ errorMessage }}
      </p>
      <form v-if="!successMessage" @submit.prevent="handleSubmit" novalidate>
        <div class="form-group">
          <label for="email">{{ $t('forgotPassword.email') }}</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            :placeholder="$t('forgotPassword.emailPlaceholder')"
            autocomplete="email"
            required
          />
          <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? $t('common.loading') : $t('forgotPassword.submit') }}
        </button>
      </form>
      <div class="auth-links">
        <router-link :to="{ name: 'login' }">{{ $t('forgotPassword.backToLogin') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth';

const { t } = useI18n();
const { forgotPassword } = useAuth();

const form = reactive({ email: '' });
const errors = reactive({ email: '' });
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

function validate() {
  errors.email = '';
  if (!form.email) {
    errors.email = t('validation.required');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('validation.email');
    return false;
  }
  return true;
}

async function handleSubmit() {
  errorMessage.value = '';
  if (!validate()) return;

  loading.value = true;
  try {
    await forgotPassword(form.email);
    successMessage.value = t('forgotPassword.success');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || t('forgotPassword.error');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 16px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 32px;
  box-shadow: var(--shadow);
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  text-align: center;
}

.auth-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 24px;
}

.auth-alert {
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.auth-alert--success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.auth-alert--error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.form-error {
  display: block;
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 4px;
}

.btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-links {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  font-size: 0.85rem;
}

.auth-links a {
  color: var(--color-primary);
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}
</style>
