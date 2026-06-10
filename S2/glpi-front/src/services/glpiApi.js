// src/services/glpiApi.js
const BASE_URL = '/api'
let sessionToken = null
const appToken = import.meta.env.VITE_GLPI_APP_TOKEN?.trim() || ''
const userToken = import.meta.env.VITE_GLPI_USER_TOKEN?.trim() || ''
const loginFallback = import.meta.env.VITE_GLPI_LOGIN?.trim() || 'glpi'
const passwordFallback = import.meta.env.VITE_GLPI_PASSWORD?.trim() || 'glpi'

function headers(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra }
  if (sessionToken) h['Session-Token'] = sessionToken
  if (appToken) h['App-Token'] = appToken
  return h
}

async function request(method, path, body, customHeaders) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(customHeaders),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    sessionToken = null
    window.dispatchEvent(new CustomEvent('glpi:session-expired'))
    throw new Error('Session expirée, veuillez vous reconnecter.')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(Array.isArray(err) ? err[1] : (err.message ?? `HTTP ${res.status}`))
  }
  if (res.status === 204) return undefined
  return res.json()
}

export const glpiApi = {
  async initSession(login, password) {
    const credentials = btoa(`${login}:${password}`)
    const data = await request('GET', '/initSession', undefined, {
      Authorization: `Basic ${credentials}`,
    })
    sessionToken = data.session_token
    return sessionToken
  },

  async initSessionAuto() {
    if (userToken) {
      try {
        const data = await request('GET', '/initSession', undefined, {
          Authorization: `user_token ${userToken}`,
        })
        sessionToken = data.session_token
        return sessionToken
      } catch (e) {
        // user token invalid or expired — fallback to basic auth
        console.warn('glpiApi: user token init failed, falling back to basic auth', e.message)
      }
    }

    return this.initSession(loginFallback, passwordFallback)
  },

  async killSession() {
    await request('GET', '/killSession')
    sessionToken = null
  },

  async getItemsRaw(itemtype, params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    const res = await fetch(`${BASE_URL}/${itemtype}${qs}`, { headers: headers() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const contentRange = res.headers.get('Content-Range')
    const total = contentRange ? parseInt(contentRange.split('/')[1]) : data.length
    return { data, total }
  },

  async getItems(itemtype, params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request('GET', `/${itemtype}${qs}`)
  },

  async getItem(itemtype, id) {
    return request('GET', `/${itemtype}/${id}`)
  },

  async createItem(itemtype, input) {
    return request('POST', `/${itemtype}`, { input })
  },

  async patchItem(itemtype, id, input) {
    return request('PATCH', `/${itemtype}/${id}`, { input })
  },

  async deleteItem(itemtype, id) {
    return request('DELETE', `/${itemtype}/${id}`)
  },

  async deleteItems(itemtype, ids) {
    return request('DELETE', `/${itemtype}`, {
      input: ids.map((id) => ({ id })),
    })
  },

  isAuthenticated() {
    return sessionToken !== null
  },
}
