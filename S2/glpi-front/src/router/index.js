// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { glpiApi } from '../services/glpiApi.js'

const routes = [
  { path: '/', component: () => import('../views/LandingView.vue'), meta: { public: true } },
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/elements', component: () => import('../views/ElementsView.vue') },
  { path: '/tickets', component: () => import('../views/TicketsView.vue') },
  { path: '/reinitialisation', component: () => import('../views/ReinitialisationView.vue') },
  { path: '/import', component: () => import('../views/ImportView.vue') },
  { path: '/dashboard', component: () => import('../views/DashboardView.vue'), meta: { backoffice: true } },
  { path: '/kanban-settings', component: () => import('../views/KanbanSettingsView.vue'), meta: { backoffice: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  // allow public routes (landing, login)
  if (to.meta && to.meta.public) return true
  // protected routes require an active GLPI session
  if (glpiApi.isAuthenticated()) return true
  // otherwise send user to landing to init session
  return '/'
})

export default router
