<template>
  <div class="cost-page">
    <div class="page-header">
      <h1>Coût des Tickets</h1>
      <button class="btn-primary" @click="saveCosts" :disabled="saving">
        {{ saving ? 'Enregistrement...' : 'Enregistrer (SQLite)' }}
      </button>
    </div>

    <!-- Alertes -->
    <div v-if="loading" class="state-msg">Chargement des données...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>

    <div v-else class="content-wrapper">
      <!-- Tableau des coûts par Ticket -->
      <div class="table-section">
        <div class="section-header">
          <h2>Détails par Ticket</h2>
          <div class="total-cost">Coût Total : {{ totalCost }} €</div>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom du Ticket</th>
                <th>Durée Totale</th>
                <th>Éléments Liés</th>
                <th>Coût Initial (€)</th>
                <th>Pénalité Réouv. (€)</th>
                <th>Coût Total (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in tickets" :key="ticket.id">
                <td>{{ ticket.id }}</td>
                <td>{{ ticket.name || '(Sans titre)' }}</td>
                <td>{{ formatDuration(ticketDurations[ticket.id]) }}</td>
                <td>
                  <span v-for="item in (ticketItems[ticket.id] || [])" :key="item.id" class="badge">
                    {{ item.itemtype }} #{{ item.id }}
                  </span>
                  <span v-if="!(ticketItems[ticket.id] && ticketItems[ticket.id].length)" class="muted">Aucun</span>
                </td>
                <td>
                  <input type="number" 
                         v-model.number="ticketCostsBase[ticket.id]" 
                         class="cost-input" 
                         min="0" 
                         placeholder="0.0" />
                </td>
                <td>
                  <input type="number" 
                         v-model.number="ticketCostsPenalty[ticket.id]" 
                         class="cost-input" 
                         min="0" 
                         placeholder="0.0" />
                </td>
                <td>
                  <strong>{{ (Number(ticketCostsBase[ticket.id] || 0) + Number(ticketCostsPenalty[ticket.id] || 0)).toFixed(2) }}</strong>
                </td>
              </tr>
              <tr v-if="tickets.length === 0">
                <td colspan="5" class="empty-row">Aucun ticket trouvé.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tableau des coûts groupés par Élément -->
      <div class="table-section">
        <div class="section-header">
          <h2>Coûts groupés par catégorie d'élément</h2>
          <p class="muted-text">Les coûts sont partagés équitablement entre les éléments d'un ticket.</p>
        </div>
        <div class="table-wrapper">
          <table class="data-table grouped-table">
            <thead>
              <tr>
                <th>Catégorie d'élément</th>
                <th>Coût Partagé Total (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(val, category) in groupedCosts" :key="category">
                <td>{{ category }}</td>
                <td>{{ val.toFixed(2) }} €</td>
              </tr>
              <tr v-if="Object.keys(groupedCosts).length === 0">
                <td colspan="2" class="empty-row">Aucun élément lié ou aucun coût défini.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { glpiApi } from '../services/glpiApi.js'
import { costs } from '../services/springApi.js'

const tickets = ref([])
const ticketItems = ref({}) // mapping ticket_id => array of items
const ticketCosts = ref({})
const ticketCostsBase = ref({})
const ticketCostsPenalty = ref({}) // mapping ticket_id => cost
const ticketDurations = ref({}) // mapping ticket_id => total duration in seconds
const loading = ref(false)
const error = ref(null)
const saving = ref(false)

function formatDuration(seconds) {
  if (!seconds) return '0 min'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

async function loadData() {
  loading.value = true
  error.value = null
  try {
    // 1. Charger tous les tickets
    const fetchedTickets = await glpiApi.getItems('Ticket', { range: '0-999', sort: 'id', order: 'DESC' })
    tickets.value = fetchedTickets

    // initialiser les coûts
    const initCosts = {}
    const initDurations = {}
    const initCostsBase = {}
    const initCostsPenalty = {}
    fetchedTickets.forEach(t => { 
      initCosts[t.id] = 0 
      initCostsBase[t.id] = 0
      initCostsPenalty[t.id] = 0
      initDurations[t.id] = 0
    })

    // 1.5 Fetch imported TicketCost from GLPI API
    try {
      const rawCosts = await glpiApi.getItemsRaw('TicketCost', { range: '0-999' })
      const costList = Array.isArray(rawCosts) ? rawCosts : (rawCosts.data || [])
      
      fetchedTickets.forEach(t => {
        const matchingCosts = costList.filter(c => String(c.tickets_id) === String(t.id))
        let sum = 0
        let totalDuration = 0
        
        let sumBase = 0
        let sumPenalty = 0
        matchingCosts.forEach(c => {
          const actionTime = Number(c.actiontime) || 0
          const costTime = Number(c.cost_time) || 0
          const costFixed = Number(c.cost_fixed) || 0
          
          totalDuration += actionTime
          
          let ct = 0
          if (actionTime > 0) {
            ct = (actionTime / 3600) * costTime + costFixed
          } else {
            ct = costTime + costFixed
          }

          if (c.name && c.name.includes('Pénalité réouverture')) {
            sumPenalty += ct
          } else {
            sumBase += ct
          }
        })
        
        initDurations[t.id] = totalDuration
        initCostsBase[t.id] = parseFloat(sumBase.toFixed(2))
        initCostsPenalty[t.id] = parseFloat(sumPenalty.toFixed(2))
        if (sumBase + sumPenalty > 0) initCosts[t.id] = parseFloat((sumBase + sumPenalty).toFixed(2))
      })
    } catch (e) {
      console.warn("Erreur chargement TicketCost:", e)
    }

    ticketCosts.value = initCosts
    ticketCostsBase.value = initCostsBase
    ticketCostsPenalty.value = initCostsPenalty
    ticketDurations.value = initDurations

    // 2. Charger les associations Item_Ticket
    const rawItems = await glpiApi.getItemsRaw('Item_Ticket', { range: '0-999' })
    const assocList = Array.isArray(rawItems) ? rawItems : (rawItems.data || [])
    
    const mapping = {}
    fetchedTickets.forEach(t => { mapping[t.id] = [] })

    for (const assoc of assocList) {
      if (mapping[assoc.tickets_id]) {
        mapping[assoc.tickets_id].push({
          id: assoc.items_id,
          itemtype: assoc.itemtype
        })
      }
    }
    ticketItems.value = mapping

  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const totalCost = computed(() => {
  let total = 0
  for (const key in ticketCostsBase.value) {
    total += (Number(ticketCostsBase.value[key]) || 0) + (Number(ticketCostsPenalty.value[key]) || 0)
  }
  return total.toFixed(2)
})

const groupedCosts = computed(() => {
  const groups = {}
  
  tickets.value.forEach(ticket => {
    const base = Number(ticketCostsBase.value[ticket.id]) || 0
    const pen = Number(ticketCostsPenalty.value[ticket.id]) || 0
    const cost = base + pen
    if (cost <= 0) return
    
    const items = ticketItems.value[ticket.id] || []
    if (items.length === 0) {
      // Si le ticket a pas d'élément, on peut classer dans "Sans Élément" ou ignorer.
      groups['Sans Élément'] = (groups['Sans Élément'] || 0) + cost
    } else {
      // Diviser équitablement
      const sharedCost = cost / items.length
      items.forEach(item => {
        const type = item.itemtype || 'Inconnu'
        groups[type] = (groups[type] || 0) + sharedCost
      })
    }
  })
  return groups
})

async function saveCosts() {
  saving.value = true
  try {
    const details = []
    tickets.value.forEach(ticket => {
      const base = Number(ticketCostsBase.value[ticket.id]) || 0
      const pen = Number(ticketCostsPenalty.value[ticket.id]) || 0
      const cost = base + pen
      if (cost > 0) {
        const items = ticketItems.value[ticket.id] || []
        const elementsData = items.map(i => ({ type: i.itemtype, id: i.id }))
        
        details.push({
          ticketId: ticket.id,
          ticketName: ticket.name,
          ticketCost: cost,
          elementsJson: JSON.stringify(elementsData)
        })
      }
    })

    const payload = {
      totalCost: parseFloat(totalCost.value),
      details
    }

    await costs.save(payload)
    alert("Le coût total et ses détails ont été sauvegardés avec succès dans SQLite.")
  } catch (err) {
    alert("Erreur lors de l'enregistrement : " + err.message)
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.cost-page {
  padding: 1.5rem;
  max-width: 1180px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}
h1 {
  font-size: 1.8rem;
  color: var(--text-strong);
  margin: 0;
}
.btn-primary {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:hover:not(:disabled) { background: var(--primary-strong); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.state-msg { text-align: center; padding: 2rem; color: var(--muted); }
.error-msg { text-align: center; padding: 1.5rem; color: #e74c3c; background: #fdf3f3; border-radius: 8px; }

.content-wrapper { display: flex; flex-direction: column; gap: 2rem; }

.table-section {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--line);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.section-header h2 { margin: 0; font-size: 1.3rem; }
.total-cost { font-size: 1.2rem; font-weight: 700; color: var(--primary-strong); }
.muted-text { color: var(--muted); font-size: 0.9rem; margin: 0.2rem 0; }

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--line);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  background: #f7f8fa;
  padding: 0.8rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid var(--line);
}
.data-table td {
  padding: 0.8rem;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafafa; }

.cost-input {
  width: 120px;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-align: right;
}
.badge {
  display: inline-block;
  background: #1e1c1c;
  border: 1px solid var(--line);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  margin-right: 0.4rem;
  margin-bottom: 0.4rem;
}
.muted { color: var(--muted); font-style: italic; font-size: 0.9rem; }
.empty-row { text-align: center; color: var(--muted); padding: 1.5rem; font-style: italic; }
</style>