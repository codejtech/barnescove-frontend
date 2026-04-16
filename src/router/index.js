import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // ── Public ──────────────────────────────────────────────
  { path: '/',         component: () => import('@/views/public/HomeView.vue'), meta: { public: true } },
  { path: '/about',    component: () => import('@/views/public/AboutView.vue'), meta: { public: true } },
  { path: '/rules',    component: () => import('@/views/public/RulesView.vue'), meta: { public: true } },
  { path: '/faq',      component: () => import('@/views/public/FaqView.vue'),   meta: { public: true } },
  { path: '/login',    component: () => import('@/views/auth/LoginView.vue'),   meta: { public: true } },
  { path: '/register', component: () => import('@/views/auth/RegisterView.vue'),meta: { public: true } },
  { path: '/pending',  component: () => import('@/views/auth/PendingView.vue'), meta: { public: true } },

  // ── Resident dashboard ───────────────────────────────────
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, requiresActive: true },
    children: [
      { path: '',         redirect: '/dashboard/home' },
      { path: 'home',     component: () => import('@/views/dashboard/DashboardHome.vue') },
      { path: 'payments', component: () => import('@/views/dashboard/PaymentsView.vue') },
      { path: 'requests', component: () => import('@/views/dashboard/RequestsView.vue') },
      { path: 'requests/:id', component: () => import('@/views/dashboard/RequestDetail.vue') },
      { path: 'account',  component: () => import('@/views/dashboard/AccountView.vue') },
    ],
  },

  // ── Message board ────────────────────────────────────────
  {
    path: '/board',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, requiresActive: true },
    children: [
      { path: '',    component: () => import('@/views/board/BoardView.vue') },
      { path: ':id', component: () => import('@/views/board/PostView.vue') },
    ],
  },

  // ── Admin ────────────────────────────────────────────────
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '',         redirect: '/admin/users' },
      { path: 'users',    component: () => import('@/views/admin/UsersView.vue') },
      { path: 'users/:id',component: () => import('@/views/admin/UserDetail.vue') },
      { path: 'requests', component: () => import('@/views/admin/RequestsView.vue') },
      { path: 'posts',    component: () => import('@/views/admin/PostsView.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Navigation guards
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login'
  if (to.meta.requiresActive && !auth.isActive)  return '/pending'
  if (to.meta.requiresAdmin  && !auth.isAdmin)   return '/dashboard'

  // Redirect logged-in active users away from login/register
  if ((to.path === '/login' || to.path === '/register') && auth.isLoggedIn && auth.isActive) {
    return auth.isAdmin ? '/admin' : '/dashboard'
  }
})

export default router
