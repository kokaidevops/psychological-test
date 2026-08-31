1. Project: Psychological Test (WPT)
2. Tech Stack:
    * Frontend: Vue.js 3 + Pinia + Vue Router + Tailwind.css
    * Backend: Node.js + Knex.js
    * Database: PostgreSQL
    * Odoo
3. Pembagian Beban Kerja
    * Sistem Psyhological Test: Sistem yang digunakan kandidat calon karyawan untuk mengerjakan soal
    * Odoo: Wadah untuk Master Data Psikotes, Bank Soal, Kandidat dan mengelola hasil jawaban kandidat
4. Mekanisme Sistem
Sistem Psychological Test ini digunakan dalam proses psikotes untuk seleksi kandidat calon karyawan. Sistem ini juga akan terintegrasi dengan Odoo versi 16, dimana Odoo menjadi wadah untuk master data psikotes, bank soal dan kandidat. Alur yang diharapkan dari kedua sistem ini sebagai berikut:
    1) HR membuat master data psikotes dan bank soal di Odoo.
    2) HR melakukan proses rekrutmen terhadap kandidat, data kandidat tercatat di Odoo.
    3) Di Odoo, HR membuat sesi psikotes yang akan dilakukan oleh kandidat, mulai dari tanggal dan batas pengerjaan sesi psikotes, daftar psikotes yang akan dikerjakan. Dari data sesi psikotes tadi, QR tergenerate otomatis oleh Odoo berdasarkan token sesi psikotes. QR Code ini yang kemudian akan diberikan ke kandidat sebagai key untuk mengerjakan sesi psikotes.
    4) HR mengubah status sesi psikotes menjadi assign, Odoo melakukan call API Website Psychological Test untuk mengirimkan data sesi psikotes dan data bank soal yang akan dikerjakan.
    5) Kandidat membuka website Psychological Test.
    6) Melalui fitur scan QR Code pada website Psychological Test, kandidat melakukan scan QR Code atau mengupload QR Code yang telah diterima.
    7) Website Psychological Test membaca token pada QR Code, melakukan call API Backend dengan method POST dan mengirimkan token yang termuat dalam QR Code.
    8) API Backend yang menerima request akan memvalidasi token yang diterima.
        8.1.1) Jika token tidak valid, API Backend akan mengembalikan response 400 Bad Request.
        8.1.2) Website menerima response 400 dan akan menampilkan notifikasi bahwa QR Code tidak valid.
        8.2.1) Jika token valid, API Backend akan mengembalikan response 200 OK dan data daftar psikotes yang akan dikerjakan oleh kandidat dari database website Psychological Test.
        8.2.2) Website menerima response 200, redirect pengguna ke halaman daftar psikotes dan menampilkan daftar psikotes yang diterima.
    9) Kandidat memilih psikotes yang akan dikerjakan.
    10) Website melakukan request POST ke API Backend dengan mengirimkan data psikotes yang dipilih oleh kandidat.
    11) API Backend menerima request akan memvalidasi data yang diterima, apakah data psikotes yang dipilih oleh kandidat dapat dikerjakan atau tidak.
        11.1.1) Jika token tidak valid, API Backend akan mengembalikan response 400 Bad Request.
        11.1.2) Website menerima response 400 dan akan menampilkan notifikasi bahwa data psikotes tidak valid.
        11.2.1) Jika token valid, API Backend akan mengembalikan response 200 OK dan data daftar bank soal sesuai dengan psikotes yang akan dipilih oleh kandidat dari database website Psychological Test.
        11.2.2) Website menerima response 200, redirect pengguna ke halaman asesmen dan menampilkan daftar bank soal yang diterima.
    12) Kandidat mengerjakan soal psikotes.
    13) Website Psychological Test mencatat waktu mulai dan waktu selesai kandidat dalam mengerjakan psikotes.
    14) Setiap kandidat memilih jawaban, mengubah jawaban, menghapus jawaban, Website Psychological Test langsung mencatat perubahan jawaban tersebut dalam database website Psychological Test.
    15) Kandidat klik tombol Simpan & Keluar untuk menyatakan telah selesai mengerjakan psikotes.
    16) Website Psychological Test melakukan request POST ke API Backend untuk memberitahu kandidat telah selesai mengerjakan psikotes dan mengubah status psikotes telah selesai sehingga psikotes tersebut tidak dapat dikerjakan lagi.
    17) Website redirect kandidat kembali ke halaman daftar psikotes.
    18) Kandidat memilih psikotes lain yang akan dikerjakan hingga seluruh psikotes telah selesai dikerjakan.
5. Catatan
	1) Odoo dan Website Psychological Test berbagi data yang sama untuk Psikotes dan Bank Soal (Fitur Synchronize).
	2) Odoo hanya melakukan push dan pull, WPT (Backend) tidak dapat melakukan request ke Odoo.
	3) Perlu adanya secret-key yang digunakan oleh Odoo dan WPT.
	4) penerapan HMAC Signature/mTLS pada Odoo dan WPT (Backend) ketika komunikasi menggunakan API.
	5) Penerapan x-timestamp saat komunikasi API, tolak jika selisih waktu request diterima melebihi batas waktu tertentu (misal 5 menit) meskipun signature cocok.
	5) WPT (Database) tidak menyimpan kunci jawaban maupun skor.
	6) Generate token untuk sesi psikotes menggunakan UUID v4, Odoo generate token lalu mengirimkannya ke WPT (Backend)
    7) Session ID saat kandidat mengerjakan disimpan dalam JWT/hTTP-Only Cookie dan bandingkan session di Token dan session di JWT setiap request
    8) Ketika pengerjaan, kirimkan soal yang sedang aktif saja atau paket soal psikotes yang sedang dikerjakan.
    9) Penerapan Redis/In-Memory Cache untuk Bank Soal
    10) Jawaban kandidat disimpan dalam LocalStorage agar tidak hilang ketika browser refresh/tertutup, otomatis terkirim (draft autosave) ke Redis sebelum di-flush ke database utama.