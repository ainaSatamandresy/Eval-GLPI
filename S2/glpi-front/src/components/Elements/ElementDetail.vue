<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <div class="detail-modal">
      <div class="modal-header">
        <h3>{{ item._icon }} {{ item.name }}</h3>
        <button @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <dl>
          <dt>Type</dt><dd>{{ item._typeLabel }}</dd>
          <dt>ID GLPI</dt><dd>{{ item.id }}</dd>
          <dt v-if="item.serial">N° de série</dt><dd v-if="item.serial">{{ item.serial }}</dd>
          <dt v-if="item.otherserial">Inventaire</dt><dd v-if="item.otherserial">{{ item.otherserial }}</dd>
          <dt v-if="item.comment">Commentaire</dt><dd v-if="item.comment">{{ item.comment }}</dd>
        </dl>
        <RouterLink :to="`/nouveau-ticket?item=${item._type}&id=${item.id}`" class="btn-primary">
          Signaler un problème sur cet élément
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ item: Object })
defineEmits(['close'])
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.42);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.detail-modal {
  width: min(720px, 100%);
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.4rem;
  border-bottom: 1px solid var(--line);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-strong);
}

.modal-header button {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
}

.modal-body {
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

dl {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 0.75rem 1rem;
  margin: 0;
}

dt {
  color: var(--muted);
  font-weight: 700;
}

dd {
  margin: 0;
  color: var(--text-strong);
}

@media (max-width: 640px) {
  dl {
    grid-template-columns: 1fr;
    gap: 0.4rem 0.75rem;
  }
}
</style>