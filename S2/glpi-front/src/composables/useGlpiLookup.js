import { glpiApi } from '../services/glpiApi.js'

// Cache en mémoire par type → { nom: id }
const cache = {}

export async function lookupOrCreate(itemtype, name) {
  if (!name) return 0
  if (!cache[itemtype]) cache[itemtype] = {}
  if (cache[itemtype][name] !== undefined) return cache[itemtype][name]

  // 1. Chercher dans GLPI
  try {
    const results = await glpiApi.getItems(itemtype, { searchText: name, range: '0-4' })
    const found = results.find((r) => r.name?.toLowerCase() === name.toLowerCase())
    if (found) {
      cache[itemtype][name] = found.id
      return found.id
    }
  } catch {
    // Peut être 404 si type inconnu — on continue
  }

  // 2. Créer si pas trouvé
  try {
    const created = await glpiApi.createItem(itemtype, { name })
    cache[itemtype][name] = created.id
    return created.id
  } catch {
    cache[itemtype][name] = 0
    return 0
  }
}

export async function lookupUser(fullName) {
  if (!fullName) return 0
  if (cache['User']?.[fullName] !== undefined) return cache['User'][fullName]
  if (!cache['User']) cache['User'] = {}

  try {
    const results = await glpiApi.getItems('User', { searchText: fullName, range: '0-4' })
    const found = results.find((u) => {
      const glpiName = `${u.firstname ?? ''} ${u.realname ?? ''}`.trim()
      return glpiName.toLowerCase() === fullName.toLowerCase()
    })
    cache['User'][fullName] = found?.id ?? 0
    return cache['User'][fullName]
  } catch {
    cache['User'][fullName] = 0
    return 0
  }
}

export function clearCache() {
  Object.keys(cache).forEach((k) => delete cache[k])
}