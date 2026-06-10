<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <div class="detail-modal">
      <div class="header">
        <h3>Détails du ticket <small>#{{ ticket.id }}</small></h3>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <div class="content">
        <section class="meta">
          <div><strong>Nom:</strong> {{ ticket.name }}</div>
          <div><strong>Statut:</strong> {{ ticket.status?.name ?? ticket.status }}</div>
          <div><strong>Type:</strong> {{ ticket.type }}</div>
          <div><strong>Urgence:</strong> {{ ticket.urgency }}</div>
          <div><strong>Priorité:</strong> {{ ticket.priority }}</div>
          <div><strong>Créé le:</strong> {{ ticket.date_creation }}</div>
        </section>

        <section class="desc">
          <h4>Description</h4>
          <div v-html="ticket.content"></div>
        </section>

        <section class="assigned">
          <h4>Éléments assignés</h4>
          <ul>
            <li v-for="(it, idx) in ticket.items || ticket.elements || []" :key="idx">
              {{ it.name ?? it.display_name ?? it }}
            </li>
            <li v-if="!(ticket.items || ticket.elements) || (ticket.items||[]).length===0">Aucun élément assigné.</li>
          </ul>
        </section>

        <section class="team">
          <h4>Équipe</h4>
          <ul>
            <li v-for="member in ticket.team || []" :key="member.id">{{ member.role }} — {{ member.display_name || member.name }}</li>
            <li v-if="!(ticket.team||[]).length">Aucune équipe renseignée.</li>
          </ul>
        </section>

        <section class="raw">
          <h4>JSON brut</h4>
          <pre>{{ pretty }}</pre>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ ticket: Object })

const pretty = computed(() => JSON.stringify(props.ticket, null, 2))
</script>

<style scoped>
.detail-modal { background:#fff; border-radius:10px; width:100%; max-width:860px; max-height:90vh; overflow:auto; box-shadow:0 18px 48px rgba(0,0,0,0.24); }
.header { display:flex; align-items:center; justify-content:space-between; padding:1rem; border-bottom:1px solid #eee }
.content { padding:1rem 1.25rem; display:flex; flex-direction:column; gap:1rem }
.meta { display:flex; gap:1rem; flex-wrap:wrap }
.desc { background:#fafafa; padding:0.8rem; border-radius:8px }
.assigned ul, .team ul { list-style:none; padding:0; margin:0 } 
.raw pre { background:#0f1720; color:#dbeafe; padding:0.8rem; border-radius:6px; overflow:auto }
.btn-close { background:none; border:none; font-size:1rem; cursor:pointer }
.overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); z-index:400 }
</style>
