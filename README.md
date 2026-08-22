<<<<<<< HEAD
# KoinPlay Store — Toko Koin Game

Starter kit aplikasi toko digital untuk BUSSID, BUSSIN, dan TRUCKSID.

## Arsitektur

- Frontend: 1-page app berbasis HTML + Tailwind CDN + JavaScript.
- Backend: Google Apps Script Web App.
- Database: Google Spreadsheet.
- File bukti pembayaran: Google Drive.
- Notifikasi admin: Telegram Bot API.
- Deployment frontend yang direkomendasikan: Vercel + serverless proxy.

## Struktur

```text
toko-koin-game/
├─ frontend/
│  └─ index.html
├─ api/
│  └─ proxy.js
├─ apps-script/
│  ├─ 00_Config.gs
│  ├─ 01_Auth.gs
│  ├─ 02_Catalog.gs
│  ├─ 03_Transactions.gs
│  ├─ 04_Notifications.gs
│  ├─ 05_Admin.gs
│  ├─ 06_Telegram.gs
│  └─ appsscript.json
├─ database/
│  └─ toko-koin-template.xlsx
├─ vercel.json
└─ docs/
   └─ DEPLOY.md
```

## Catatan endpoint

Apps Script Web App pada praktiknya memakai satu URL `.../exec` dan routing melalui parameter/action. Paket ini menyediakan action yang ekuivalen dengan endpoint yang diminta:

- `register`
- `login`
- `products`
- `checkout`
- `transactions`
- `upload-payment`
- `admin/approve`
- `admin/reject`
- `promotions`
- `admin/promo`

Untuk frontend, Vercel proxy membuat URL yang lebih nyaman seperti `/api/products`, `/api/login`, dan seterusnya.

## Demo akun

- Admin: `admin@demo.com` / `Admin123!`
- User: `user@demo.com` / `User123!`

Segera ganti kredensial demo setelah instalasi.
=======
# tokotopupbussid
>>>>>>> b52bf74e594dd8f90061545e30e9cbfe11b6e044
