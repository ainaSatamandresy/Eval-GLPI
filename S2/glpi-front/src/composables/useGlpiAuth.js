// src/composables/useGlpiAuth.js
import { ref } from 'vue'
import { glpiApi } from '../services/glpiApi.js'

export function useGlpiAuth() {
  const authenticated = ref(glpiApi.isAuthenticated())
  const loading = ref(false)
  const error = ref(null)

  async function login(loginStr, password) {
    loading.value = true
    error.value = null
    try {
      await glpiApi.initSession(loginStr, password)
      authenticated.value = true
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await glpiApi.killSession().catch(() => {})
    authenticated.value = false
  }

  return { authenticated, loading, error, login, logout }
}
