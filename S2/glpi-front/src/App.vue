<template>
  <div class="app">
    <!-- Topbar always visible -->
    <!-- <header class="topbar">
      <div class="topbar-inner">
        

        <div class="topbar-links">
          <template v-if="isBackoffice && isAuthenticated">
            <RouterLink to="/dashboard">Dashboard</RouterLink>
            <RouterLink to="/import">Import</RouterLink>
            <RouterLink to="/tickets">Tickets</RouterLink>
            <RouterLink to="/reinitialisation">Réinitialisation</RouterLink>
            <button class="btn-logout" @click="onLogout">Déconnexion</button>
          </template>

          <template v-else-if="isFrontoffice">
            <RouterLink to="/">Éléments</RouterLink>
            <RouterLink to="/nouveau-ticket">Signaler un problème</RouterLink>
            <RouterLink to="/login" class="nav-admin-link">Admin</RouterLink>
          </template>
        </div>
      </div>
    </header> -->

    <div class="layout">
      <Sidebar v-if="isAuthenticated" />
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { glpiApi } from './services/glpiApi.js'
import Sidebar from './components/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const isAuthenticated = ref(glpiApi.isAuthenticated())

const isBackoffice = computed(() => !!route.meta.backoffice)
const isFrontoffice = computed(() => !!route.meta.public && route.path !== '/login')

onMounted(() => {
  window.addEventListener('glpi:session-expired', () => {
    isAuthenticated.value = false
    router.push('/login')
  })
  // admin session created -> show admin sidebar
  window.addEventListener('glpi:session-created', () => {
    isAuthenticated.value = true
  })
  // front-office session created -> do not show admin sidebar; could be used to show front navbar
  window.addEventListener('glpi:front-session-created', () => {
    // noop here to avoid enabling admin sidebar
  })
})

async function onLogout() {
  await glpiApi.killSession().catch(() => {})
  isAuthenticated.value = false
  router.push('/login')
}
</script>

<style>
* {
  box-sizing: border-box;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.topbar {
  position: sticky;
  top: 12px;
  z-index: 60;
  width: calc(100% - 2rem);
  margin: 0 1rem;
}
.topbar-inner {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 0.6rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}
.brand {
  font-weight: 800;
  font-size: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.topbar-links {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  align-items: center;
}

.layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.main-content {
  flex: 1;
  min-height: calc(100vh - 120px);
  padding: 1rem;
}

.navbar {
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-strong);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.95rem 1.25rem;
  min-height: 64px;
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(6px);
  flex-wrap: wrap;
}

.nav-brand {
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-strong);
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  gap: 0.25rem;
  flex: 1;
  flex-wrap: wrap;
}

.nav-links a {
  color: var(--muted);
  text-decoration: none;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.18s;
}

.nav-links a:hover {
  background: rgba(0,31,63,0.06);
  color: var(--primary-strong);
  transform: translateY(-1px);
}

.nav-links a.router-link-active {
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: #fff;
  border-color: rgba(0,31,63,0.12);
}

.btn-logout {
  margin-left: auto;
  padding: 0.62rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(0,31,63,0.14);
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: #fff;
  cursor: pointer;
  font-size: 0.88rem;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.btn-logout:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0,31,63,0.14);
}

.navbar-front .nav-brand {
  color: var(--primary-strong);
}

.nav-admin-link {
  margin-left: auto;
  text-decoration: none;
  padding: 0.62rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(0,31,63,0.12);
  color: var(--primary-strong);
  background: rgba(255, 255, 255, 0.95);
}

@media (max-width: 900px) {
  .layout { flex-direction: column; }
  .main-content { padding: 0.75rem; }
}
</style>
