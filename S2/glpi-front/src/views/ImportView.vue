<template>
    <div class="import-page">
        <h1>Import de données — Jour 1</h1>

        <div class="import-grid">
            <section class="import-section">
                <h3>1. Éléments du parc <span class="badge">Feuille 1.csv</span></h3>
                <p class="hint">Computer, Monitor… (colonnes : Name, Status, Location, Manufacturer, Item_Type, Model,
                    Inventory_Number, User)</p>
                <!-- <FileDropZone label="Feuille 1.csv" accept=".csv" @update:file="(f) => files.feuille1 = f" /> -->
                <input type="file" ref="inputFeuille1" accept=".csv" @change="onFileChange($event, 'feuille1')">
                <div v-if="files.feuille1" class="alert alert-info file-info-row">
                    <div>
                        <strong>📄 {{ files.feuille1.name }}</strong>
                        <small class="block text-secondary">{{ formatSize(files.feuille1.size) }}</small>
                    </div>
                    <button type="button" class="secondary" @click="clearFile('feuille1')">✕ Effacer</button>
                </div>
            </section>

            <section class="import-section">
                <h3>2. Tickets <span class="badge">Feuille 2.csv</span></h3>
                <p class="hint">Incidents / Demandes (colonnes : Ref_Ticket, Date, Heure, Type, Titre, Description,
                    Status, Priority, Items)</p>
                <!-- <FileDropZone label="Feuille 2.csv" accept=".csv" @update:file="(f) => files.feuille2 = f" /> -->
                <input type="file" ref="inputFeuille2" accept=".csv" @change="onFileChange($event, 'feuille2')">
                <div v-if="files.feuille2" class="alert alert-info file-info-row">
                    <div>
                        <strong>📄 {{ files.feuille2.name }}</strong>
                        <small class="block text-secondary">{{ formatSize(files.feuille2.size) }}</small>
                    </div>
                    <button type="button" class="secondary" @click="clearFile('feuille2')">✕ Effacer</button>
                </div>
            </section>

            <section class="import-section">
                <h3>3. Coûts tickets <span class="badge">Feuille 3.csv</span></h3>
                <p class="hint">Coûts associés (colonnes : Num_Ticket, Duration_second, Time_Cost, Fixed_Cost)</p>
                <!-- <FileDropZone label="Feuille 3.csv" accept=".csv" @update:file="(f) => files.feuille3 = f" /> -->
                <input type="file" ref="inputFeuille3" accept=".csv" @change="onFileChange($event, 'feuille3')">
                <div v-if="files.feuille3" class="alert alert-info file-info-row">
                    <div>
                        <strong>📄 {{ files.feuille3.name }}</strong>
                        <small class="block text-secondary">{{ formatSize(files.feuille3.size) }}</small>
                    </div>
                    <button type="button" class="secondary" @click="clearFile('feuille3')">✕ Effacer</button>
                </div>
            </section>

            <section class="import-section">
                <h3>4. Images <span class="badge">.zip</span></h3>
                <p class="hint">Photos des éléments (.jpg / .png dans une archive ZIP)</p>
                <!-- <FileDropZone label="images.zip" accept=".zip" @update:file="(f) => files.zip = f" /> -->
                <input type="file" ref="inputZip" accept=".zip" @change="onFileChange($event, 'zip')">
                <div v-if="files.zip" class="alert alert-info file-info-row">
                    <div>
                        <strong>📄 {{ files.zip.name }}</strong>
                        <small class="block text-secondary">{{ formatSize(files.zip.size) }}</small>
                    </div>
                    <button type="button" class="secondary" @click="clearFile('photos')">✕ Effacer</button>
                </div>
            </section>
        </div>

        <div class="import-actions">
            <button class="btn-primary" :disabled="!hasFiles || running" @click="runImport">
                {{ running ? `Import en cours… (étape ${currentStep}/4)` : 'Lancer l\'import' }}
            </button>
        </div>

        <!-- Progression en temps réel -->
        <div v-if="running || allLogs.length > 0" class="import-log-section">
            <div v-for="(step, i) in stepLogs" :key="i" class="step-block">
                <h4>{{ step.label }}</h4>
                <div class="progress-bar-wrap">
                    <div class="progress-bar" :style="{ width: step.pct + '%' }"></div>
                </div>
                <ul class="log-list">
                    <li v-for="(entry, j) in step.logs.slice(-10)" :key="j" :class="entry.status">
                        {{ entry.status === 'ok' ? '✓' : entry.status === 'warn' ? '⚠' : '✗' }} {{ entry.message }}
                    </li>
                </ul>
            </div>
        </div>

        <!-- Rapport final -->
        <!-- <ImportReport v-if="report" :report="report" @reset="resetAll" /> -->
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// import FileDropZone from '../components/Import/FileDropZone.vue'
// import ImportReport from '../components/Import/ImportReport.vue'
import { useFeuille1Import } from '../composables/useFeuille1Import.js'
import { useFeuille2Import } from '../composables/useFeuille2Import.js'
import { useFeuille3Import } from '../composables/useFeuille3Import.js'
import { useZipImport } from '../composables/useZipImport.js'

const inputFeuille1 = ref(null)
const inputFeuille2 = ref(null)
const inputFeuille3 = ref(null)
const inputZip = ref(null)

const files = ref({ feuille1: null, feuille2: null, feuille3: null, zip: null })
const currentStep = ref(0)
const report = ref(null)
const running = ref(false)
const fileError = ref('')

const f1 = useFeuille1Import()
const f2 = useFeuille2Import()
const f3 = useFeuille3Import()
const zip = useZipImport()

const hasFiles = computed(() => /* Object.values(files.value).some(Boolean)*/files.value.feuille1 || files.value.feuille2 || files.value.feuille3 || files.value.zip )

const stepLogs = computed(() => [
    { label: '1. Éléments du parc', logs: f1.logs.value, pct: f1.total.value ? (f1.progress.value / f1.total.value) * 100 : 0 },
    { label: '2. Tickets', logs: f2.logs.value, pct: f2.total.value ? (f2.progress.value / f2.total.value) * 100 : 0 },
    { label: '3. Coûts tickets', logs: f3.logs.value, pct: f3.total.value ? (f3.progress.value / f3.total.value) * 100 : 0 },
    { label: '4. Images ZIP', logs: zip.logs.value, pct: zip.total.value ? (zip.progress.value / zip.total.value) * 100 : 0 },
].filter((s) => s.logs.length > 0))

const allLogs = computed(() => [...f1.logs.value, ...f2.logs.value, ...f3.logs.value, ...zip.logs.value])

async function runImport() {
    running.value = true
    report.value = null
    const results = []

    // Étape 1 — Éléments
    if (files.value.feuille1) {
        currentStep.value = 1
        const r = await f1.importFile(files.value.feuille1)
        results.push({ label: 'Éléments (Feuille 1)', ...r })
    }

    // Étape 2 — Tickets (utilise la map éléments de l'étape 1)
    if (files.value.feuille2) {
        currentStep.value = 2
        const r = await f2.importFile(files.value.feuille2, f1.itemNameMap)
        results.push({ label: 'Tickets (Feuille 2)', ...r })
    }

    // Étape 3 — Coûts (utilise la map tickets de l'étape 2)
    if (files.value.feuille3) {
        currentStep.value = 3
        const r = await f3.importFile(files.value.feuille3, f2.ticketRefMap)
        results.push({ label: 'Coûts (Feuille 3)', ...r })
    }

    // Étape 4 — Images ZIP
    if (files.value.zip) {
        currentStep.value = 4
        await zip.importZip(files.value.zip)
        const okCount = zip.logs.value.filter((l) => l.status === 'ok').length
        results.push({ label: 'Images (ZIP)', success: okCount, failure: zip.logs.value.length - okCount })
    }

    report.value = results
    running.value = false
    resetAll()
}

function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function onFileChange(e, key) {
    const f = e.target.files[0]
    if (!f) return
    fileError.value = ''
    // if (!validate(f, key)) { e.target.value = ''; return }
    files.value[key] = f
}

function clearFile(key) {
    files.value[key] = null
    const refs = { feuille1: inputFeuille1, feuille2: inputFeuille2, feuille3: inputFeuille3, images: inputZip }
    if (refs[key].value) refs[key].value.value = ''
    fileError.value = ''
}

function resetAll() {
    files.value = { feuille1: null, feuille2: null, feuille3: null, zip: null }
    report.value = null
}
</script>

<style scoped>
.import-page {
    padding: 1.5rem 2rem;
    max-width: 900px;
    margin: 0 auto;
}

h1 {
    margin: 0 0 1.5rem;
}

.import-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.import-section {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 1.25rem;
}

.import-section h3 {
    margin: 0 0 0.4rem;
    font-size: 0.95rem;
}

.badge {
    background: #ebf5fb;
    color: #2980b9;
    font-size: 0.75rem;
    padding: 0.1rem 0.5rem;
    border-radius: 10px;
    font-weight: 600;
}

.hint {
    font-size: 0.78rem;
    color: #999;
    margin: 0 0 0.75rem;
}

.import-actions {
    margin: 1rem 0 1.5rem;
}

.step-block {
    margin-bottom: 1.5rem;
}

.step-block h4 {
    margin: 0 0 0.4rem;
    font-size: 0.9rem;
    color: #555;
}

.progress-bar-wrap {
    height: 6px;
    background: #eee;
    border-radius: 3px;
    margin-bottom: 0.4rem;
}

.progress-bar {
    height: 100%;
    background: #3498db;
    border-radius: 3px;
    transition: width 0.15s;
}

.log-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 160px;
    overflow-y: auto;
    font-size: 0.82rem;
}

.log-list li.ok {
    color: #27ae60;
}

.log-list li.warn {
    color: #e67e22;
}

.log-list li.error {
    color: #e74c3c;
}

.btn-primary {
    background: #3498db;
    color: #fff;
    border: none;
    padding: 0.65rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>