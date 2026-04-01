import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  const roles = ref(JSON.parse(localStorage.getItem('roles') || '[]'));

  const isAuthenticated = computed(() => !!token.value);

  function hasRole(role) {
    return roles.value.includes(role);
  }

  function setAuth(data) {
    token.value = data.token;
    user.value = data.user;
    roles.value = data.roles || [];
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('roles', JSON.stringify(data.roles || []));
  }

  async function login(credentials) {
    const response = await axios.post('/api/auth/login', credentials);
    setAuth(response.data);
    return response.data;
  }

  async function refreshToken() {
    const response = await axios.get('/api/auth/refresh', {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    setAuth(response.data);
    return response.data;
  }

  function logout() {
    token.value = null;
    user.value = null;
    roles.value = [];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
  }

  return {
    token,
    user,
    roles,
    isAuthenticated,
    hasRole,
    setAuth,
    login,
    refreshToken,
    logout
  };
});
