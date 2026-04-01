import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppLayout from '@/components/AppLayout.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import ForgotPasswordView from '@/views/ForgotPasswordView.vue';
import ResetPasswordView from '@/views/ResetPasswordView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AuditView from '@/views/AuditView.vue';
import NotificationsView from '@/views/NotificationsView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard', icon: 'icon-speedometer' }
      },
      {
        path: 'audit',
        name: 'audit',
        component: AuditView,
        meta: { title: 'Auditoria', roles: ['ADMIN'] }
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: NotificationsView,
        meta: { title: 'Notificações' }
      }
      // CRUD routes will be added here by the generator
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth === false) {
    if (authStore.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
      return next({ name: 'dashboard' });
    }
    return next();
  }

  if (!authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  const requiredRoles = to.meta.roles;
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.some((role) => authStore.hasRole(role));
    if (!hasRole) {
      return next({ name: 'dashboard' });
    }
  }

  next();
});

export default router;
