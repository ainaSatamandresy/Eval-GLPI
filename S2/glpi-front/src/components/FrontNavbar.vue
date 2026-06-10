<template>
  <header class="front-navbar">
    <div class="inner">
      <RouterLink to="/frontoffice" class="brand">GLPI-NewApp</RouterLink>
      <nav class="center">
        <RouterLink to="/elements" class="link">Elements</RouterLink>
        <RouterLink to="/tickets" class="link">Tickets</RouterLink>
      </nav>
      <div class="right">
        <button class="btn-logout" @click="logout">Logout</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { glpiApi } from '../services/glpiApi.js'

const router = useRouter()

async function logout() {
  try { await glpiApi.killSession() } catch (e) {}
  window.dispatchEvent(new CustomEvent('glpi:session-expired'))
  router.push('/')
}
</script>

<style scoped>
.front-navbar { width:100%; background:var(--surface); border-bottom:1px solid var(--line); box-shadow:var(--shadow-sm) }
.inner { max-width:1180px; margin:0 auto; display:flex; align-items:center; gap:1rem; padding:0.6rem 1rem }
.brand { font-weight:800; text-decoration:none; color:var(--text) }
.center { margin-left:1rem; display:flex; gap:0.6rem }
.link { text-decoration:none; padding:0.4rem 0.8rem; border-radius:8px; color:var(--text) }
.link.router-link-active { background:linear-gradient(135deg,var(--primary),var(--primary-strong)); color:#fff }
.right { margin-left:auto }
.btn-logout { padding:0.4rem 0.8rem; border-radius:8px; background:linear-gradient(135deg,var(--primary),var(--primary-strong)); color:#fff; border:none }
@media (max-width:900px) { .center { display:none } }
</style>
