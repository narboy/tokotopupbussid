# UB STORE — Vercel + Google Apps Script REST API

Arsitektur:
- Frontend: Vercel
- UI: HTML + Tailwind CSS CDN + Lucide
- Backend: Google Apps Script Web App
- Database: Google Sheets

## Struktur

```text
ub-store/
├── index.html
├── app.js
├── config.js
├── vercel.json
└── Code.gs
```

## 1. Siapkan Google Sheets

Buat Google Spreadsheet baru.

Buka:
Extensions → Apps Script

Buat file `Code.gs`, kemudian paste isi `Code.gs` dari paket ini.

Pada Apps Script:
Project Settings → Script Properties → Add script property:

Name:
`SPREADSHEET_ID`

Value:
ID Google Spreadsheet Anda.

Contoh URL:
`https://docs.google.com/spreadsheets/d/ABC123XYZ/edit`

Maka `SPREADSHEET_ID` adalah:
`ABC123XYZ`

## 2. Jalankan setupDatabase()

Dari editor Apps Script:
- pilih fungsi `setupDatabase`
- Run
- izinkan akses

Sheet berikut akan dibuat otomatis:

- Settings
- Products
- Transactions
- FAQ
- Testimonials

## 3. Deploy Apps Script sebagai Web App

Deploy → New deployment

Type:
`Web app`

Execute as:
`Me`

Who has access:
`Anyone`

Setelah deploy, salin URL:
`https://script.google.com/macros/s/XXXXXXXX/exec`

## 4. Masukkan URL API ke config.js

Buka `config.js`:

```javascript
const GAS_API_URL = 'PASTE_URL_WEB_APP_APPS_SCRIPT_DI_SINI';
```

Ganti menjadi:

```javascript
const GAS_API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

Jangan menaruh URL tersebut di HTML secara manual; cukup di `config.js`.

## 5. Deploy ke Vercel

Upload folder ini ke GitHub atau deploy langsung menggunakan Vercel CLI.

### Opsi GitHub
1. Buat repository GitHub.
2. Upload:
   - index.html
   - app.js
   - config.js
   - vercel.json
3. Import repository ke Vercel.
4. Framework Preset: Other.
5. Deploy.

### Opsi Vercel CLI

```bash
npm i -g vercel
vercel
```

Lalu ikuti instruksi CLI.

## 6. Test API

Buka URL Apps Script di browser:

```text
https://script.google.com/macros/s/XXXXXXXX/exec?action=ping
```

Harus mendapatkan JSON seperti:

```json
{
  "success": true,
  "message": "UB STORE API aktif.",
  "time": "2026-08-24 22:00:00"
}
```

Untuk data publik:

```text
?action=getPublicData
```

Untuk status:

```text
?action=getTransaction&invoice=UB-XXXXX
```

Untuk riwayat:

```text
?action=getHistory&whatsapp=081234567890
```

## 7. Edit isi toko

### Settings
Atur:
- nama toko
- tagline
- WhatsApp
- Instagram
- footer

### Products
Atur:
- game
- nama paket
- jumlah koin
- harga
- aktif/nonaktif
- badge

### FAQ
Atur pertanyaan dan jawaban.

### Testimonials
Atur nama, game, testimoni, rating, tanggal.

## 8. Status transaksi admin

Untuk mengubah status dari Apps Script, contoh:

```javascript
updateTransactionStatus_({
  invoice: 'UB-20260824223000-123',
  status: 'SUCCESS',
  adminKey: 'GANTI_DENGAN_KUNCI_ADMIN',
  note: 'Top up berhasil diproses.'
});
```

Status yang tersedia:
- PENDING
- PROCESSING
- SUCCESS
- FAILED
- CANCELLED

## Catatan CORS

Frontend Vercel memanggil Google Apps Script Web App melalui HTTPS. Pastikan deployment Apps Script menggunakan akses `Anyone`.

Jika browser Anda menampilkan error CORS atau respons bukan JSON, cek:
1. URL `GAS_API_URL`
2. deployment Apps Script terbaru
3. akses Web App = Anyone
4. buka endpoint `?action=ping` secara langsung untuk memastikan API aktif

Data sensitif jangan ditaruh di frontend.
