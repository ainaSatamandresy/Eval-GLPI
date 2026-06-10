<template>
  <div class="landing-page">
    <div class="hero">
      <h1>GLPI-NewApp</h1>
      <p class="lead">Gestion moderne de parc et tickets — accès rapide sans authentification admin.</p>
      <div class="actions">
        <button class="btn-primary" @click="start" :disabled="loading">{{ loading ? 'Initialisation…' : 'Commencer' }}</button>
        <RouterLink to="/login" class="btn-secondary">Se connecter en admin</RouterLink>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { glpiApi } from '../services/glpiApi.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')

async function start() {
  loading.value = true
  error.value = ''
  try {
    await glpiApi.initSessionAuto()
    // front-office session created — do NOT trigger admin/sidebar UI
    window.dispatchEvent(new CustomEvent('glpi:front-session-created'))
    router.push('/elements')
  } catch (e) {
    error.value = e.message || String(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.landing-page { min-height: 80vh; display:grid; place-items:center; padding:2rem; background:var(--bg) }
.hero { text-align:center; max-width:720px; background:var(--surface); border:1px solid var(--line); padding:2rem; border-radius:14px; box-shadow:var(--shadow-sm) }
.hero h1 { margin:0 0 0.5rem 0; font-size:2rem }
.lead { color:var(--text-muted); margin-bottom:1rem }
.actions { display:flex; gap:0.6rem; justify-content:center; margin-top:1rem }
.error { color:var(--black); margin-top:0.8rem }
.btn-primary { background:linear-gradient(135deg,var(--primary),var(--primary-strong)); color:#fff; padding:0.6rem 1rem; border-radius:10px; border:none }
.btn-secondary { background:rgba(255,255,255,0.9); color:var(--primary-strong); padding:0.6rem 1rem; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; justify-content:center }
</style>
