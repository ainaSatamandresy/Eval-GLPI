<template>
  <div class="element-card" @click="$emit('select', item)">
    <span class="icon">{{ item._icon }}</span>
    <div class="info">
      <span class="name">{{ item.name || '(sans nom)' }}</span>
      <span class="meta">[{{ item.id }}] · {{ item._typeLabel }}</span>
    </div>
    <div class="badges">
      <span v-if="item.serial" class="badge-serial">{{ item.serial }}</span>
      <span :class="['badge-state', stateClass]">{{ stateLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ item: Object })
defineEmits(['select'])

const STATE_LABELS = { 0: 'En service', 1: 'En panne', 2: 'En réparation', 3: 'Mis au rebut' }
const STATE_CLASSES = { 0: 'state-ok', 1: 'state-down', 2: 'state-repair', 3: 'state-retired' }

const stateLabel = computed(() => STATE_LABELS[props.item.states_id ?? 0] ?? 'Inconnu')
const stateClass = computed(() => STATE_CLASSES[props.item.states_id ?? 0] ?? '')
</script>

<style scoped>
.element-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}
.element-card:hover {
  background: #fff;
  transform: translateY(-1px);
  box-shadow: inset 0 0 0 999px rgba(19, 99, 223, 0.01);
}
.icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.15rem;
  background: var(--primary-soft);
  color: var(--primary-strong);
}
.info { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.name { font-weight: 700; font-size: 0.98rem; color: var(--text-strong); }
.meta { font-size: 0.82rem; color: var(--muted); }
.badges { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.badge-serial { font-size: 0.78rem; color: var(--muted); font-family: monospace; }
.badge-state { font-size: 0.75rem; padding: 0.28rem 0.6rem; border-radius: 999px; font-weight: 700; }
.state-ok     { background: rgba(31, 157, 99, 0.12); color: var(--success); }
.state-down   { background: rgba(214, 69, 69, 0.12); color: var(--danger); }
.state-repair { background: rgba(217, 119, 6, 0.12); color: var(--warning); }
.state-retired { background: rgba(100, 116, 139, 0.12); color: var(--muted); }

@media (max-width: 720px) {
  .element-card {
    grid-template-columns: auto 1fr;
  }

  .badges {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
</style>