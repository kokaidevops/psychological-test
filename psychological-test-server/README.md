# Backend Psychological Test (Node.js + Knex + Redis + PostgreSQL)

Backend service untuk platform tes psikologis. Sistem ini dirancang untuk menangani sinkronisasi data dari Odoo, manajemen sesi ujian dengan timer real-time, penyimpanan draft jawaban sementara di Redis, dan persistensi data ujian ke PostgreSQL.

## Daftar Isi
1. [Tech Stack](#tech-stack)
2. [Arsitektur & Keamanan](#arsitektur--keamanan)
3. [Persiapan Environment](#persiapan-environment)
4. [Langkah-Langkah Deploy](#langkah-langkah-deploy)
5. [Panduan Testing HMAC (Odoo -> Node.js)](#panduan-testing-hmac-odoo---nodejs)
6. [Dokumentasi API & Contoh Penggunaan](#dokumentasi-api--contoh-penggunaan)
7. [Penanganan Edge Cases (Frontend)](#penanganan-edge-cases-frontend)

---

## Tech Stack
- **Runtime:** Node.js (Express.js)
- **Database ORM / Query Builder:** Knex.js
- **Database:** PostgreSQL
- **Cache & State Management:** Redis (ioredis)
- **Authentication:** JWT (HttpOnly Cookie)
- **Validation:** Zod
- **Security:** Helmet, CORS, Express-Rate-Limit, HMAC SHA-256

---

## Arsitektur & Keamanan

Sistem ini menerapkan beberapa protokol keamanan ketat untuk mencegah kebocoran data dan serangan umum:

1. **Odoo to Node.js (HMAC SHA-256)**
   - Komunikasi antara Odoo dan Node.js diamankan menggunakan Signature HMAC.
   - Middleware `verifyHmac` memeriksa header `x-signature` dan `x-timestamp`.
   - Mencegah Replay Attack: Toleransi waktu maksimal 5 menit dari waktu server.
   - Raw body request diverifikasi menggunakan `crypto.timingSafeEqual`.

2. **Candidate Session (JWT HttpOnly Cookie)**
   - Kandidat tidak mengirimkan token melalui `Authorization` header, melainkan disimpan di Cookie `HttpOnly` dan `Secure` untuk mencegah pencurian via JavaScript (XSS).

3. **Anti-IDOR (Insecure Direct Object Reference)**
   - `session_id` dan `session_test_id` **TIDAK PERNAH** diambil dari request body frontend.
   - ID tersebut diekstrak murni dari payload JWT di backend menggunakan middleware `candidateAuth`.

4. **Server-Side Timer & Drafting (Redis)**
   - Timer ujian dikelola di server (Redis), bukan di sisi klien (browser).
   - Saat kandidat memilih jawaban, endpoint `save-draft` hanya menulis ke Redis (sangat cepat).
   - Saat waktu habis atau kandidat menyelesaikan tes, data di Redis di-fllush ke PostgreSQL.

---

## Persiapan Environment

Pastikan server Anda telah terinstall:
1. **Node.js** v18.x atau lebih baru.
2. **PostgreSQL** v14.x atau lebih baru.
3. **Redis** v6.x atau lebih baru.

### Konfigurasi `.env`
Buat file `.env` di root project dan isi sesuai dengan environment server Anda:

```env
# Server
NODE_ENV=production
PORT=3000

# PostgreSQL
PG_HOST=127.0.0.1
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_secure_password
PG_DATABASE=psych_test_db

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# HMAC (Odoo <-> Node.js) - Harus sama dengan di sisi Odoo
HMAC_SECRET=super-long-random-hmac-secret-key

# Candidate JWT
JWT_SECRET=super-long-random-jwt-secret-key
JWT_EXPIRES_IN=4h
COOKIE_DOMAIN=yourdomain.com

# CORS (URL Frontend Vue.js)
FRONTEND_ORIGIN=https://frontend.yourdomain.com

# Security Config
TIMESTAMP_TOLERANCE_SECONDS=300
SESSION_GRACE_PERIOD_SECONDS=10
STOP_SESSION_FLUSH_DELAY_MS=800
```

---

## Langkah-Langkah Deploy

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd psych-test-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Jalankan Database Migration**
   Pastikan database PostgreSQL sudah dibuat dan kredensial di `.env` sudah benar.
   ```bash
   npx knex migrate:latest --knexfile knexfile.js
   ```

4. **Build / Start Aplikasi**
   Untuk environment production, sangat disarankan menggunakan Process Manager seperti **PM2**.
   ```bash
   # Install PM2 secara global (jika belum)
   npm install -g pm2

   # Jalankan aplikasi
   pm2 start src/server.js --name psych-test-backend

   # Save process list & setup startup script
   pm2 save
   pm2 startup
   ```

5. **Setup Reverse Proxy (Nginx - Opsional tapi Direkomendasikan)**
   Konfigurasi Nginx untuk meneruskan traffic ke port Node.js (misal: 3000) dan mensupport WebSocket/Proxy pass. Pastikan juga SSL/HTTPS diaktifkan agar Cookie `Secure` berfungsi.

---

## Panduan Testing HMAC (Odoo -> Node.js)

Endpoint `/sync-test` dan `/sync-session` membutuhkan signature yang benar. Jika Anda melakukan testing via Postman, Anda harus generate signature dari raw body JSON.

Berikut contoh script Node.js singkat untuk men-generate Signature dan Timestamp untuk keperluan testing:

```js
const crypto = require('crypto');

const secret = 'super-long-random-hmac-secret-key'; // Sama dengan .env
const rawBody = JSON.stringify({
  psychological_test: { /* data */ }
});

const timestamp = Math.floor(Date.now() / 1000).toString();
const payload = `${timestamp}.${rawBody}`;

const signature = crypto
  .createHmac('sha256', secret)
  .update(payload, 'utf8')
  .digest('hex');

console.log('Timestamp:', timestamp);
console.log('Signature:', signature);
console.log('Raw Body (Paste as text in Postman):', rawBody);
```
*Catatan: Di Postman, set Body ke `raw` -> `JSON`, namun pastikan teks JSON yang dikirim persis sama dengan `rawBody` yang dipakai untuk hashing (misal: tidak ada perubahan spasi atau newline).*

---

## Dokumentasi API & Contoh Penggunaan

Base URL: `http://localhost:3000/api/v1`

### 1. Sync Test (Odoo -> Node.js)
**Endpoint:** `POST /sync-test`
**Headers:** `x-signature`, `x-timestamp`, `Content-Type: application/json`
**Body:**
```json
{
  "psychological_test": {
    "test_id": 101,
    "name": "Tes Kecerdasan Emosional",
    "slug": "tes-ke",
    "is_publish": true,
    "can_previous": false,
    "time": 30.5,
    "limit_day": 5
  },
  "question_tests": [
    {
      "question_id": 1001,
      "test_id": 101,
      "sequence": 1,
      "title": "Saya merasa tenang saat berada di tengah keramaian."
    }
  ],
  "question_answers": [
    {
      "answer_id": 5001,
      "question_id": 1001,
      "test_id": 101,
      "sequence": 1,
      "name": "Sangat Setuju"
    }
  ]
}
```

### 2. Sync Session (Odoo -> Node.js)
**Endpoint:** `POST /sync-session`
**Headers:** `x-signature`, `x-timestamp`, `Content-Type: application/json`
**Body:**
```json
{
  "psychological_session": {
    "session_id": 901,
    "name": "Batch Rekrutmen Q1 2024",
    "token": "QR-TOKEN-UNIQUE-12345",
    "applicant_name": "Budi Santoso",
    "date": "2024-03-15",
    "state": "pending"
  },
  "psychological_session_tests": [
    {
      "session_test_id": 8001,
      "session_id": 901,
      "test_id": 101,
      "date": "2024-03-15",
      "end_date": "2024-03-20",
      "time": 30.5,
      "state": "pending"
    }
  ]
}
```

### 3. Verify Token (Scan QR Code)
**Endpoint:** `POST /verify-token`
**Body:**
```json
{
  "token": "QR-TOKEN-UNIQUE-12345"
}
```
**Response:** Berhasil login, mengembalikan data sesi dan men-set Cookie `candidate_session_token` di browser.

### 4. Get Tests (Dashboard Kandidat)
**Endpoint:** `GET /get-tests`
**Headers:** `Cookie: candidate_session_token=...`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "session_test_id": 8001,
      "test_id": 101,
      "state": "pending",
      "test_name": "Tes Kecerdasan Emosional",
      "time": 30.5
    }
  ]
}
```

### 5. Start Session
**Endpoint:** `POST /start-session`
**Headers:** `Cookie: candidate_session_token=...`
**Body:**
```json
{
  "session_test_id": 8001
}
```
**Response:** Mengembalikan daftar soal, pilihan jawaban, waktu mulai, dan limit waktu. Server menerbitkan Cookie JWT baru yang mengandung `sessionTestId`.

### 6. Save Draft
**Endpoint:** `POST /save-draft`
**Headers:** `Cookie: candidate_session_token=...`
**Body:** (Hanya kirim question & answer, `session_id` dan `session_test_id` diambil dari JWT di backend)
```json
{
  "question_id": 1001,
  "answer_id": 5001
}
```

### 7. Resume Session
**Endpoint:** `POST /resume-session`
**Headers:** `Cookie: candidate_session_token=...`
**Body:**
```json
{
  "session_test_id": 8001
}
```
**Response:** Mengembalikan data soal, sisa waktu dari Redis, dan draft jawaban yang tersimpan tanpa meriset timer.

### 8. Stop Session
**Endpoint:** `POST /stop-session`
**Headers:** `Cookie: candidate_session_token=...`
**Body:** Kosong. (`session_test_id` diambil dari JWT)
**Response:** Mengembalikan `success: true`. Data jawaban dari Redis di-flush ke PostgreSQL, state berubah menjadi `done`, Cookie di-clear.

### 9. Get Result
**Endpoint:** `POST /get-result`
**Headers:** `x-signature`, `x-timestamp`, `Content-Type: application/json`
**Body:** 
```json
{
  "token": "QR-TOKEN-UNIQUE-12345"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": 901,
    "applicant_name": "Budi Santoso",
    "date": "2024-03-15",
    "session_state": "pending",
    "tests": [
      {
        "session_test_id": 8001,
        "test_id": 101,
        "test_name": "Tes Kecerdasan Emosional",
        "state": "done",
        "start_time": "2024-03-15T08:00:00.000Z",
        "limit_time": "2024-03-15T08:30:30.000Z",
        "end_time": "2024-03-15T08:28:15.000Z",
        "answers": [
          {
            "question_id": 1001,
            "question_title": "Saya merasa tenang saat berada di tengah keramaian.",
            "answer_id": 5001,
            "answer_name": "Sangat Setuju"
          }
        ]
      }
    ]
  }
}
```

### 10. Get Test
**Endpoint:** `POST /get-test`
**Headers:** `Cookie: candidate_session_token=...`
**Body:** 
```json
{
  "token": "QR-TOKEN-UNIQUE-12345",
  "test_id": 101
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "test_id": 101,
    "session_test_id": 8001,
    "state": "pending",
    "time": 30.5,
    "questions": [
      {
        "question_id": 1001,
        "test_id": 101,
        "sequence": 1,
        "title": "Saya merasa tenang saat berada di tengah keramaian.",
        "answers": [
          {
            "answer_id": 5001,
            "sequence": 1,
            "name": "Sangat Setuju"
          },
          {
            "answer_id": 5002,
            "sequence": 2,
            "name": "Setuju"
          },
          {
            "answer_id": 5003,
            "sequence": 3,
            "name": "Tidak Setuju"
          }
        ]
      }
    ]
  }
}
```

---

## Penanganan Edge Cases (Frontend)

### 1. Network Putus saat Menyimpan Jawaban
Karena internet kandidat tidak stabil, request ke `save-draft` mungkin gagal.
- **Solusi Frontend (Vue.js):** Gunakan *Axios Interceptor*. Jika request gagal (Network Error / 5xx), simpan jawaban ke `localStorage` dan tampilkan notifikasi non-blocking (contoh: toast kuning di sudut layar: *"Koneksi terputus, jawaban tersimpan secara lokal"*).
- Saat deteksi event `window.addEventListener('online')`, buat antrian (queue) untuk mengirim ulang draft yang tertahan di `localStorage` ke endpoint `save-draft`.

### 2. Stop Session Tertinggal
Saat waktu habis, `validateSessionTime` middleware akan menolak request `save-draft` selanjutnya (HTTP 403).
- Frontend harus menangkap error 403 ini, lalu otomatis memanggil endpoint `stop-session` untuk memaksa sistem mem-fllush jawaban terakhir yang ada di Redis ke database, dan mengunci UI tes.
```

### Penjelasan Tambahan yang Sering Kurang:
1. **Pemanfaatan `STOP_SESSION_FLUSH_DELAY_MS`:** Delay ini sangat krusial di backend. Misal kandidat mengklik jawaban terakhir tepat saat waktu habis, Vue.js butuh beberapa milidetik untuk mengirim request `save-draft`. Jika backend langsung melakukan `HGETALL` ke Redis saat menerima `stop-session`, request save draft tersebut belum sempat tersimpan. Delay 800ms memberi waktu aman bagi permintaan network yang lambat.
2. **Grace Period:** `SESSION_GRACE_PERIOD_SECONDS` memberi toleransi 10 detik di luar `limit_time`. Tanpa ini, kandidat yang men-submit di detik-detik terakhir akan ditolak oleh server karena latency network.
3. **Cookie Domain:** Saat deploy ke domain sebenarnya, jangan lupa mengubah `COOKIE_DOMAIN` di `.env`. Jika frontend di `app.domain.com` dan backend di `api.domain.com`, set `COOKIE_DOMAIN=.domain.com` agar cookie bisa di-share secara cross-subdomain.
