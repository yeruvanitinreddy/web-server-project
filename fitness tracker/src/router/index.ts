import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ForbiddenView from '@/views/ForbiddenView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
    },
    // placeholders for later:
    {
      path: '/activities',
      name: 'activities',
      component: () => import('@/views/ActivitiesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import('@/views/FriendsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/AdminUsersView.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.initialize()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresRole === 'admin' && !auth.isAdmin) {
    return { name: 'forbidden' }
  }

  // If logged in and trying to hit login, send them home
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
