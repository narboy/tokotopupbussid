# TOPUP UB STORE — Setup Backend (Google Sheets + Apps Script)

Backend disimpan **sepenuhnya di Google Sheets kamu**. Tidak perlu server, tidak perlu domain, gratis dari Google.

## ⚠️ Cara Bikin Apps Script — Ada 2 Skenario

### 🅐 Cara Benar (Direkomendasikan) — Container-Bound
Buka Apps Script **dari dalam Google Sheet** yang sama:

1. Buat Google Sheet → rename Sheet1 jadi `Orders`.
2. Menu **Extensions → Apps Script**.
3. Paste `Code.gs`. **Biarkan** `SHEET_ID = ''` kosong.
4. Deploy.

Script otomatis tahu Sheet mana yang dipakai lewat `SpreadsheetApp.getActive()`.

### 🅑 Standalone Script (kalau Kamu Sudah Terlanjur)
Kalau script dibuka via **script.google.com langsung** (tanpa dari Sheet), maka `SpreadsheetApp.getActive()` akan return `null` dan muncul error:
```
TypeError: Cannot read properties of null (reading 'getSheetByName')
```

**Fix**: isi konstanta `SHEET_ID` di baris teratas `Code.gs`:
```js
const SHEET_ID = '1AbCdEfGhIjKlMnOpQrStUvWxYz-example-id';
```

**Cara ambil SHEET_ID**: buka Google Sheet kamu, lihat URL browser:
```
https://docs.google.com/spreadsheets/d/  1AbCdEfGh...XYZ  /edit
                                        └──────────────┘
                                            ← ini SHEET_ID
```

Copy string di antara `/d/` dan `/edit`, paste ke `SHEET_ID`.

---

## Langkah Setup (versi container-bound, ~5 menit)

### 1. Buat Spreadsheet
1. Buka https://sheets.google.com → New (blank).
2. Rename dokumen jadi mis. `TOPUP UB STORE - Database`.
3. Rename tab pertama menjadi persis: `Orders` (case-sensitive).

### 2. Paste kode Apps Script
1. Menu **Extensions → Apps Script**.
2. Hapus isi default, paste seluruh isi `Code.gs`.
3. Klik 💾 (Save). Kasih nama proyek mis. `TOPUP UB Backend`.

### 3. Deploy sebagai Web App
1. Klik tombol **Deploy** → **New deployment**.
2. Klik ikon roda gigi ⚙️ → pilih **Web app**.
3. Isi:
   - **Description**: `TOPUP UB Backend v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` ← penting!
4. Klik **Deploy**. Google akan minta authorize — klik **Authorize access**, pilih akun, klik **Advanced → Go to ... (unsafe)** → **Allow**.
5. **Copy URL Web app**. Bentuknya:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

### 4. Hubungkan ke aplikasi
1. Buka aplikasi TOPUP UB STORE → menu **Admin** → tab **Backend**.
2. Paste URL tadi ke kolom **URL Google Apps Script**.
3. Klik **Tes Koneksi**. Jika muncul "Terhubung. 0 order ditemukan" → sukses ✅.

### 5. Uji coba order
1. Balik ke halaman utama, pilih 1 paket, klik **Beli**.
2. Isi form checkout, submit.
3. Buka Google Sheets kamu → sheet `Orders`. Baris baru akan muncul otomatis.
4. Di halaman **Admin**, klik ikon refresh — order akan tampil dari Sheets.

---

## Update kode nanti
Kalau kamu edit `Code.gs`:
1. Save di editor Apps Script.
2. **Deploy → Manage deployments → pensil edit deployment lama → Version: New version → Deploy**.
3. URL tetap sama, tidak perlu paste ulang.

---

## Troubleshoot

### ❌ `TypeError: Cannot read properties of null (reading 'getSheetByName')`
Script kamu **standalone**. Isi `SHEET_ID` di baris atas `Code.gs` (lihat skenario 🅑 di atas). Atau, bikin ulang lewat Extensions → Apps Script dari dalam Sheet.

### ❌ `Failed to fetch` di halaman Admin
Deploy access-nya masih "Only myself". Ubah ke **Anyone**:
Deploy → Manage deployments → edit → Who has access: **Anyone** → Deploy.

### ❌ Baris tidak muncul di Sheet
Cek nama sheet harus persis `Orders` (case-sensitive).

### ❌ CORS error
Pastikan pakai URL `/exec`, bukan `/dev`.

### ❌ Notifikasi Telegram tidak masuk
- Cek `TELEGRAM_BOT_TOKEN` benar (format `123456:ABC-DEF...`).
- Cek `TELEGRAM_CHAT_ID` benar. Cara ambil: kirim pesan ke bot kamu, buka `https://api.telegram.org/bot<TOKEN>/getUpdates`, lihat `chat.id`.
- Pastikan bot sudah pernah dikirim pesan `/start` oleh chat tersebut.
