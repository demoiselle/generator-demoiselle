<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">{{ $t('register.title') }}</h1>
      <p v-if="successMessage" class="auth-alert auth-alert--success">
        {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="auth-alert auth-alert--error">
        {{ errorMessage }}
      </p>
      <form v-if="!successMessage" @submit.prevent="handleRegister" novalidate>
        <div class="form-group">
          <label for="name">{{ $t('register.name') }}</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            :placeholder="$t('register.namePlaceholder')"
            autocomplete="name"
            required
          />
          <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label for="email">{{ $t('register.email') }}</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            :placeholder="$t('register.emailPlaceholder')"
            autocomplete="email"
            required
          />
          <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
        </div>
        <div class="form-group">
          <label for="password">{{ $t('register.password') }}</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            :placeholder="$t('register.passwordPlaceholder')"
            autocomplete="new-password"
            required
          />
          <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
        </div>
        <div class="form-group">
          <label for="confirmPassword">{{ $t('register.confirmPassword') }}</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            :placeholder="$t('register.confirmPasswordPlaceholder')"
            autocomplete="new-password"
            required
          />
          <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? $t('common.loading') : $t('register.submit') }}
        </button>
      </form>
      <div class="auth-links">
        <router-link :to="{ name: 'login' }">{{ $t('register.backToLogin') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth';

const { t } = useI18n();
const { register } = useAuth();

const form = reactive({ name: '', email: '', password: '', confirmPassword: '' });
const errors = reactive({ name: '', email: '', password: '', confirmPassword: '' });
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

function validate() {
  let valid = true;
  errors.name = '';
  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';

  if (!form.name) {
    errors.name = t('validation.required');
    valid = false;
  }

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
  } else if (form.password.length < 6) {
    errors.password = t('validation.minLength', { min: 6 });
    valid = false;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = t('validation.required');
    valid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = t('validation.passwordMismatch');
    valid = false;
  }

  return valid;
}

async function handleRegister() {
  errorMessage.value = '';
  if (!validate()) return;

  loading.value = true;
  try {
    await register({ name: form.name, email: form.email, password: form.password });
    successMessage.value = t('register.success');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || t('register.error');
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
