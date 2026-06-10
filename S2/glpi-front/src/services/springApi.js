// src/services/springApi.js
// Client HTTP pour le backend Spring Boot (persistance SQLite)
// Toutes les requêtes partent vers /spring/* proxifié par Vite → localhost:8081

const BASE = '/spring'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, opts)

  if (res.status === 204) return undefined
  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`)
    throw new Error(text)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Historique d'imports
// ---------------------------------------------------------------------------
export const imports = {
  /** Liste tous les imports, optionnellement filtrés par itemtype */
  list(itemtype) {
    const qs = itemtype ? `?itemtype=${itemtype}` : ''
    return request('GET', `/imports${qs}`)
  },

  get(id) {
    return request('GET', `/imports/${id}`)
  },

  /**
   * @param {{ filename, itemtype, totalRows, successCount, failureCount, status }} data
   */
  create(data) {
    return request('POST', '/imports', data)
  },

  delete(id) {
    return request('DELETE', `/imports/${id}`)
  },
}

// ---------------------------------------------------------------------------
// Snapshots (état avant opération bulk — pour rollback)
// ---------------------------------------------------------------------------
export const snapshots = {
  list(itemtype) {
    const qs = itemtype ? `?itemtype=${itemtype}` : ''
    return request('GET', `/snapshots${qs}`)
  },

  get(id) {
    return request('GET', `/snapshots/${id}`)
  },

  /**
   * @param {{
   *   label: string,
   *   itemtype: string,
   *   itemCount: number,
   *   items: Array<{ glpiId: number, originalState: string, modifiedFields: string }>
   * }} data
   */
  create(data) {
    return request('POST', '/snapshots', data)
  },

  delete(id) {
    return request('DELETE', `/snapshots/${id}`)
  },
}

// ---------------------------------------------------------------------------
// Préférences utilisateur (clé / valeur JSON)
// ---------------------------------------------------------------------------
export const preferences = {
  /** Retourne toutes les préférences */
  list() {
    return request('GET', '/preferences')
  },

  /** Retourne une préférence par clé */
  get(key) {
    return request('GET', `/preferences/${encodeURIComponent(key)}`)
  },

  /**
   * Crée ou met à jour une préférence.
   * @param {string} key  - ex: "dashboard.watchedTypes"
   * @param {*}      value - sera JSON.stringify si ce n'est pas déjà une string
   */
  set(key, value) {
    const strValue = typeof value === 'string' ? value : JSON.stringify(value)
    return request('PUT', `/preferences/${encodeURIComponent(key)}`, { value: strValue })
  },

  delete(key) {
    return request('DELETE', `/preferences/${encodeURIComponent(key)}`)
  },
}

// ---------------------------------------------------------------------------
// Logs d'actions GLPI
// ---------------------------------------------------------------------------
export const logs = {
  /** @param {{ itemtype?: string, action?: string }} opts */
  list({ itemtype, action } = {}) {
    const params = new URLSearchParams()
    if (itemtype) params.set('itemtype', itemtype)
    if (action) params.set('action', action)
    const qs = params.toString() ? `?${params}` : ''
    return request('GET', `/logs${qs}`)
  },

  /**
   * @param {{
   *   action: 'CREATE'|'PATCH'|'DELETE',
   *   itemtype: string,
   *   glpiId?: number,
   *   payload?: string,
   *   response?: string,
   *   status: 'SUCCESS'|'ERROR',
   *   errorMessage?: string
   * }} data
   */
  create(data) {
    return request('POST', '/logs', data)
  },

  /** Efface tous les logs */
  clearAll() {
    return request('DELETE', '/logs')
  },

  delete(id) {
    return request('DELETE', `/logs/${id}`)
  },
}
