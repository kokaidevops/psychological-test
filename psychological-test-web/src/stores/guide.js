import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGuideStore = defineStore('guide', () => {
  const activeSection = ref('persiapan')
  const openFaq = ref(null) // Menyimpan ID FAQ yang terbuka

  const sections = ref([
    { id: 'persiapan', label: 'Persiapan', num: '01' },
    { id: 'pelaksanaan', label: 'Pelaksanaan', num: '02' },
    { id: 'tips', label: 'Tips Sukses', num: '03' },
    { id: 'keamanan', label: 'Keamanan Data', num: '04' },
    { id: 'faq', label: 'Pertanyaan Umum', num: '05' }
  ])

  const faqs = ref([
    { id: 1, q: 'Apakah saya bisa menjeda sesi asesmen?', a: 'Ya, sesi Anda otomatis tersimpan di server kami. Anda dapat keluar dari platform dan melanjutkan di kemudian hari selama masih dalam rentang waktu yang diberikan oleh recruiter.' },
    { id: 2, q: 'Apakah ada jawaban benar atau salah pada tes kepribadian?', a: 'Tidak ada jawaban benar atau salah pada tes kepribadian seperti HEXACO. Jawablah selengkap dan sejujur mungkin berdasarkan diri Anda yang sebenarnya, bukan seperti yang Anda kira recruiter inginkan.' },
    { id: 3, q: 'Bagaimana jika koneksi internet terputus saat mengerjakan?', a: 'Sistem kami secara otomatis menyimpan jawaban Anda setiap kali Anda memilih opsi. Jika koneksi terputus, Anda dapat me-refresh halaman dan melanjutkan dari soal terakhir yang Anda kerjakan.' },
    { id: 4, q: 'Apakah saya bisa mengubah jawaban yang sudah dipilih?', a: 'Tentu saja. Selama sesi belum berakhir/dikirim, Anda dapat mengubah jawaban Anda kapan saja, baik pada mode satu soal maupun mode semua soal.' }
  ])

  function setActiveSection(id) {
    activeSection.value = id
  }

  function toggleFaq(id) {
    openFaq.value = openFaq.value === id ? null : id
  }

  return { activeSection, openFaq, sections, faqs, setActiveSection, toggleFaq }
})