<template>
  <aside class="app-sidebar">
    <div class="brand">
      <div class="brand-logo">GLPI-NewApp</div>
    </div>
    <nav class="sidebar-nav">
      <RouterLink to="/dashboard" class="nav-item"><span>Dashboard</span></RouterLink>
      <RouterLink to="/import" class="nav-item"> <span>Import</span></RouterLink>
      <RouterLink to="/tickets" class="nav-item"> <span>Tickets</span></RouterLink>
      <RouterLink to="/reinitialisation" class="nav-item"> <span>Réinitialisation</span></RouterLink>
      <RouterLink to="/elements" class="nav-item"> <span>Éléments</span></RouterLink>
      <RouterLink to="/kanban-settings" class="nav-item"> <span>Enregistrer dans SQLite</span></RouterLink>
    </nav>
    <div class="sidebar-footer">
      <small>GLPI-NewApp</small>
    </div>
  </aside>
</template>

<script setup>
// UI-only component — no logic changes
</script>

<style scoped>
.app-sidebar {
  width: 220px;
  background: var(--surface);
  border-right: 1px solid var(--line);
  height: calc(100vh - 24px);
  padding: 1rem 0.5rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: sticky;
  top: 12px;
  border-radius: 12px;
}
.brand {
  padding: 0 0.6rem;
  margin-bottom: 0.2rem;
}
.brand-logo {
  font-weight: 800;
  color: var(--primary-strong);
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 1.05rem;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.25rem 0.35rem;
  flex: 1;
}
.nav-item {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  padding: 0.55rem 0.65rem;
  border-radius: 10px;
  color: var(--text);
  text-decoration: none;
  font-weight: 600;
  transition: background 0.12s, transform 0.12s;
}
.nav-item:hover {
  background: var(--accent-soft);
  transform: translateY(-2px);
}
.nav-item span { color: var(--text); }
.sidebar-footer { padding: 0 0.8rem; color: var(--text-muted); }

@media (max-width: 900px) {
  .app-sidebar { display: none; }
}
</style>
