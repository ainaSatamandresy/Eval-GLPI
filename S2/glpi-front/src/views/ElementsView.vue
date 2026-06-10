<template>
  <div class="elements-page">
    <!-- FrontOffice navbar (only UI) -->
    <header class="elements-topbar">
      <div class="elements-topbar-inner">
        <div class="topbar-left">GLPI-NewApp</div>
        <div class="topbar-center">
          <RouterLink to="/tickets" class="topbar-link">Tickets</RouterLink>
        </div>
        <div class="topbar-right">
          <RouterLink to="/login" class="topbar-admin">Se connecter en tant qu'admin</RouterLink>
        </div>
      </div>
    </header>
    <div class="page-header">
      <h1>Parc informatique</h1>
      <!-- <RouterLink to="/" class="btn-primary">
        ＋ Signaler un problème
      </RouterLink> -->
    </div>

    <!-- Stat summary (reuse dashboard look) -->
    <!-- <section class="dash-section">
      <div class="section-title">
        Éléments
        <span class="section-total">Total : {{ stats.assetTotal ?? '—' }}</span>
      </div>
      <div class="cards-grid">
        <StatCard
          v-for="asset in stats.assets ?? []"
          :key="asset.key"
          :label="asset.label"
          :total="asset.total"
          :loading="loading || statsLoading"
          :error="asset.error"
        />
      </div>
    </section> -->

    <!-- Filtres -->
    <div class="filters-shell">
      <div class="filters">
        <input v-model="searchText" type="search" placeholder="Rechercher par nom…" class="filter-input" />
        <select v-model="filterType" class="filter-select">
          <option value="">Tous les types</option>
          <option v-for="t in assets_types" :key="t.key" :value="t.key">
            {{ t.icon }} {{ t.label }}
          </option>
        </select>
        <button v-if="searchText || filterType" class="btn-clear" @click="clearFilters">✕</button>
      </div>
    </div>

    <!-- Résumé -->
    <div v-if="!loading" class="result-summary">
      {{ filteredItems.length }} élément(s) trouvé(s)
    </div>

    <!-- État -->
    <div v-if="loading" class="state-msg panel-like">Chargement du parc…</div>
    <div v-else-if="error" class="error-msg panel-like">{{ error }}</div>

    <!-- Liste -->
    <div v-else class="list-wrapper">
      <ElementCard
        v-for="item in pagedItems"
        :key="`${item._type}-${item.id}`"
        :item="item"
        @select="openDetail"
      />
      <div v-if="filteredItems.length === 0" class="empty">Aucun élément correspondant.</div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--">‹ Préc.</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++">Suiv. ›</button>
    </div>

    <!-- Fiche détail -->
    <ElementDetail v-if="selectedItem" :item="selectedItem" @close="selectedItem = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ElementCard from '../components/Elements/ElementCard.vue'
import ElementDetail from '../components/Elements/ElementDetail.vue'
import StatCard from '../components/Dashboard/StatCard.vue'
// import ElementFilters from '../components/Elements/ElementFilters.vue'
import { useElements } from '../composables/useElements.js'
import { useStats } from '../composables/useStats.js'

const { filteredItems, loading, error, searchText, filterType, loadAll, clearFilters, assets_types } = useElements()
const { stats, loading: statsLoading, loadAll: loadStats } = useStats()
const page = ref(1)
const PAGE_SIZE = 15
const selectedItem = ref(null)

watch([searchText, filterType], () => { page.value = 1 })

const totalPages = computed(() => Math.ceil(filteredItems.value.length / PAGE_SIZE))
const pagedItems = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredItems.value.slice(start, start + PAGE_SIZE)
})

function openDetail(item) { selectedItem.value = item }

onMounted(() => {
  loadAll()
  loadStats()
})
</script>

<style scoped>
.elements-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Topbar specific to elements page */
.elements-topbar { width: 100%; }
.elements-topbar-inner {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1rem;
}
.topbar-left { font-weight: 800; font-size: 1rem; color: var(--text); }
.topbar-center { margin: 0 auto; }
.topbar-link { text-decoration: none; padding: 0.4rem 0.8rem; border-radius: 8px; color: var(--text); }
.topbar-link.router-link-active { background: linear-gradient(135deg,var(--primary),var(--primary-strong)); color: #fff }
.topbar-right { margin-left: auto }
.topbar-admin { text-decoration: none; padding: 0.4rem 0.8rem; border-radius: 8px; background: rgba(255,255,255,0.9); color: var(--primary-strong) }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  color: var(--text-strong);
}

.filters-shell {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--line);
  border-radius: 26px;
  box-shadow: var(--shadow-md);
  padding: 1rem;
}

.filters {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
}

.filter-input,
.filter-select {
  min-height: 50px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.95);
}

.btn-clear {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.92);
  color: var(--muted);
  cursor: pointer;
}

.result-summary {
  align-self: flex-end;
  color: var(--muted);
  font-weight: 700;
}

.panel-like {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow-md);
}

.list-wrapper {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid var(--line);
  border-radius: 26px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.empty {
  min-height: 140px;
  display: grid;
  place-items: center;
  color: var(--muted);
  font-weight: 600;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-md);
  width: fit-content;
  align-self: center;
}

.pagination button {
  padding: 0.6rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
}

@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .result-summary {
    align-self: flex-start;
  }
}
</style>