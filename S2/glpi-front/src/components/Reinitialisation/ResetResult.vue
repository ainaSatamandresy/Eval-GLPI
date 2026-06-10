<template>
  <div class="reset-result">
    <div class="stats">
      <div class="stat success">
        <span class="count">{{ successCount }}</span>
        <span class="label">supprimé(s)</span>
      </div>
      <div v-if="failCount > 0" class="stat fail">
        <span class="count">{{ failCount }}</span>
        <span class="label">échec(s)</span>
      </div>
    </div>

    <details v-if="failCount > 0" class="errors">
      <summary>Voir les erreurs ({{ failCount }})</summary>
      <ul>
        <li v-for="(r, i) in failedItems" :key="i">
          ID {{ Object.keys(r)[0] }} — {{ r.message || 'Erreur inconnue' }}
        </li>
      </ul>
    </details>

    <button class="btn-secondary" @click="$emit('recommencer')">
      Nouvelle sélection
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ results: Array })
defineEmits(['recommencer'])

const successCount = computed(() =>
  props.results.filter((r) => Object.values(r).some((v) => v === true)).length
)
const failCount = computed(() => props.results.length - successCount.value)
const failedItems = computed(() =>
  props.results.filter((r) => !Object.values(r).some((v) => v === true))
)
</script>

<style scoped>
.reset-result { margin-top: 1.5rem; }
.stats { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 2rem;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.86);
}
.stat.success { box-shadow: inset 0 0 0 1px rgba(31, 157, 99, 0.2); }
.stat.fail    { box-shadow: inset 0 0 0 1px rgba(214, 69, 69, 0.18); }
.count { font-size: 2rem; font-weight: 700; }
.label { font-size: 0.85rem; color: var(--muted); }
.errors { margin: 1rem 0; font-size: 0.9rem; color: var(--danger); }
.errors ul { margin: 0.5rem 0 0 1.2rem; }
.btn-secondary {
  padding: 0.7rem 1.2rem;
}
</style>
