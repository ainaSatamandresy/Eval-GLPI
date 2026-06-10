<template>
  <div class="overlay">
    <div class="modal">
      <h3>Confirmer la suppression</h3>
      <p>
        Vous allez supprimer <strong>{{ count }}</strong>
        élément(s) de type <strong>{{ itemtype }}</strong>.
      </p>
      <p class="warning">Cette action est irréversible.</p>
      <div class="modal-actions">
        <button class="btn-danger" @click="$emit('confirm')">Confirmer</button>
        <button class="btn-cancel" @click="$emit('cancel')">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ count: Number, itemtype: String })
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
  backdrop-filter: blur(6px);
}
.modal {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 2rem;
  max-width: 420px;
  width: 90%;
  border: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
}
.modal h3 { margin: 0 0 0.75rem; color: var(--text-strong); }
.modal p { margin: 0.3rem 0; }
.warning { color: var(--danger); font-weight: 700; margin-top: 0.5rem !important; }
.modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
.btn-danger {
  padding: 0.7rem 1.2rem;
}
.btn-cancel {
  padding: 0.7rem 1.2rem;
}
</style>
