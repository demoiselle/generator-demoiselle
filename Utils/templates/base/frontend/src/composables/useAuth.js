import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

export function useAuth() {
  const authStore = useAuthStore();

  async function login(email, password) {
    await authStore.login({ email, password });
    const redirect = router.currentRoute.value.query.redirect || '/dashboard';
    router.push(redirect);
  }

  async function register(data) {
    await axios.post('/api/auth/register', data);
  }

  async function forgotPassword(email) {
    await axios.post('/api/auth/forgot-password', { email });
  }

  async function resetPassword(token, password) {
    await axios.post('/api/auth/reset-password', { token, password });
  }

  function logout() {
    authStore.logout();
    router.push({ name: 'login' });
  }

  return {
    login,
    register,
    forgotPassword,
    resetPassword,
    logout
  };
}
