# TOPUP UB STORE — Product Requirements

## Original Problem
Buatkan webapp toko online untuk menjual koin game Bus Simulator Indonesia (BUSSID), Bus Simulator India, dan Truck Simulator Indonesia. Tampilan keren & profesional dengan Tailwind. Backend menggunakan Google Apps Script + Google Spreadsheets sebagai database.

## User Choices
- Store: **TOPUP UB STORE**, WA: **083825993903**
- Payments: DANA, SeaBank, ShopeePay, GoPay, QRIS
- Fitur core: katalog, keranjang, checkout, admin
- Fitur lanjutan (iter 2): riwayat, notif Telegram/email, voucher, kelola paket
- Backend: user setup Apps Script sendiri; agent siapkan Code.gs + instruksi
- Style: dark cyber-arcade

## Architecture
- Frontend React + Tailwind (SPA, routes `/`, `/admin`, `/riwayat`)
- State: localStorage (`ub_cart_v1`, `ub_orders_v1`, `ub_appscript_url`, `ub_promos_v1`, `ub_pkg_overrides_v1`, `ub_notif_v1`)
- Backend: Google Apps Script Web App (`/app/appscript/Code.gs`) + Google Sheet "Orders"
- Notifikasi: Telegram Bot API + Google MailApp (dijalankan dari dalam Apps Script setelah order sukses)

## Implemented
### Iterasi 1 (MVP)
- [x] Landing hero, katalog 18 paket koin
- [x] Filter game + search
- [x] Cart drawer + checkout modal + success modal (WhatsApp deep-link)
- [x] Admin: stats, endpoint config, tabel order, ubah status
- [x] Apps Script `Code.gs` + panduan setup

### Iterasi 2 (fitur lanjutan)
- [x] **Riwayat Pembeli** (`/riwayat`): cari order via WA / Player ID + tombol Pesan Ulang (deep-link WhatsApp)
- [x] **Voucher Diskon**: field kode promo di checkout, validasi (min transaksi, aktif/tidak, %/flat), auto-discount di summary, WA message menampilkan diskon
  - Seeded: `UBHEMAT10` (10% off, min Rp30k), `NEWBIE5K` (Rp5k flat, min Rp20k)
  - Admin bisa CRUD voucher via tab **Voucher**
- [x] **Kelola Paket** (tab Admin): edit harga, bonus, harga coret, badge per paket. Perubahan langsung reflek di katalog.
- [x] **Notif Telegram/Email**: tab Notifikasi di Admin — input Bot Token, Chat ID, Admin Email → generate Code.gs baru dengan nilai ter-embed → user paste ulang ke Apps Script.
- [x] Safe clipboard copy (fallback textarea+execCommand)

## Testing
- Iter 1: 100% pass (15/15 skenario)
- Iter 2: 100% pass fungsional (14/14 skenario baru + regresi)

## Files
- `/app/frontend/src/App.js` — routing (+/riwayat)
- `/app/frontend/src/pages/Home.jsx` — landing, katalog, cart, checkout (+promo), success
- `/app/frontend/src/pages/Admin.jsx` — 5 tabs: Pesanan, Kelola Paket, Voucher, Notifikasi, Backend
- `/app/frontend/src/pages/Riwayat.jsx` — pencarian order
- `/app/frontend/src/data/products.js` — data + getMergedPackages()
- `/app/frontend/src/lib/store.js` — cart/orders/promos/overrides/notif + AppScript helpers + safeCopy
- `/app/appscript/Code.gs` — backend Apps Script (dengan notif Telegram + email)
- `/app/appscript/README.md` — panduan setup

## Backlog / Next Actions
- P2: Halaman detail per game (livery gallery, promo bundle)
- P2: Login sederhana untuk pembeli agar riwayat auto-load
- P2: Dashboard grafik penjualan harian di admin (Recharts)
- P2: Multi-bahasa (ID/EN) untuk Bus Simulator India user
