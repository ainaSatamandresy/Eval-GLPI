<template>
  <main class="page">
    <ResetPanel />
  </main>
</template>

<script setup>
import ResetPanel from '../components/Reinitialisation/ResetPanel.vue'
</script>

<style scoped>
.page {
  padding: 1.5rem;
  max-width: 1120px;
  margin: 0 auto;
  border-radius: var(--radius-xl);
}
</style>
