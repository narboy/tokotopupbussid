TOPUP UB STORE - VERCEL READY
==============================

Paket ini dibuat dari frontend UB Store terbaru dan sudah menggunakan
clean URL untuk deployment di Vercel.

URL PRODUKSI
------------
/                       Beranda Topup UB Store
/transaksi              Cek transaksi
/buat-sim               BUAT SIM
/promo                   Promo
/faq                     FAQ
/bantuan                 Bantuan
/masuk                   Login member
/daftar                  Daftar member
/akun                    Profil member
/akun#riwayat            Riwayat transaksi
/beli-akun               Beli akun
/jasa-obb                Jasa Pasang OBB
/jasa-kodename           Jasa Kodename
/jasa-device-id          Jasa Ambil Device ID
/tools                   Tools Topup
/pembelian               Checkout pembelian koin
/pesanan                 Detail pesanan topup
/pesanan-akun            Detail beli akun
/pesanan-obb             Detail OBB
/pesanan-kodename        Detail Kodename
/pesanan-device-id       Detail Device ID
/admin                   Admin internal

KOMPATIBILITAS URL LAMA
-----------------------
/topup        -> /
/game-populer -> /buat-sim
/index        -> /

Vercel cleanUrls=true juga menghilangkan ekstensi .html pada halaman.

CARA DEPLOY
-----------
1. Ekstrak ZIP ini.
2. Pastikan folder/file gambar pada ASSET_CHECKLIST.txt sudah disalin
   dari project Topup UB Store Anda.
3. Upload folder ini ke GitHub lalu Import Project di Vercel,
   atau gunakan metode deploy static project Anda.
4. Framework Preset: Other / tidak perlu framework.
5. Build Command: kosong.
6. Output Directory: kosong.
7. Deploy.

Tidak perlu mengubah URL Apps Script /exec.
Tidak perlu mengubah SQL Supabase untuk clean URL.

CATATAN ADMIN
-------------
/admin diberi meta noindex dan robots.txt Disallow, tetapi ini bukan
mekanisme keamanan. Keamanan admin tetap mengandalkan ADMIN_TOKEN di backend.

FILE PENTING
------------
index.html      = homepage
buat-sim.html   = fitur BUAT SIM
vercel.json     = clean URL + redirect
404.html        = halaman 404
robots.txt      = crawler policy
