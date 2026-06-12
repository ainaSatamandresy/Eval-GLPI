const fs = require('fs')

const path = '/var/www/html/GLPI-Ici/S2/glpi-front/src/views/TicketCostView.vue'
let fileContent = fs.readFileSync(path, 'utf8')

// Table headers
fileContent = fileContent.replace('<th>Coût (€)</th>', 
`<th>Coût Initial (€)</th>
                <th>Pénalité Réouv. (€)</th>
                <th>Coût Total (€)</th>`)

// Table body
fileContent = fileContent.replace(`<td>
                  <input type="number" 
                         v-model.number="ticketCosts[ticket.id]" 
                         class="cost-input" 
                         min="0" 
                         placeholder="0.0" />
                </td>`,
`<td>
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
                </td>`)

// Add reactive refs
fileContent = fileContent.replace('const ticketCosts = ref({})', 
`const ticketCosts = ref({})
const ticketCostsBase = ref({})
const ticketCostsPenalty = ref({})`)

// Update loadData
const originalLoadData = `fetchedTickets.forEach(t => { 
      initCosts[t.id] = 0 
      initDurations[t.id] = 0
    })`

const newLoadData = `const initCostsBase = {}
    const initCostsPenalty = {}
    fetchedTickets.forEach(t => { 
      initCosts[t.id] = 0 
      initCostsBase[t.id] = 0
      initCostsPenalty[t.id] = 0
      initDurations[t.id] = 0
    })`
fileContent = fileContent.replace(originalLoadData, newLoadData)

const originalCostLoop = `        matchingCosts.forEach(c => {
          const actionTime = Number(c.actiontime) || 0
          const costTime = Number(c.cost_time) || 0
          const costFixed = Number(c.cost_fixed) || 0
          
          totalDuration += actionTime
          
          // Si on a une durée, on considère cost_time comme un taux horaire (comme souvent dans GLPI)
          if (actionTime > 0) {
            sum += (actionTime / 3600) * costTime + costFixed
          } else {
            // Sinon on additionne simplement les coûts fixes et temps
            sum += costTime + costFixed
          }
        })
        
        initDurations[t.id] = totalDuration
        if (sum > 0) initCosts[t.id] = parseFloat(sum.toFixed(2))`

const newCostLoop = `        let sumBase = 0
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
        if (sumBase + sumPenalty > 0) initCosts[t.id] = parseFloat((sumBase + sumPenalty).toFixed(2))`

fileContent = fileContent.replace(originalCostLoop, newCostLoop)

const originalSetVals = `ticketCosts.value = initCosts
    ticketDurations.value = initDurations`

const newSetVals = `ticketCosts.value = initCosts
    ticketCostsBase.value = initCostsBase
    ticketCostsPenalty.value = initCostsPenalty
    ticketDurations.value = initDurations`

fileContent = fileContent.replace(originalSetVals, newSetVals)

// totalCost computed
const originalTotalCost = `const totalCost = computed(() => {
  let total = 0
  for (const key in ticketCosts.value) {
    total += Number(ticketCosts.value[key]) || 0
  }
  return total.toFixed(2)
})`

const newTotalCost = `const totalCost = computed(() => {
  let total = 0
  for (const key in ticketCostsBase.value) {
    total += (Number(ticketCostsBase.value[key]) || 0) + (Number(ticketCostsPenalty.value[key]) || 0)
  }
  return total.toFixed(2)
})`
fileContent = fileContent.replace(originalTotalCost, newTotalCost)

// groupedCosts computed
const originalGroupedCosts = `    const cost = Number(ticketCosts.value[ticket.id]) || 0
    if (cost <= 0) return`

const newGroupedCosts = `    const base = Number(ticketCostsBase.value[ticket.id]) || 0
    const pen = Number(ticketCostsPenalty.value[ticket.id]) || 0
    const cost = base + pen
    if (cost <= 0) return`
fileContent = fileContent.replace(originalGroupedCosts, newGroupedCosts)

// saveCosts
const originalSaveCosts = `    tickets.value.forEach(ticket => {
      const cost = Number(ticketCosts.value[ticket.id]) || 0
      if (cost > 0) { // Ne sauvegarder que les tickets avec un coût
        const items = ticketItems.value[ticket.id] || []
        const elementsData = items.map(i => ({ type: i.itemtype, id: i.id }))
        
        details.push({
          ticketId: ticket.id,
          ticketName: ticket.name,
          ticketCost: cost,
          elementsJson: JSON.stringify(elementsData)
        })
      }
    })`

const newSaveCosts = `    tickets.value.forEach(ticket => {
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
    })`

fileContent = fileContent.replace(originalSaveCosts, newSaveCosts)


fs.writeFileSync(path, fileContent)
