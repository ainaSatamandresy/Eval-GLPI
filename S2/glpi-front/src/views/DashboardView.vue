<template>
  <div class="dashboard">
    <div class="dash-header">
      <h1>Dashboard</h1>
      <div class="dash-meta">
        <span v-if="lastUpdate" class="last-update">Dernière MAJ : {{ lastUpdate }}</span>
        <button class="btn-secondary" :disabled="loading" @click="loadAll">
          {{ loading ? '…' : 'Rafraîchir' }}
        </button>
      </div>
    </div>

    <!-- Éléments -->
    <section class="dash-section">
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
          :loading="loading"
          :error="asset.error"
        />
      </div>
    </section>

    <!-- Tickets -->
    <section class="dash-section">
      <div class="section-title">
        Tickets
        <span class="section-total">Total : {{ stats.ticketTotal ?? '—' }}</span>
      </div>
      <div class="cards-grid">
        <StatCard
          v-for="ticket in stats.tickets ?? []"
          :key="ticket.key"
          :label="ticket.label"
          :total="ticket.total"
          :loading="loading"
          :error="ticket.error"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import StatCard from '../components/Dashboard/StatCard.vue'
import { useStats } from '../composables/useStats.js'

const { stats, loading, lastUpdate, loadAll } = useStats()
onMounted(loadAll)
</script>

<style scoped>
.dashboard {
  padding: 1.5rem;
  max-width: 1180px;
  margin: 0 auto;
  border-radius: var(--radius-xl);
}
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.dash-header h1 { margin: 0; font-size: clamp(1.6rem, 2vw, 2.2rem); color: var(--text-strong); }
.dash-meta { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; }
.last-update {
  font-size: 0.85rem;
  color: var(--muted);
  padding: 0.6rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--line);
}
.dash-section { margin-bottom: 2.5rem; }
.section-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.section-total {
  font-weight: 400;
  color: var(--muted);
  font-size: 0.85rem;
  text-transform: none;
  letter-spacing: 0;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--line);
  padding: 0.7rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>