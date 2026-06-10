// src/composables/useReinit.js
import { ref } from 'vue'
import { glpiApi } from '../services/glpiApi.js'
import { logs } from '../services/springApi.js'

export function useReinit() {
  const items = ref([])
  const selectedIds = ref([])
  const loading = ref(false)
  const loadingItems = ref(false)
  const error = ref(null)
  const results = ref([])

  async function loadItems(itemtype) {
    loadingItems.value = true
    error.value = null
    items.value = []
    selectedIds.value = []
    try {
      items.value = await glpiApi.getItems(itemtype, {
        range: '0-499',
        sort: 'id',
        order: 'ASC',
      })
    } catch (e) {
      error.value = e.message
    } finally {
      loadingItems.value = false
    }
  }

  function toggleSelect(id) {
    const idx = selectedIds.value.indexOf(id)
    if (idx === -1) selectedIds.value.push(id)
    else selectedIds.value.splice(idx, 1)
  }

  function toggleAll() {
    if (selectedIds.value.length === items.value.length) {
      selectedIds.value = []
    } else {
      selectedIds.value = items.value.map((i) => i.id)
    }
  }

  async function deleteSelected(itemtype) {
    if (selectedIds.value.length === 0) return
    loading.value = true
    error.value = null
    results.value = []
    try {
      results.value = await glpiApi.deleteItems(itemtype, selectedIds.value)
      await logs.create({
        action: 'DELETE',
        itemtype,
        payload: JSON.stringify({ ids: selectedIds.value }),
        response: JSON.stringify(results.value),
        status: 'SUCCESS',
      }).catch(() => {})
      const deletedIds = new Set(selectedIds.value)
      items.value = items.value.filter((i) => !deletedIds.has(i.id))
      selectedIds.value = []
    } catch (e) {
      await logs.create({
        action: 'DELETE',
        itemtype,
        status: 'ERROR',
        errorMessage: e.message,
      }).catch(() => {})
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function deleteAll(itemtype) {
    loadingItems.value = true
    error.value = null
    results.value = []
    try {
      const allItems = await glpiApi.getItems(itemtype, { range: '0-999', only_id: '1' })
      const allIds = allItems.map((i) => i.id)
      if (allIds.length === 0) return
      loading.value = true
      for (let i = 0; i < allIds.length; i += 100) {
        const batch = allIds.slice(i, i + 100)
        const batchResults = await glpiApi.deleteItems(itemtype, batch)
        results.value.push(...batchResults)
      }
      items.value = []
      selectedIds.value = []
    } catch (e) {
      error.value = e.message
    } finally {
      loadingItems.value = false
      loading.value = false
    }
  }

  function reset() {
    items.value = []
    selectedIds.value = []
    error.value = null
    results.value = []
  }

  return {
    items, selectedIds, loading, loadingItems, error, results,
    loadItems, toggleSelect, toggleAll, deleteSelected, deleteAll, reset,
  }
}
