<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ isEdit ? 'Modifier le ticket' : 'Nouveau ticket' }}</h3>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <form class="modal-body" @submit.prevent="onSubmit">
        <!-- Titre -->
        <div class="field">
          <label for="t-name">Titre <span class="req">*</span></label>
          <input id="t-name" v-model="form.name" type="text" required placeholder="Titre du ticket" />
        </div>

        <!-- Type / Statut -->
        <div class="row-2">
          <div class="field">
            <label for="t-type">Type</label>
            <select id="t-type" v-model="form.type">
              <option value="1">Incident</option>
              <option value="2">Demande</option>
            </select>
          </div>
          <div class="field">
            <label for="t-status">Statut</label>
            <select id="t-status" v-model="form.status">
              <option value="1">Nouveau</option>
              <option value="2">En cours (assigné)</option>
              <option value="3">En cours (planifié)</option>
              <option value="4">En attente</option>
              <option value="5">Résolu</option>
              <option value="6">Clos</option>
            </select>
          </div>
        </div>

        <!-- Urgence / Priorité -->
        <div class="row-2">
          <div class="field">
            <label for="t-urgency">Urgence</label>
            <select id="t-urgency" v-model="form.urgency">
              <option value="1">Très basse</option>
              <option value="2">Basse</option>
              <option value="3">Moyenne</option>
              <option value="4">Haute</option>
              <option value="5">Très haute</option>
            </select>
          </div>
          <div class="field">
            <label for="t-priority">Priorité</label>
            <select id="t-priority" v-model="form.priority">
              <option value="1">Très basse</option>
              <option value="2">Basse</option>
              <option value="3">Moyenne</option>
              <option value="4">Haute</option>
              <option value="5">Très haute</option>
              <option value="6">Majeure</option>
            </select>
          </div>
        </div>

        <!-- Description -->
        <div class="field">
          <label for="t-content">Description <span class="req">*</span></label>
          <textarea
            id="t-content"
            v-model="form.content"
            rows="4"
            placeholder="Décrire le problème ou la demande…"
            required
          />
        </div>

        <!-- Assign elements -->
        <div class="field">
          <label>Assigner des éléments (optionnel)</label>
          <div class="elements-list">
            <div v-if="elemsLoading">Chargement des éléments…</div>
            <div v-else>
              <label v-for="it in elements" :key="it.id" class="el-choice">
                <input type="checkbox" :value="it.id" v-model="selectedElements" />
                <span>{{ it._typeLabel ? `${it._typeLabel} — ` : '' }}{{ it.name }}</span>
              </label>
              <div v-if="elements.length===0">Aucun élément disponible.</div>
            </div>
          </div>
        </div>

        <p v-if="validationError" class="error">{{ validationError }}</p>
        <p v-else-if="saveError" class="error">{{ saveError }}</p>

        <div class="modal-footer">
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Enregistrement…' : (isEdit ? 'Mettre à jour' : 'Créer') }}
          </button>
          <button type="button" class="btn-secondary" @click="$emit('close')">Annuler</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const props = defineProps({
  ticket: Object,
  saving: Boolean,
  saveError: String,
})
const emit = defineEmits(['save', 'close'])

const isEdit = computed(() => !!props.ticket?.id)

import { useElements } from '../../composables/useElements.js'

const form = reactive({
  name: props.ticket?.name ?? '',
  type: String(props.ticket?.type ?? 1),
  status: String(props.ticket?.status ?? 1),
  urgency: String(props.ticket?.urgency ?? 3),
  priority: String(props.ticket?.priority ?? 3),
  content: props.ticket?.content ?? '',
})

const { allItems, loadAll, loading: elemsLoading } = useElements()
const elements = allItems
const selectedElements = ref(props.ticket?.items?.map(i=>i.id) || [])

const validationError = ref('')
onMounted(() => { loadAll().catch(()=>{}) })

function onSubmit() {
  // minimal validation: name + content required
  validationError.value = ''
  if (!form.name || !form.content) {
    validationError.value = 'Le nom et la description sont obligatoires.'
    return
  }

  emit('save', {
    name: form.name,
    type: Number(form.type),
    status: Number(form.status),
    urgency: Number(form.urgency),
    priority: Number(form.priority),
    content: form.content,
    // attach selected elements as objects { id, itemtype } so caller can create Item_Ticket
    items: selectedElements.value.map((selId) => {
      const it = elements.value.find((e) => e.id === selId || e.id === Number(selId))
      return { id: Number(selId), itemtype: it?._type ?? it?._typeLabel ?? null }
    })
  })
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 1rem;
}
.modal {
  background: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #eee;
}
.modal-header h3 { margin: 0; font-size: 1.1rem; color: #222; }
.btn-close {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #888;
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  line-height: 1;
}
.btn-close:hover { background: #f5f5f5; color: #333; }

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}
.req { color: #e74c3c; }
input, select, textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.15s;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #3498db;
}
textarea { resize: vertical; }
.error {
  color: #e74c3c;
  font-size: 0.85rem;
  background: #fdf3f3;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  margin: 0;
}
.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;
}
.btn-primary {
  background: #3498db;
  color: #fff;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover:not(:disabled) { background: #2980b9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary {
  background: #fff;
  border: 1px solid #ccc;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
}
.btn-secondary:hover { background: #f5f5f5; }
</style>
