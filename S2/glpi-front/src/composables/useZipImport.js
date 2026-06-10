// src/composables/useZipImport.js
import { ref } from 'vue'
import JSZip from 'jszip'
import { glpiApi } from '../services/glpiApi.js'

const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i

export function useZipImport() {
  const progress = ref(0)
  const total = ref(0)
  const logs = ref([])
  const running = ref(false)

  async function importZip(zipFile) {
    running.value = true
    progress.value = 0
    logs.value = []

    const zip = await JSZip.loadAsync(zipFile)
    const images = []
    zip.forEach((path, entry) => {
      if (!entry.dir && IMAGE_EXT.test(path)) images.push({ path, entry })
    })

    total.value = images.length

    for (let i = 0; i < images.length; i++) {
      const { path, entry } = images[i]
      const filename = path.split('/').pop()
      const docName = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')

      try {
        const blob = await entry.async('blob')
        const mimeType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg'
        const file = new File([blob], filename, { type: mimeType })
        const doc = await glpiApi.uploadDocument(file, docName)
        logs.value.push({ status: 'ok', message: `Document #${doc.id} — ${filename}` })
      } catch (e) {
        logs.value.push({ status: 'error', message: `${filename} : ${e.message}` })
      }

      progress.value = i + 1
    }

    running.value = false
  }

  return { progress, total, logs, running, importZip }
}