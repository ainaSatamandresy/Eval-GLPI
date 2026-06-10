import { ref } from 'vue'
import { glpiApi } from '../services/glpiApi.js'

function parseDecimal(str) {
  return parseFloat(String(str).replace(',', '.')) || 0
}

export function useFeuille3Import() {
  const progress = ref(0)
  const total = ref(0)
  const logs = ref([])
  const running = ref(false)

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/)
    const sep = lines[0].includes(';') ? ';' : ','
    const headers = lines[0].split(sep).map((h) => h.trim())
    return lines.slice(1).map((line) => {
      const values = []
      let inQuotes = false, cur = ''
      for (const ch of line + sep) {
        if (ch === '"') { inQuotes = !inQuotes; continue }
        if (ch === sep && !inQuotes) { values.push(cur.trim()); cur = ''; continue }
        cur += ch
      }
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
    })
  }

  async function importFile(file, ticketRefMap = {}) {
    running.value = true
    progress.value = 0
    logs.value = []

    const text = await file.text()
    const rows = parseCSV(text)
    total.value = rows.length
    let success = 0, failure = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const ticketGlpiId = ticketRefMap[row['Num_Ticket']]

      if (!ticketGlpiId) {
        logs.value.push({ status: 'error', message: `Ligne ${i + 2} : Ref_Ticket ${row['Num_Ticket']} introuvable` })
        failure++
        progress.value = i + 1
        continue
      }

      try {
        const input = {
          tickets_id:  ticketGlpiId,
          name:        `Coût — ticket ${row['Num_Ticket']}`,
          actiontime:  parseInt(row['Duration_second']) || 0,
          cost_time:   parseDecimal(row['Time_Cost']),
          cost_fixed:  parseDecimal(row['Fixed_Cost']),
        }

        await glpiApi.createItem('TicketCost', input)
        logs.value.push({ status: 'ok', message: `Coût ticket #${ticketGlpiId} — fixe: ${input.cost_fixed}, temps: ${input.cost_time}` })
        success++
      } catch (e) {
        logs.value.push({ status: 'error', message: `Ligne ${i + 2} : ${e.message}` })
        failure++
      }

      progress.value = i + 1
    }

    running.value = false
    return { success, failure }
  }

  return { progress, total, logs, running, importFile }
}