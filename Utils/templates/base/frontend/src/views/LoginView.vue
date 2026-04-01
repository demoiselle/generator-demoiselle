<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">{{ $t('login.title') }}</h1>
      <p v-if="expiredMessage" class="auth-alert auth-alert--warning">
        {{ $t('login.sessionExpired') }}
      </p>
      <p v-if="errorMessage" class="auth-alert auth-alert--error">
        {{ errorMessage }}
      </p>
      <form @submit.prevent="handleLogin" novalidate>
        <div class="form-group">
          <label for="email">{{ $t('login.email') }}</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            :placeholder="$t('login.emailPlaceholder')"
            autocomplete="email"
            required
          />
          <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
        </div>
        <div class="form-group">
          <label for="password">{{ $t('login.password') }}</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            :placeholder="$t('login.passwordPlaceholder')"
            autocomplete="current-password"
            required
          />
          <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? $t('common.loading') : $t('login.submit') }}
        </button>
      </form>
      <div class="auth-links">
        <router-link :to="{ name: 'forgot-password' }">{{ $t('login.forgotPassword') }}</router-link>
        <router-link :to="{ name: 'register' }">{{ $t('login.register') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth';

const { t } = useI18n();
const route = useRoute();
const { login } = useAuth();

const form = reactive({ email: '', password: '' });
const errors = reactive({ email: '', password: '' });
const errorMessage = ref('');
const loading = ref(false);

const expiredMessage = computed(() => route.query.expired === 'true');

function validate() {
  let valid = true;
  errors.email = '';
  errors.password = '';

  if (!form.email) {
    errors.email = t('validation.required');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('validation.email');
    valid = false;
  }

  if (!form.password) {
    errors.password = t('validation.required');
    valid = false;
  }

  return valid;
}

async function handleLogin() {
  errorMessage.value = '';
  if (!validate()) return;

  loading.value = true;
  try {
    await login(form.email, form.password);
  } catch (err) {
    errorMessage.value = err.response?.data?.message || t('login.error');
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
  margin-bottom: 24px;
  text-align: center;
}

.auth-alert {
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.auth-alert--warning {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
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
  justify-content: space-between;
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
