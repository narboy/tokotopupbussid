# Deploy TOPUP UB STORE ke Vercel

Frontend TOPUP UB STORE adalah React SPA. Vercel butuh **rewrite semua path ke `index.html`** supaya route `/admin` & `/riwayat` tidak 404.

## ✅ Solusi Cepat (Sudah Disediakan)

File **`frontend/vercel.json`** sudah include konfigurasi lengkap:
```json
{
  "framework": "create-react-app",
  "buildCommand": "yarn build",
  "outputDirectory": "build",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Selama file ini ada di root project yang kamu upload/push, Vercel akan handle routing SPA otomatis.

---

## 🚀 Cara Deploy (2 Opsi)

### Opsi A — via GitHub (Recommended)

1. Push project ke GitHub (folder `frontend/` sebagai root repo, atau seluruh `/app`).
2. Buka **https://vercel.com/new** → login → **Import Git Repository**.
3. Pilih repo → klik **Import**.
4. Di halaman config:
   - **Framework Preset**: Create React App (biasanya auto-detect)
   - **Root Directory**: `frontend` ← **PENTING kalau repo kamu berisi `/app` full!**  
     Klik **Edit** → ketik `frontend` → OK.
   - **Build Command**: `yarn build` (auto)
   - **Output Directory**: `build` (auto)
5. Klik **Deploy**.
6. Tunggu ~2 menit. Setelah selesai, buka URL yang di-generate Vercel — semua route (`/`, `/admin`, `/riwayat`) harus jalan.

### Opsi B — via CLI (kalau upload manual)

```bash
# 1. Install CLI
npm i -g vercel

# 2. Build lokal dulu
cd frontend
yarn install
yarn build

# 3. Deploy folder build
vercel --prod ./build
```

Vercel CLI akan tanya beberapa hal:
- Project name: `topup-ub-store`
- Directory: `./build`
- Override settings: **N**

---

## 🔧 Kalau Masih 404

### Cek 1: Root Directory di Vercel
Buka project → **Settings → General → Root Directory**.
- Kalau kamu push `/app` (seluruh workspace) → set ke `frontend`.
- Kalau kamu push hanya isi folder `frontend/` → biarkan kosong (default `.`).

### Cek 2: Build Output
Setelah deploy, buka **Deployments → [latest] → Build Logs**. Pastikan ada baris:
```
The build folder is ready to be deployed.
```
Kalau ada error, biasanya masalah dependency — jalankan `yarn install` lokal dulu.

### Cek 3: Rewrites Aktif
Buka **Settings → Rewrites**. Harus ada:
```
Source: /(.*)   →   Destination: /index.html
```
Kalau kosong, artinya `vercel.json` tidak terbaca — cek Root Directory di atas.

### Cek 4: Redeploy Setelah Tambah vercel.json
Kalau kamu sudah pernah deploy sebelum menambahkan `vercel.json`, klik **Deployments → [latest] → Redeploy** untuk trigger build baru dengan config baru.

---

## 🌐 Setup Custom Domain di Vercel

1. Project → **Settings → Domains** → **Add**.
2. Ketik `topupubstore.com` (atau domain kamu) → klik **Add**.
3. Vercel kasih instruksi DNS. Ada 2 pilihan:
   - **A Record**: `76.76.21.21`
   - **Nameserver**: pindah nameserver ke Vercel (rekomendasi kalau kamu beli domain baru)
4. Tambahkan record di DNS provider domain (Namecheap, Domainesia, dsb).
5. Tunggu propagasi 5-30 menit.

---

## 📝 Checklist Post-Deploy

- [ ] Buka URL Vercel → home page load
- [ ] Klik menu **Admin** → tidak 404
- [ ] Klik menu **Riwayat** → tidak 404
- [ ] Buka `/admin` langsung di URL bar → tidak 404
- [ ] Paste URL Google Apps Script di halaman `/admin` → **Tes Koneksi** ✅
- [ ] Test buat order → cek muncul di Google Sheets
