const fs = require('fs')

const path = '/var/www/html/GLPI-Ici/S2/glpi-front/src/views/TicketsView.vue'
let fileContent = fs.readFileSync(path, 'utf8')

// Inject pendingReopen refs
if (!fileContent.includes('const pendingReopen')) {
    fileContent = fileContent.replace('const detailTicket = ref(null)', 
`const detailTicket = ref(null)

const pendingReopen = ref(null)
const reopenChoice = ref('cancel')
const reopenPercent = ref(0)
const reopenSaving = ref(false)
`)
}

// Update onDrop
const onDropContent = `async function onDrop(event, newStatus) {
  event.preventDefault()
  const id = event.dataTransfer.getData('text/plain')
  if (!id) return
  const ticket = tickets.value.find((t) => String(t.id) === String(id))
  if (!ticket) return
  if (Number(ticket.status) === Number(newStatus)) return

  // Re-opening check
  if (Number(ticket.status) === 6 && Number(newStatus) !== 6) {
    pendingReopen.value = { ticket, newStatus }
    reopenChoice.value = 'cancel'
    reopenPercent.value = 0
    return
  }

  // optional prompt when assigning
  let extra = null
  if (Number(newStatus) === 2) {
    extra = window.prompt('Saisir un commentaire (optionnel) pour l\\'assignation :')
  }

  // prompt when completed
  let ticketCost = null
  if (Number(newStatus) === 6) {
    const costInput = window.prompt('Saisir le coût du ticket pour l\\'enregistrement dans SQLite :')
    if (costInput !== null && costInput.trim() !== '') {
       ticketCost = parseFloat(costInput.replace(',', '.'))
       if (isNaN(ticketCost) || ticketCost < 0) {
          alert("Le coût entré est invalide. L'enregistrement du coût est annulé.")
          return
       }
    }
  }

  await doStatusChange(ticket, newStatus, ticketCost, extra, null)
}

async function doStatusChange(ticket, newStatus, ticketCost, extra, reopenData) {
  const payload = { status: Number(newStatus) }
  if (extra && extra.trim()) payload.content = (ticket.content ?? '') + '\\n' + extra

  try {
    reopenSaving.value = true
    await glpiApi.patchItem('Ticket', ticket.id, payload)
    // update local state
    const idx = tickets.value.findIndex((t) => t.id === ticket.id)
    if (idx !== -1) tickets.value[idx].status = Number(newStatus)
    await logs.create({ action: 'PATCH', itemtype: 'Ticket', glpiId: ticket.id, payload: JSON.stringify({ input: payload }), status: 'SUCCESS' }).catch(()=>{})

    if (ticketCost !== null) {
      let elements = []
      try {
        const rawItems = await glpiApi.getItemsRaw('Item_Ticket', { range: '0-999' })
        const assocList = Array.isArray(rawItems) ? rawItems : (rawItems.data || [])
        elements = assocList
            .filter(a => String(a.tickets_id) === String(ticket.id))
            .map(a => ({ id: a.items_id, type: a.itemtype }))
      } catch (e) {
        console.error("Impossible de fetch Item_Ticket", e)
      }

      await costs.save({
        totalCost: ticketCost,
        details: [{
          ticketId: ticket.id,
          ticketName: ticket.name,
          ticketCost: ticketCost,
          elementsJson: JSON.stringify(elements)
        }]
      }).catch(err => {
        alert("Erreur lors de l'enregistrement du coût dans SQLite : " + err.message)
      })

      await glpiApi.createItem('TicketCost', {
          tickets_id: ticket.id,
          name: \`Coût Résolu Kanban — Ticket \${ticket.id}\`,
          cost_time: ticketCost,
          cost_fixed: 0,
      }).catch(e => console.error("Erreur saving to GLPI TicketCost", e))
    }

    if (reopenData) {
        if (reopenData.choice === 'cancel') {
            try {
                const rawCosts = await glpiApi.getItemsRaw('TicketCost', { range: '0-999' })
                const costList = Array.isArray(rawCosts) ? rawCosts : (rawCosts.data || [])
                const matchingCosts = costList.filter(c => String(c.tickets_id) === String(ticket.id))
                for (let c of matchingCosts) {
                    await glpiApi.deleteItem('TicketCost', c.id)
                }
                await costs.deleteByTicketId(ticket.id).catch(()=>{})
            } catch (e) { console.error("Erreur annulation du coût", e) }
        } else if (reopenData.choice === 'reopen') {
            try {
                const rawCosts = await glpiApi.getItemsRaw('TicketCost', { range: '0-999' })
                const costList = Array.isArray(rawCosts) ? rawCosts : (rawCosts.data || [])
                const matchingCosts = costList.filter(c => String(c.tickets_id) === String(ticket.id))
                let oldCost = 0;
                matchingCosts.forEach(c => {
                   const actionTime = Number(c.actiontime) || 0
                   const ct = Number(c.cost_time) || 0
                   const f = Number(c.cost_fixed) || 0
                   if (actionTime > 0) oldCost += (actionTime / 3600) * ct + f
                   else oldCost += ct + f
                });
                
                const penaltyCost = parseFloat((oldCost * reopenData.percent / 100).toFixed(2));
                
                await glpiApi.createItem('TicketCost', {
                    tickets_id: ticket.id,
                    name: \`Pénalité réouverture Kanban\`,
                    cost_time: penaltyCost,
                    cost_fixed: 0,
                }).catch(e => console.error(e))

                let elements = []
                try {
                  const rawItems = await glpiApi.getItemsRaw('Item_Ticket', { range: '0-999' })
                  const assocList = Array.isArray(rawItems) ? rawItems : (rawItems.data || [])
                  elements = assocList
                      .filter(a => String(a.tickets_id) === String(ticket.id))
                      .map(a => ({ id: a.items_id, type: a.itemtype }))
                } catch(e) {}
                
                await costs.save({
                    totalCost: penaltyCost,
                    details: [{
                        ticketId: ticket.id,
                        ticketName: "Pénalité réouverture",
                        ticketCost: penaltyCost,
                        elementsJson: JSON.stringify(elements)
                    }]
                }).catch(()=>{})
            } catch (e) {
               console.error("Erreur pénalité réouverture", e)
            }
        }
    }
  } catch (e) {
    await logs.create({ action: 'PATCH', itemtype: 'Ticket', glpiId: ticket.id, status: 'ERROR', errorMessage: e.message }).catch(()=>{})
    alert('Erreur lors du changement de statut : ' + e.message)
  } finally {
    reopenSaving.value = false
    pendingReopen.value = null
  }
}`

const originalOnDropStartRegex = /async function onDrop\(event, newStatus\) \{[\s\S]*?async function loadKanbanSettings\(\)/;
fileContent = fileContent.replace(originalOnDropStartRegex, onDropContent + '\n\nasync function loadKanbanSettings()')


// Add confirmingReopen method
const confirmMethods = `
async function confirmReopen() {
  if (!pendingReopen.value) return
  const { ticket, newStatus } = pendingReopen.value
  let reopenData = { choice: reopenChoice.value, percent: reopenPercent.value }
  await doStatusChange(ticket, newStatus, null, null, reopenData)
}

function cancelReopen() {
  pendingReopen.value = null
}
`

if (!fileContent.includes('async function confirmReopen')) {
    fileContent = fileContent.replace('onMounted(loadKanbanSettings)', 'onMounted(loadKanbanSettings)\n' + confirmMethods)
}

// Add DOM for modal
const modalHTML = `
    <!-- Modal réouverture -->
    <div v-if="pendingReopen" class="overlay">
      <div class="confirm-modal reopen-modal">
        <h3>Réouverture du ticket</h3>
        <p>Le ticket <strong>[{{ pendingReopen.ticket.id }}]</strong> était clos.</p>
        
        <div class="reopen-opts">
          <label>
            <input type="radio" value="cancel" v-model="reopenChoice" />
            <span>Annuler le coût : le coût de fermeture précédent est supprimé définitivement.</span>
          </label>
          <label>
            <input type="radio" value="reopen" v-model="reopenChoice" />
            <span>Réouverture avec pénalité :</span>
          </label>
          
          <div v-if="reopenChoice === 'reopen'" class="reopen-bonus-field">
            Compléter le pourcentage :
            <input type="number" min="0" v-model.number="reopenPercent" style="width: 80px"/> %
            <div class="muted" style="margin-top: 4px; font-size: 0.85em;">Le coût du ticket sera mis à jour avec : <i>l'ancien coût + (n% de cet ancien coût)</i>.</div>
          </div>
        </div>

        <div class="confirm-actions">
          <button class="btn-primary" :disabled="reopenSaving" @click="confirmReopen">
            {{ reopenSaving ? 'Traitement...' : 'Valider' }}
          </button>
          <button class="btn-secondary" @click="cancelReopen">Annuler le déplacement</button>
        </div>
      </div>
    </div>`

if (!fileContent.includes('<!-- Modal réouverture -->')) {
    fileContent = fileContent.replace('<!-- Modal création / édition -->', modalHTML + '\n\n    <!-- Modal création / édition -->')
}

// Add CSS for modal
const modalCSS = `
.reopen-opts { margin: 1.2rem 0; display: flex; flex-direction: column; gap: 0.8rem; }
.reopen-opts label { display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; font-size: 0.95rem; }
.reopen-opts input[type="radio"] { margin-top: 0.2rem; }
.reopen-bonus-field { margin-left: 1.5rem; background: #fafafa; padding: 0.8rem; border-radius: 8px; border: 1px solid #eee; margin-top: 0.5rem; }
`
if (!fileContent.includes('.reopen-opts')) {
    fileContent = fileContent.replace('/* Modal confirmation */', '/* Modal confirmation */' + modalCSS)
}

fs.writeFileSync(path, fileContent)
