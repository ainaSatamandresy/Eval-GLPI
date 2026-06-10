<template>
  <div class="stat-card" :class="{ 'stat-card--error': error }">
    <div class="card-label">{{ label }}</div>
    <div class="card-count">
      <span v-if="loading" class="skeleton">—</span>
      <span v-else>{{ total.toLocaleString('fr-FR') }}</span>
    </div>
    <div class="card-status">
      <span v-if="error" class="dot dot--error">● Erreur</span>
      <span v-else class="dot dot--ok">● En ligne</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label:   { type: String, required: true },
  total:   { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  error:   { type: Boolean, default: false },
})
</script>

<style scoped>
.stat-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 1.25rem 1rem;
  text-align: center;
  min-width: 120px;
  transition: box-shadow 0.15s;
}
.stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.stat-card--error { border-color: #fad7d7; background: #fff5f5; }
.card-label { font-size: 0.82rem; color: #777; margin-bottom: 0.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.card-count { font-size: 2rem; font-weight: 700; color: #222; margin-bottom: 0.4rem; }
.skeleton { color: #ddd; }
.dot { font-size: 0.78rem; }
.dot--ok    { color: #27ae60; }
.dot--error { color: #e74c3c; }
</style>