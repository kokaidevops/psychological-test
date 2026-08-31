1. Architecture:
	* Node.js + Knex.js
	* Redis (State Management, Timer & Real-time Draft Store)
	* PostgreSQL (Persistent Store)

2. Security Protocols:
   * Odoo to Node.js: Protected by HMAC SHA-256 Signature Middleware (Header: x-signature, x-timestamp).
   * Candidate Session: Authenticated via Short-lived JWT stored in HttpOnly, Secure Cookie.
   * Anti-IDOR: Candidate IDs and Session IDs extracted strictly from JWT Payload on Backend, never from Client Request Body.

3. Database Schema:
	1) Psychological Test
		* id: UUID
		* test_id: Integer (Menyimpan ID dari Odoo)
		* name: Char
		* slug: Char
		* is_publish: Boolean
		* can_previous: Boolean
		* time: Float
		* limit_day: Integer
	2) Question Test
		* id: UUID
		* question_id: Integer (Menyimpan ID dari Odoo)
		* test_id: Integer
		* sequence: Integer
		* title: Char
	3) Question Answer
		* id: UUID
		* answer_id: Integer (Menyimpan ID dari Odoo)
		* sequence: Integer
		* name: Char
	4) Psychological Session
		* id: UUID
		* session_id: Integer (Menyimpan ID dari Odoo)
		* name: Char
		* token: Char
		* applicant_name: Char
		* date: Date
		* state: Char
	5) Psychological Session Test
		* id: UUID
		* session_test_id: Integer (Menyimpan ID dari Odoo)
		* session_id: Integer
		* test_id: Integer
		* date: Date
		* end_date: Date
		* time: Float
		* start_time: Datetime
		* limit_time: Datetime
		* end_time: Datetime
		* state: Char
	6) Psychological Session Answer
		* id: UUID
		* session_id: Integer
		* session_test_id: Integer
		* test_id: Integer
		* question_id: Integer
		* answer_id: Integer
		* UNIQUE(session_test_id, question_id).

4. API Endpoint:
	1) api/v1/sync-test [POST]:
		Endpoint menerima request yang memuat data x-signature, x-timestamp, Psychological Test, Question Test dan Question Answer. Jika Psychological Test belum ada, maka endpoint ini akan insert data yang diterima kedalam database. Jika Psychological Test telah ada, maka endpoint ini akan mengupdate data yang telah ada dengan data yang diterima. Return hasil endpoint success/failed.
	2) api/v1/sync-session [POST]:
		Endpoint menerima request yang memuat data x-signature, x-timestamp, Psychological Session dan Psychological Session Test. Jika Psychological Session belum ada, maka endpoint ina akan insert data yang diterima kedalam database. Jika Psychological Session telah ada, maka endpoint ini akan update data yang telah ada dengan data yang diterima. Return hasil endpoint success/failed.
	3) api/v1/verify-token [POST]:
		Endpoint menerima request yang memuat token hasil dari scan atau upload QR Code. Jika token valid, kembalikan data session sesuai dengan token tersebut, dan menerbitkan JWT yang disimpan kedalam HTTP Only, Secure Cookie. Jika token invalid, kembalikan error.
	4) api/v1/start-session [POST] (Protected by Candidate JWT):
		Endpoint menerima request yang memuat ID Psychological Session Test yang dipilih kandidat dan akan dikerjakan, mengambil data Question Test dan Question Answer sesuai ID tes yang dipilih. 
		* mengupdate field Psychological Session Test: `state` menjadi `progress`, `start_time` dengan nilai datetime.now(), `limit_time` dengan nilai datetime.now() + nilai minute pada field `time`. Return hasil endpoint success beserta data Question Test dan Question Answer atau Failed dengan error message.
		* membuat data pada Redis yang memuat data ID Session Test, start_time, dan limit_time.
	5) api/v1/save-draft [POST] (Protected by Candidate JWT):
		Endpoint ini menerima request yang memuat data Psychological Session Answer, `session_id` dan `session_test_id` mengambil nilai otomatis dari JWT Cookie. Endpoint ini akan menyimpan/mengupdate data yang telah ada di Redis sesuai dengan data yang diterima. Return hasil endpoint success/failed.
	6) api/v1/stop-session [POST] (Protected by Candidate JWT):
		Endpoint menerima request yang memuat ID Psychological Session Test yang sedang dikerjakan kandidat (diambil dari JWT Cookie),
		* Validasi JWT Kandidat
		* Data pilihan jawaban user akan diupdate ke Redis, kemudian data jawaban user pada Redis akan diambil dan kemudian di insert kedalam database.
		* Hapus key draft dari Redis.
		* mengupdate field Psychological Sesssion Test: `state` menjadi `done`, `end_time` dengan nilai datetime.now(). 
		* Clear Cookie JWT Session Test.
		* Return hasil endpoint success/failed.
	7) api/v1/get-tests [GET] (Protected by Candidate JWT):
		* Fungsi: Menampilkan daftar modul psikotes yang harus dikerjakan oleh kandidat setelah kandidat berhasil me-verify token QR Code.
		* Return: Array dari Psychological Session Test beserta state-nya (pending, progress, done). Vue.js memerlukan ini untuk menampilkan dashboard daftar tes mana yang sudah selesai dan mana yang belum.
	8) api/v1/resume-session [POST/GET] (Protected by Candidate JWT):
		* Fungsi: Antisipasi jika browser kandidat ter-refresh, mati listrik, atau internet terputus di tengah pengerjaan.
		* Mekanisme: Mengambil data soal aktif, sisa waktu dari Redis, dan draft jawaban yang sudah tersimpan di Redis untuk dirender ulang di Vue.js tanpa meriset start_time.

5. Middleware:
	1) verifyHmac (Keamanan Communication Odoo $\rightarrow$ Node.js)
		* Dipasang pada: Endpoint /api/v1/sync-test dan /api/v1/sync-session.
		* Fungsi:
			* Mengambil header x-signature dan x-timestamp.
			* Memvalidasi timestamp (mencegah Replay Attack, misal maksimal selisih 5 menit dari waktu server).
			* Menghitung ulang HMAC SHA-256 dari req.rawBody menggunakan Secret Key bersama, lalu membandingkannya menggunakan crypto.timingSafeEqual.
		* Respon: Mengembalikan 401 Unauthorized atau 403 Forbidden jika signature tidak cocok.
	2) candidateAuth (Autentikasi & Otorisasi Kandidat / Anti-IDOR)
		* Dipasang pada: Semua endpoint kandidat (/get-tests, /start-session, /save-draft, /stop-session, /resume-session).
		* Fungsi:
			* Membaca cookie HTTP-Only candidate_session_token.
			* Memverifikasi JWT menggunakan process.env.JWT_SECRET.
			* Menempelkan data sesi hasil dekode langsung ke request object (req.userSession = { sessionId: decoded.sessionId, candidateNik: ... }).
		* Respon: Mengembalikan 401 Unauthorized jika cookie tidak ada atau JWT kadaluarsa.
	3) validateSessionTime (Validasi Durasi Timer Server-Side)
		* Dipasang pada: Endpoint pengerjaan seperti /save-draft.
		* Fungsi:
			* Membaca status dan expires_at sesi yang sedang aktif dari Redis Cache (session:{sessionId}:module:{testModuleId}:meta).
    * Memastikan waktu saat ini (NOW()) belum melewati expires_at + grace period (misal 10 detik).
		* Respon: Mengembalikan 403 Forbidden jika durasi pengerjaan sudah habis, sehingga penulisan jawaban langsung ditolak di tingkat middleware sebelum menyentuh logika bisnis.
	4) express.json({ verify: ... }) (Body Parser & Raw Body Buffer)
		* Fungsi: Memparse payload JSON dari request body.
		* Catatan Khusus: Wajib tambahkan fungsi verify untuk menyimpan buffer asli (req.rawBody) yang dibutuhkan oleh middleware verifyHmac.
	5) cookie-parser
		* Fungsi: Membaca dan memparse cookie yang dikirimkan oleh browser Vue.js agar bisa dibaca di middleware candidateAuth via req.cookies.
	6) cors (Cross-Origin Resource Sharing)
    * Fungsi: Membatasi domain mana saja yang boleh memanggil API Node.js.
    * Konfigurasi Wajib:
      * origin: Set eksplisit ke domain/URL frontend Vue.js. Jangan gunakan *.
      * credentials: true: Wajib diaktifkan agar browser diizinkan mengikutsertakan HTTP-Only Cookie saat melakukan HTTP Request (Axios/Fetch API).
	7) helmet (Keamanan HTTP Headers)
    * Fungsi: Menyembunyikan header sensitif (seperti X-Powered-By: Express) dan memasang proteksi HTTP header standar (XSS Protection, MIME-sniffing, HSTS, dll).
	8) express-rate-limit (Mencegah Brute-Force & DDoS)
    * Dipasang global & khusus pada /verify-token:
      * Batasi request ke /api/v1/verify-token (misal maksimal 10-20 percobaan per 15 menit per IP) untuk mencegah penyerang melakukan brute-force UUID / Token QR Code.
	9) errorHandler (Global Error Handling)
    * Dipasang di akhir file app.js (setelah semua route):
			* Memastikan jika terjadi uncaught error / crash pada Knex.js atau Redis, server tidak mengembalikan stack trace (informasi sensitif internal server) ke frontend, melainkan pesan error standar JSON 500 Internal Server Error.
6. Catatan:
	1) Gunakan Zona Waktu UTC untuk semua field yang berhubungan dengan waktu
	2) Endpoint `api/v1/stop-session`, berikan jeda kecil atau pastikan eksekusi pengambilan data Redis (HGETALL) dilakukan setelah seluruh penulisan draft terakhir selesai diproses, untuk memastikan jawaban nomor terakhir kandidat tidak ketinggalan saat di-flush ke PostgreSQL.
	3) Penanganan Re-connection & Network Timeout di Vue.js
    * Poin Perhatian: Di lapangan, internet kandidat bisa terputus sesaat saat mengklik jawaban.
    * Solusi di Vue.js:
      * Gunakan Axios Interceptor untuk mendeteksi error jaringan (misal error HTTP 504 atau Network Error).
      * Jika request save-draft gagal karena koneksi putus, tampilkan indikator kecil di sudut layar (misal: "Koneksi terputus, jawaban tersimpan secara lokal" dengan ikon kuning) agar kandidat tidak panik. Saat koneksi kembali online, sistem otomatis mengirim ulang (retry) draft tersebut.