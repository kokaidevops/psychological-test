<template>
  <section class="py-12 border-b border-border">
    <div class="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      <div class="lg:col-span-5">
        <div class="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Verifikasi Sesi</div>
        <h2 class="font-display text-4xl lg:text-5xl font-light leading-[1.05] tracking-tight">
          Pindai barcode<br>
          <em class="italic text-accent">undangan</em> Anda.
        </h2>
        <p class="mt-5 text-muted text-sm leading-relaxed max-w-md">
          Gunakan kamera untuk memindai barcode dari email undangan, atau unggah file gambar barcode (.png/.jpg) untuk mengekstrak token sesi secara otomatis.
        </p>
      </div>

      <div class="lg:col-span-7">
        <div class="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm">
          <!-- Tabs -->
          <div class="flex gap-2 mb-6 p-1 bg-subtle border border-border rounded-full w-full max-w-xs">
            <button 
              @click="switchMode('scan')"
              :class="mode === 'scan' ? 'bg-fg text-bg shadow-sm' : 'text-muted'"
              class="flex-1 py-2 text-sm font-medium rounded-full transition-all"
            >
              Pindai Kamera
            </button>
            <button 
              @click="switchMode('upload')"
              :class="mode === 'upload' ? 'bg-fg text-bg shadow-sm' : 'text-muted'"
              class="flex-1 py-2 text-sm font-medium rounded-full transition-all"
            >
              Unggah File
            </button>
          </div>

          <!-- Mode 1: Camera Scan -->
          <div v-if="mode === 'scan'" class="space-y-4">
            <div class="relative aspect-video bg-fg rounded-xl overflow-hidden border border-border">
              <video ref="videoRef" class="w-full h-full object-cover" autoplay muted playsinline></video>
              
              <!-- Overlay Frame -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="w-48 h-48 border-2 border-accent rounded-xl shadow-[0_0_0_1000px_rgba(0,0,0,0.4)]"></div>
              </div>

              <!-- Status -->
              <div class="absolute top-3 left-3 bg-bg/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 z-10">
                <span class="w-1.5 h-1.5 rounded-full bg-accent2 live-dot"></span>
                <span>{{ isScanning ? 'Mencari barcode...' : 'Kamera mati' }}</span>
              </div>
            </div>

            <div class="flex gap-3">
              <button 
                @click="startCamera" 
                :disabled="isScanning"
                class="flex-1 py-3 text-sm font-medium bg-fg text-bg rounded-full hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isScanning ? 'Memindai...' : 'Aktifkan Kamera' }}
              </button>
              <button 
                @click="stopCamera" 
                class="py-3 px-5 text-sm font-medium border border-border rounded-full hover:border-fg transition-colors"
              >
                Hentikan
              </button>
            </div>
          </div>

          <!-- Mode 2: Upload File -->
          <div v-else>
            <label 
              for="barcode-upload" 
              class="dropzone flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-fg hover:bg-subtle transition-all group"
              :class="{ 'border-accent bg-accent/5': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <div class="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <span class="text-sm font-medium text-fg">Klik untuk unggah atau seret gambar ke sini</span>
              <span class="text-xs text-muted mt-1">Mendukung format PNG, JPG, JPEG</span>
              <input id="barcode-upload" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
            </label>
            
            <div v-if="isDecoding" class="mt-4 text-sm text-muted flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              Menganalisis gambar...
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg text-sm text-accent flex items-start gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong class="block mb-1">Gagal mengakses kamera</strong>
              <span>{{ errorMessage }}</span>
              <button @click="switchMode('upload')" class="block mt-2 text-xs underline hover:text-fg">
                Beralih ke mode Unggah File
              </button>
            </div>
          </div>

          <!-- Manual Input Fallback -->
          <div class="mt-6 pt-6 border-t border-border">
            <div class="text-xs text-muted mb-2">Atau masukkan token manual:</div>
            <div class="flex gap-2">
              <input 
                v-model="manualToken" 
                type="text" 
                placeholder="Masukkan 12 karakter token..."
                class="flex-1 px-4 py-2.5 bg-subtle border border-border rounded-lg text-sm focus:outline-none focus:border-fg font-mono"
              />
              <button 
                @click="submitManualToken" 
                class="px-5 py-2.5 text-sm font-medium bg-fg text-bg rounded-lg hover:bg-accent transition-colors"
              >
                Verifikasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { useAssessmentStore } from '@/stores/assessment'

const store = useAssessmentStore()
const mode = ref('scan')
const videoRef = ref(null)
const isScanning = ref(false)
const isDecoding = ref(false)
const isDragging = ref(false)
const errorMessage = ref('')
const manualToken = ref('')

const reader = new BrowserMultiFormatReader()
let controls = null

async function startCamera() {
  errorMessage.value = ''
  stopCamera() // Bersihkan instance sebelumnya jika ada
  isScanning.value = true

  try {
    // Gunakan constraints untuk eksplisit meminta izin dan kamera belakang
    const constraints = {
      video: { facingMode: 'environment' }
    }

    controls = await reader.decodeFromConstraints(constraints, videoRef.value, (result, err) => {
      if (result) {
        handleToken(result.getText())
        stopCamera()
      }
      // Abaikan error NotFoundException karena wajar terjadi setiap frame saat barcode belum ketemu
      if (err && !(err instanceof NotFoundException)) {
        console.warn(err)
      }
    })
  } catch (err) {
    isScanning.value = false
    
    // Penanganan error spesifik untuk izin kamera
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        errorMessage.value = 'Izin kamera ditolak. Silakan berikan izin kamera pada pengaturan browser Anda (klik ikon kamera di address bar).'
      } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        errorMessage.value = 'Tidak ada kamera yang terdeteksi di perangkat ini. Silakan gunakan fitur Unggah File.'
      } else if (err.name === 'NotReadableError') {
        errorMessage.value = 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.'
      } else {
        errorMessage.value = `Terjadi kesalahan: ${err.message}`
      }
    } else {
      // Jika diakses via HTTP selain localhost
      errorMessage.value = 'Gagal memulai kamera. Pastikan website diakses via HTTPS atau localhost.'
    }
  }
}

function stopCamera() {
  if (controls) {
    controls.stop()
    controls = null
    isScanning.value = false
  }
}

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) await decodeImage(file)
}

async function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) await decodeImage(file)
}

async function decodeImage(file) {
  errorMessage.value = ''
  isDecoding.value = true
  
  const readerInstance = new BrowserMultiFormatReader()
  const img = new Image()
  img.src = URL.createObjectURL(file)
  
  img.onload = async () => {
    try {
      const result = await readerInstance.decodeFromImageElement(img)
      handleToken(result.getText())
    } catch (err) {
      errorMessage.value = 'Barcode tidak terdeteksi dalam gambar. Pastikan gambar jelas, tidak buram, dan tidak terpotong.'
    } finally {
      isDecoding.value = false
      URL.revokeObjectURL(img.src)
    }
  }
  
  img.onerror = () => {
    errorMessage.value = 'Gagal memuat file gambar. Pastikan format file benar (PNG/JPG).'
    isDecoding.value = false
  }
}

function handleToken(token) {
  if (token && token.length >= 8) {
    store.setSessionToken(token)
  } else {
    errorMessage.value = 'Format token tidak valid. Token harus minimal 8 karakter.'
  }
}

function submitManualToken() {
  if (manualToken.value.trim().length >= 8) {
    handleToken(manualToken.value.trim())
  } else {
    errorMessage.value = 'Token harus terdiri dari minimal 8 karakter.'
  }
}

function switchMode(m) {
  mode.value = m
  errorMessage.value = ''
  if (m === 'upload') stopCamera()
}

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.dropzone {
  transition: all 0.3s ease;
}
</style>