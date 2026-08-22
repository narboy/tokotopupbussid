# Panduan Deployment KoinPlay Store

## 1. Siapkan Spreadsheet

1. Buka Google Drive.
2. Upload `database/toko-koin-template.xlsx` lalu buka sebagai Google Sheets.
3. Catat Spreadsheet ID dari URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

## 2. Pasang Apps Script

1. Buka Apps Script.
2. Buat project baru.
3. Salin semua file `.gs` dari folder `apps-script/`.
4. Di **Project Settings → Script properties**, tambahkan:
   - `SPREADSHEET_ID` = ID Google Spreadsheet.
5. Jalankan fungsi `setupDatabase()` satu kali dan izinkan permission yang diminta.
6. Pastikan sheet berikut tersedia:
   - Users
   - Products
   - Transactions
   - Payments
   - Promotions
   - Settings
   - Admin Logs
   - Sessions
   - Notifications

## 3. Konfigurasi Telegram

Buat bot melalui BotFather. Simpan token bot hanya di Script Properties.

Setelah bot dibuat, kirim satu pesan ke bot tersebut agar bot bisa berinteraksi dengan chat tujuan. Ambil chat ID admin, lalu jalankan fungsi Apps Script:

`configureTelegram('BOT_TOKEN', 'CHAT_ID')`

Jangan pernah menaruh token Telegram di `index.html` atau GitHub.

## 4. Konfigurasi pembayaran

Menu Admin → Pengaturan Pembayaran dapat diisi dengan:

- URL gambar QRIS statis.
- Nama bank, nomor rekening, dan nama pemilik.
- Nomor DANA, OVO, GoPay, ShopeePay.
- Google Drive Folder ID untuk menyimpan bukti pembayaran.

Untuk bukti pembayaran, folder Drive sebaiknya hanya dapat diakses admin.

## 5. Deploy Apps Script

Deploy → New deployment → Web app.

Recommended:
- Execute as: Me
- Who has access: Anyone

Salin URL Web App `/exec`.

## 6. Deploy frontend ke Vercel

Upload project ini ke GitHub, lalu import repository ke Vercel.

Environment variable:

`APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec`

`api/proxy.js` akan meneruskan request frontend ke Apps Script sehingga frontend tidak perlu menyimpan token Telegram atau kredensial database.

## 7. Pengujian

1. Buka frontend.
2. Daftar akun baru.
3. Login.
4. Pilih produk.
5. Buat invoice.
6. Upload bukti pembayaran.
7. Login admin.
8. Approve atau reject.
9. Pastikan notifikasi user dan Telegram masuk.
10. Tandai pesanan selesai jika proses digital product sudah selesai.

## 8. GitHub Pages

Frontend statis dapat di-host di GitHub Pages, tetapi koneksi browser langsung ke Apps Script perlu mempertimbangkan CORS. Karena itu, untuk aplikasi ini Vercel dengan proxy API adalah pilihan yang lebih praktis. Alternatif lain adalah membuat frontend ikut di-host oleh Apps Script HTML Service.

## 9. Checklist keamanan

- Ganti password demo.
- Gunakan folder Drive khusus bukti pembayaran.
- Jangan commit Telegram Bot Token.
- Jangan menaruh Spreadsheet ID sensitif di frontend.
- Batasi ukuran upload bukti maksimal 5 MB.
- Jangan membagikan spreadsheet database sebagai publik.
- Backup spreadsheet secara berkala.
