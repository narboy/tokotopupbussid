/* =========================================
 * UB STORE - FRONTEND APPLICATION
 * Vercel + Google Apps Script REST API
 * ========================================= */

const state = {
  data: null,
  game: 'BUSSID',
  selectedProduct: null,
  currentInvoice: '',
  currentPage: 'home'
};

const gameMeta = {
  BUSSID: {
    title: 'BUSSID',
    subtitle: 'Bus Simulator Indonesia',
    icon: 'bus-front',
    desc: 'Top up koin untuk Bus Simulator Indonesia dengan proses cepat.'
  },
  TRUCKSID: {
    title: 'TRUCKSID',
    subtitle: 'Truck Simulator Indonesia',
    icon: 'truck',
    desc: 'Pilih nominal koin TRUCKSID sesuai kebutuhanmu.'
  },
  BUSSIN: {
    title: 'BUSSIN',
    subtitle: 'Bus Simulator India',
    icon: 'bus-front',
    desc: 'Top up koin BUSSIN dengan proses order yang simpel dan aman.'
  }
};

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  renderLoading();

  try {
    const response = await apiGet('getPublicData');

    state.data = response.data;
    renderShell();
    renderHome();
  } catch (error) {
    renderError(error.message || 'Gagal memuat data dari server.');
  }
}

/* =========================
 * API
 * ========================= */

async function apiGet(action, params = {}) {
  const url = new URL(GAS_API_URL);

  url.searchParams.set('action', action);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow'
  });

  const text = await response.text();
  const json = parseJsonResponse(text);

  if (!response.ok) {
    throw new Error(json?.error || `HTTP ${response.status}`);
  }

  if (!json.success) {
    throw new Error(json.error || 'Permintaan gagal.');
  }

  return json;
}

async function apiPost(payload) {
  const response = await fetch(GAS_API_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  const json = parseJsonResponse(text);

  if (!response.ok) {
    throw new Error(json?.error || `HTTP ${response.status}`);
  }

  if (!json.success) {
    throw new Error(json.error || 'Permintaan gagal.');
  }

  return json;
}

function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    throw new Error(
      'Respons API bukan JSON. Periksa URL Web App Apps Script dan pengaturan deployment.'
    );
  }
}

/* =========================
 * SHELL
 * ========================= */

function renderShell() {
  document.getElementById('app').innerHTML = `
    <header class="sticky top-0 z-40 border-b border-white/5 bg-slate-950/75 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-16 flex items-center justify-between gap-4">

          <button onclick="navigate('home')" class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-300 text-slate-950 flex items-center justify-center font-black">
              UB
            </div>
            <div class="text-left">
              <div class="font-extrabold leading-none">
                ${escapeHtml(state.data.store.store_name || APP_CONFIG.storeName)}
              </div>
              <div class="text-[11px] text-slate-500 mt-1">
                Top Up Game Store
              </div>
            </div>
          </button>

          <nav class="hidden lg:flex items-center gap-1 text-sm">
            ${navButton('home', 'Home')}
            ${navButton('status', 'Status Transaksi')}
            ${navButton('history', 'Riwayat')}
            ${navButton('faq', 'FAQ')}
            ${navButton('testimonials', 'Testimoni')}
          </nav>

          <button
            onclick="toggleMobileNav()"
            class="lg:hidden size-10 rounded-xl border border-white/10 flex items-center justify-center">
            <i data-lucide="menu" class="w-5"></i>
          </button>
        </div>
      </div>

      <div id="mobileNav" class="hidden lg:hidden border-t border-white/5 px-4 py-3">
        <div class="grid gap-1">
          ${mobileNavButton('home', 'Home')}
          ${mobileNavButton('status', 'Status Transaksi')}
          ${mobileNavButton('history', 'Riwayat')}
          ${mobileNavButton('faq', 'FAQ')}
          ${mobileNavButton('testimonials', 'Testimoni')}
        </div>
      </div>
    </header>

    <main id="mainView"></main>

    <footer class="border-t border-white/5 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid md:grid-cols-3 gap-8">

          <div>
            <div class="font-bold text-lg">
              ${escapeHtml(state.data.store.store_name || APP_CONFIG.storeName)}
            </div>
            <p class="mt-2 text-sm text-slate-400">
              ${escapeHtml(state.data.store.footer_text || '')}
            </p>
          </div>

          <div>
            <div class="text-sm font-semibold">Navigasi</div>
            <div class="mt-3 grid gap-2 text-sm text-slate-400">
              <button onclick="navigate('status')" class="text-left hover:text-white">
                Status Transaksi
              </button>
              <button onclick="navigate('history')" class="text-left hover:text-white">
                Riwayat Transaksi
              </button>
              <button onclick="navigate('faq')" class="text-left hover:text-white">
                FAQ
              </button>
            </div>
          </div>

          <div>
            <div class="text-sm font-semibold">Kontak</div>
            <div class="mt-3 space-y-2 text-sm text-slate-400">
              ${
                state.data.store.whatsapp
                  ? `
                    <a
                      target="_blank"
                      rel="noopener"
                      href="https://wa.me/${encodeURIComponent(state.data.store.whatsapp)}"
                      class="flex items-center gap-2 hover:text-white">
                      <i data-lucide="message-circle" class="w-4"></i>
                      ${escapeHtml(state.data.store.whatsapp_display || '')}
                    </a>
                  `
                  : ''
              }

              ${
                state.data.store.instagram
                  ? `
                    <div class="flex items-center gap-2">
                      <i data-lucide="instagram" class="w-4"></i>
                      ${escapeHtml(state.data.store.instagram)}
                    </div>
                  `
                  : ''
              }
            </div>
          </div>
        </div>

        <div class="mt-8 pt-5 border-t border-white/5 text-xs text-slate-600">
          © ${new Date().getFullYear()}
          ${escapeHtml(state.data.store.store_name || APP_CONFIG.storeName)}.
          All rights reserved.
        </div>
      </div>
    </footer>

    ${orderModalTemplate()}
    ${invoiceModalTemplate()}
    <div id="toastContainer"
      class="fixed right-4 top-4 z-[100] space-y-3 w-[min(92vw,380px)]"></div>
  `;

  refreshIcons();
}

function navButton(id, label) {
  return `
    <button
      data-nav="${id}"
      onclick="navigate('${id}')"
      class="px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
      ${label}
    </button>
  `;
}

function mobileNavButton(id, label) {
  return `
    <button
      onclick="navigate('${id}'); toggleMobileNav(false)"
      class="text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5">
      ${label}
    </button>
  `;
}

function orderModalTemplate() {
  return `
    <div id="orderModal"
      class="fixed inset-0 z-[80] hidden modal-backdrop items-center justify-center p-4">

      <div class="glass w-full max-w-2xl rounded-3xl shadow-glow overflow-hidden max-h-[92vh] overflow-y-auto">

        <div class="p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">
              Checkout
            </p>
            <h3 class="mt-1 text-2xl font-bold">Buat Pesanan</h3>
            <p class="mt-1 text-sm text-slate-400">
              Isi data game dengan benar agar proses top up lancar.
            </p>
          </div>

          <button onclick="closeOrderModal()"
            class="size-10 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center">
            <i data-lucide="x" class="w-5"></i>
          </button>
        </div>

        <form id="orderForm" class="p-6 space-y-5" onsubmit="submitOrder(event)">

          <input type="hidden" id="orderProductId">
          <input type="hidden" id="orderGame">

          <div id="selectedProductCard"
            class="rounded-2xl border border-indigo-400/20 bg-indigo-500/5 p-4">
          </div>

          <div class="grid md:grid-cols-2 gap-4">

            <label class="block">
              <span class="text-sm font-medium text-slate-300">
                ID Player *
              </span>
              <input
                id="playerId"
                required
                class="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-indigo-400"
                placeholder="Contoh: 12345678">
            </label>

            <label class="block">
              <span class="text-sm font-medium text-slate-300">
                Nickname
              </span>
              <input
                id="nickname"
                class="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-indigo-400"
                placeholder="Nama di dalam game">
            </label>

            <label class="block">
              <span class="text-sm font-medium text-slate-300">
                WhatsApp *
              </span>
              <input
                id="whatsapp"
                required
                class="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-indigo-400"
                placeholder="08xxxxxxxxxx">
            </label>

            <label class="block">
              <span class="text-sm font-medium text-slate-300">
                Metode Pembayaran *
              </span>
              <select
                id="paymentMethod"
                required
                class="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-indigo-400">
                <option value="">Pilih metode</option>
                <option>QRIS</option>
                <option>Transfer Bank</option>
                <option>Saldo / Manual</option>
              </select>
            </label>

          </div>

          <label class="block">
            <span class="text-sm font-medium text-slate-300">
              Catatan
            </span>
            <textarea
              id="note"
              rows="3"
              class="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-indigo-400"
              placeholder="Catatan tambahan (opsional)"></textarea>
          </label>

          <div class="rounded-2xl bg-slate-950/60 border border-white/10 p-4 flex items-center justify-between gap-4">
            <div>
              <div class="text-sm text-slate-400">Total pembayaran</div>
              <div id="orderTotal" class="text-2xl font-bold text-white"></div>
            </div>

            <button
              id="submitOrderBtn"
              type="submit"
              class="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-3 font-semibold transition">
              Buat Pesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function invoiceModalTemplate() {
  return `
    <div id="invoiceModal"
      class="fixed inset-0 z-[90] hidden modal-backdrop items-center justify-center p-4">

      <div class="glass w-full max-w-lg rounded-3xl p-6 shadow-glow">

        <div class="text-center">
          <div class="mx-auto size-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
            <i data-lucide="check-circle-2" class="w-7 text-emerald-300"></i>
          </div>

          <p class="mt-4 text-sm font-medium text-emerald-300">
            Pesanan berhasil dibuat
          </p>

          <h3 class="mt-1 text-2xl font-bold">
            Simpan nomor invoice
          </h3>
        </div>

        <div class="mt-6 rounded-2xl bg-slate-950/70 border border-white/10 p-5 text-center">
          <div class="text-xs text-slate-500 uppercase tracking-[.2em]">
            Invoice
          </div>

          <div id="invoiceNumber"
            class="mt-2 text-2xl font-extrabold tracking-wide">
          </div>

          <div id="invoiceSummary"
            class="mt-3 text-sm text-slate-400">
          </div>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <button
            onclick="copyInvoice()"
            class="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-3 font-semibold">
            Salin Invoice
          </button>

          <button
            onclick="goToStatusFromInvoice()"
            class="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-3 font-semibold">
            Cek Status
          </button>
        </div>

        <button
          onclick="closeInvoiceModal()"
          class="mt-3 w-full rounded-xl px-4 py-3 text-slate-400 hover:text-white">
          Tutup
        </button>

      </div>
    </div>
  `;
}

/* =========================
 * PAGE NAVIGATION
 * ========================= */

function navigate(page) {
  state.currentPage = page;

  switch (page) {
    case 'home':
      renderHome();
      break;
    case 'status':
      renderStatus();
      break;
    case 'history':
      renderHistory();
      break;
    case 'faq':
      renderFaq();
      break;
    case 'testimonials':
      renderTestimonials();
      break;
  }

  document.querySelectorAll('[data-nav]').forEach(button => {
    const active = button.dataset.nav === page;

    button.classList.toggle('bg-white/5', active);
    button.classList.toggle('text-white', active);
    button.classList.toggle('text-slate-400', !active);
  });

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/* =========================
 * HOME
 * ========================= */

function renderHome() {
  document.getElementById('mainView').innerHTML = `
    <section class="grid-bg">

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">

        <div class="grid lg:grid-cols-[1.15fr_.85fr] gap-10 items-center">

          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/5 px-3 py-1.5 text-xs text-indigo-200">
              <span class="size-2 rounded-full bg-emerald-400"></span>
              ${escapeHtml(
                state.data.store.tagline ||
                'Top Up Koin Game Cepat & Terpercaya'
              )}
            </div>

            <h1 class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              Top Up Koin Game
              <span class="block bg-gradient-to-r from-indigo-300 via-cyan-200 to-white bg-clip-text text-transparent">
                cepat & profesional.
              </span>
            </h1>

            <p class="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl">
              Pilih game, pilih nominal, isi ID player, lalu buat pesanan.
              Semua transaksi memiliki nomor invoice untuk pengecekan status.
            </p>

            <div class="mt-7 flex flex-wrap gap-3">
              <button
                onclick="document.getElementById('gameSection').scrollIntoView({behavior:'smooth'})"
                class="rounded-xl bg-white text-slate-950 px-5 py-3 font-semibold hover:bg-slate-200 transition">
                Pilih Game
              </button>

              <button
                onclick="navigate('status')"
                class="rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/5 transition">
                Cek Status
              </button>
            </div>

            <div class="mt-8 grid sm:grid-cols-3 gap-3 max-w-2xl">
              ${miniStat('zap', 'Proses Cepat', '1-10 menit')}
              ${miniStat('shield-check', 'Tracking', 'Nomor invoice')}
              ${miniStat('headphones', 'Bantuan', 'WhatsApp Admin')}
            </div>
          </div>

          <div class="glass rounded-3xl p-5 shadow-glow">
            <div class="rounded-2xl bg-slate-950/60 p-5 border border-white/5">

              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs uppercase tracking-[.2em] text-slate-500">
                    Featured
                  </div>
                  <div class="mt-1 text-xl font-bold">
                    Pilihan game
                  </div>
                </div>

                <div class="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <i data-lucide="gamepad-2" class="w-5"></i>
                </div>
              </div>

              <div class="mt-5 space-y-3">
                ${['BUSSID', 'TRUCKSID', 'BUSSIN']
                  .map(featuredGame)
                  .join('')}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>

    <section
      id="gameSection"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <div class="flex items-end justify-between gap-4">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">
            Produk
          </div>
          <h2 class="mt-2 text-3xl font-bold">
            Pilih game
          </h2>
        </div>

        <div class="text-sm text-slate-500">
          ${state.data.products.length} paket tersedia
        </div>
      </div>

      <div class="mt-6 flex gap-2 overflow-x-auto scrollbar-hide">
        ${gameTab('BUSSID')}
        ${gameTab('TRUCKSID')}
        ${gameTab('BUSSIN')}
      </div>

      <div id="productPanel" class="mt-5"></div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid md:grid-cols-3 gap-4">
        ${featureCard(
          'shield-check',
          'Aman & Terdata',
          'Setiap order tersimpan dengan invoice unik.'
        )}

        ${featureCard(
          'clock-3',
          'Proses Ringkas',
          'Form checkout dibuat sederhana agar cepat diselesaikan.'
        )}

        ${featureCard(
          'search-check',
          'Mudah Dilacak',
          'Cek status transaksi kapan saja melalui nomor invoice.'
        )}
      </div>
    </section>
  `;

  renderProductPanel();
  refreshIcons();
}

function featuredGame(game) {
  const meta = gameMeta[game];
  const count = state.data.products.filter(
    product => product.game === game
  ).length;

  return `
    <button
      onclick="selectGame('${game}'); document.getElementById('gameSection').scrollIntoView({behavior:'smooth'})"
      class="w-full flex items-center justify-between rounded-2xl border border-white/5 bg-white/[.02] p-4 hover:bg-white/[.05] transition group">

      <div class="flex items-center gap-3">

        <div class="size-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-105 transition">
          <i data-lucide="${meta.icon}" class="w-5"></i>
        </div>

        <div class="text-left">
          <div class="font-semibold">${meta.title}</div>
          <div class="text-xs text-slate-500">${meta.subtitle}</div>
        </div>

      </div>

      <div class="text-xs text-slate-500">
        ${count} paket
      </div>
    </button>
  `;
}

function gameTab(game) {
  const active = state.game === game;

  return `
    <button
      onclick="selectGame('${game}')"
      class="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold border transition ${
        active
          ? 'bg-white text-slate-950 border-white'
          : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
      }">
      ${game}
    </button>
  `;
}

function selectGame(game) {
  state.game = game;
  renderProductPanel();
}

function renderProductPanel() {
  const panel = document.getElementById('productPanel');

  if (!panel) return;

  const meta = gameMeta[state.game];

  const products = state.data.products.filter(
    product => product.game === state.game
  );

  panel.innerHTML = `
    <div class="glass rounded-3xl p-5 sm:p-6">

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div class="flex items-center gap-4">

          <div class="size-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <i data-lucide="${meta.icon}" class="w-7"></i>
          </div>

          <div>
            <div class="text-2xl font-bold">${meta.title}</div>
            <div class="text-sm text-slate-500">${meta.subtitle}</div>
          </div>

        </div>

        <p class="text-sm text-slate-400 max-w-md">
          ${meta.desc}
        </p>

      </div>

      <div class="mt-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        ${
          products.length
            ? products.map(productCard).join('')
            : `<div class="sm:col-span-2 xl:col-span-4 rounded-2xl border border-white/10 p-6 text-center text-slate-500">
                Belum ada paket aktif untuk game ini.
              </div>`
        }
      </div>
    </div>
  `;

  refreshIcons();
}

function productCard(product) {
  const badge = product.badge
    ? `
      <span class="text-[10px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-400/20">
        ${escapeHtml(product.badge)}
      </span>
    `
    : '';

  return `
    <div class="rounded-2xl border border-white/10 bg-slate-950/40 p-4 hover:border-indigo-400/30 hover:-translate-y-0.5 transition">

      <div class="flex items-start justify-between gap-3">

        <div>
          <div class="text-lg font-bold">
            ${escapeHtml(product.name)}
          </div>

          <div class="text-sm text-slate-500">
            ${formatNumber(product.coins)} koin
          </div>
        </div>

        ${badge}
      </div>

      <div class="mt-5 text-2xl font-extrabold">
        ${formatRupiah(product.price)}
      </div>

      <button
        onclick="openOrderModal('${escapeJs(product.id)}')"
        class="mt-4 w-full rounded-xl bg-white text-slate-950 px-4 py-3 font-semibold hover:bg-slate-200 transition">
        Beli Sekarang
      </button>
    </div>
  `;
}

/* =========================
 * ORDER
 * ========================= */

function openOrderModal(productId) {
  const product = state.data.products.find(
    item => item.id === productId
  );

  if (!product) {
    showToast('Produk tidak ditemukan.', 'error');
    return;
  }

  state.selectedProduct = product;

  document.getElementById('orderProductId').value = product.id;
  document.getElementById('orderGame').value = product.game;

  document.getElementById('selectedProductCard').innerHTML = `
    <div class="flex items-center justify-between gap-4">

      <div>
        <div class="text-xs text-indigo-300 uppercase tracking-[.16em]">
          ${escapeHtml(product.game)}
        </div>

        <div class="mt-1 text-xl font-bold">
          ${escapeHtml(product.name)}
        </div>
      </div>

      <div class="text-right">
        <div class="text-xs text-slate-500">
          Total
        </div>

        <div class="text-xl font-extrabold">
          ${formatRupiah(product.price)}
        </div>
      </div>

    </div>
  `;

  document.getElementById('orderTotal').textContent =
    formatRupiah(product.price);

  document.getElementById('orderModal').classList.remove('hidden');
  document.getElementById('orderModal').classList.add('flex');

  refreshIcons();
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.add('hidden');
  document.getElementById('orderModal').classList.remove('flex');
}

async function submitOrder(event) {
  event.preventDefault();

  if (!state.selectedProduct) {
    showToast('Produk belum dipilih.', 'error');
    return;
  }

  const button = document.getElementById('submitOrderBtn');

  button.disabled = true;
  button.textContent = 'Memproses...';

  const payload = {
    action: 'createTransaction',
    game: document.getElementById('orderGame').value,
    productId: document.getElementById('orderProductId').value,
    playerId: document.getElementById('playerId').value.trim(),
    nickname: document.getElementById('nickname').value.trim(),
    whatsapp: document.getElementById('whatsapp').value.trim(),
    paymentMethod: document.getElementById('paymentMethod').value,
    note: document.getElementById('note').value.trim()
  };

  try {
    const response = await apiPost(payload);

    closeOrderModal();

    state.currentInvoice = response.data.invoice;

    document.getElementById('invoiceNumber').textContent =
      response.data.invoice;

    document.getElementById('invoiceSummary').textContent =
      `${response.data.productName} · ${formatRupiah(response.data.price)} · Status ${response.data.status}`;

    document.getElementById('invoiceModal').classList.remove('hidden');
    document.getElementById('invoiceModal').classList.add('flex');

    document.getElementById('orderForm').reset();

    showToast('Pesanan berhasil dibuat.', 'success');
  } catch (error) {
    showToast(
      error.message || 'Pesanan gagal dibuat.',
      'error'
    );
  } finally {
    button.disabled = false;
    button.textContent = 'Buat Pesanan';
  }
}

function closeInvoiceModal() {
  document.getElementById('invoiceModal').classList.add('hidden');
  document.getElementById('invoiceModal').classList.remove('flex');
}

async function copyInvoice() {
  try {
    await navigator.clipboard.writeText(state.currentInvoice);
    showToast('Invoice berhasil disalin.', 'success');
  } catch (_) {
    showToast(state.currentInvoice, 'info');
  }
}

function goToStatusFromInvoice() {
  const invoice = state.currentInvoice;

  closeInvoiceModal();
  navigate('status');

  setTimeout(() => {
    const input = document.getElementById('statusInvoice');

    if (input) {
      input.value = invoice;
      checkStatus();
    }
  }, 100);
}

/* =========================
 * STATUS
 * ========================= */

function renderStatus(prefill = '') {
  document.getElementById('mainView').innerHTML = `
    <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

      <div class="max-w-2xl">
        <div class="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">
          Tracking
        </div>

        <h1 class="mt-2 text-4xl font-black">
          Status Transaksi
        </h1>

        <p class="mt-3 text-slate-400">
          Masukkan nomor invoice untuk melihat status pesanan terbaru.
        </p>
      </div>

      <div class="mt-8 glass rounded-3xl p-5">
        <div class="flex flex-col md:flex-row gap-3">

          <input
            id="statusInvoice"
            value="${escapeHtml(prefill)}"
            class="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-indigo-400"
            placeholder="Contoh: UB-20260824223000-123">

          <button
            onclick="checkStatus()"
            class="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-3 font-semibold">
            Cek Status
          </button>

        </div>

        <div class="mt-3 text-xs text-slate-500">
          Pastikan huruf dan angka invoice sesuai.
        </div>
      </div>

      <div id="statusResult" class="mt-6"></div>
    </section>
  `;

  if (prefill) {
    setTimeout(checkStatus, 50);
  }
}

async function checkStatus() {
  const input = document.getElementById('statusInvoice');

  if (!input) return;

  const invoice = input.value.trim();

  if (!invoice) {
    showToast('Masukkan nomor invoice.', 'error');
    return;
  }

  document.getElementById('statusResult').innerHTML =
    loadingCard('Mengecek transaksi...');

  try {
    const response = await apiGet('getTransaction', {
      invoice
    });

    const result = response.data;

    if (!result.found) {
      document.getElementById('statusResult').innerHTML =
        emptyCard(
          'Invoice tidak ditemukan',
          'Periksa kembali nomor invoice yang dimasukkan.'
        );

      refreshIcons();
      return;
    }

    document.getElementById('statusResult').innerHTML =
      transactionDetail(result.transaction);

    refreshIcons();
  } catch (error) {
    document.getElementById('statusResult').innerHTML =
      emptyCard(
        'Terjadi kesalahan',
        error.message || 'Silakan coba lagi.'
      );

    refreshIcons();
  }
}

function transactionDetail(transaction) {
  return `
    <div class="glass rounded-3xl p-5 sm:p-6">

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-white/5">

        <div>
          <div class="text-xs text-slate-500 uppercase tracking-[.2em]">
            Invoice
          </div>

          <div class="mt-1 text-2xl font-bold">
            ${escapeHtml(transaction.invoice)}
          </div>

          <div class="mt-1 text-sm text-slate-500">
            ${escapeHtml(transaction.createdAt)}
          </div>
        </div>

        ${statusBadge(transaction.status, true)}
      </div>

      <div class="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
        ${detail('Game', transaction.game)}
        ${detail('Produk', transaction.productName)}
        ${detail('ID Player', transaction.playerId)}
        ${detail('Nickname', transaction.nickname || '-')}
        ${detail('WhatsApp', transaction.whatsapp)}
        ${detail('Pembayaran', transaction.paymentMethod)}
        ${detail('Total', formatRupiah(transaction.price))}
        ${detail('Catatan Admin', transaction.adminNote || 'Belum ada catatan')}
      </div>

      <div class="mt-6 grid grid-cols-4 gap-2">
        ${statusStep('PENDING', 'Pesanan')}
        ${statusStep('PROCESSING', 'Diproses')}
        ${statusStep('SUCCESS', 'Selesai')}
        ${statusStep('FAILED', 'Gagal')}
      </div>
    </div>
  `;
}

/* =========================
 * HISTORY
 * ========================= */

function renderHistory() {
  document.getElementById('mainView').innerHTML = `
    <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

      <div class="max-w-2xl">
        <div class="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">
          Riwayat
        </div>

        <h1 class="mt-2 text-4xl font-black">
          Riwayat Transaksi
        </h1>

        <p class="mt-3 text-slate-400">
          Masukkan nomor WhatsApp yang digunakan saat order.
        </p>
      </div>

      <div class="mt-8 glass rounded-3xl p-5">
        <div class="flex flex-col md:flex-row gap-3">

          <input
            id="historyWhatsApp"
            class="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-indigo-400"
            placeholder="08xxxxxxxxxx">

          <button
            onclick="loadHistory()"
            class="rounded-xl bg-white text-slate-950 px-5 py-3 font-semibold hover:bg-slate-200">
            Lihat Riwayat
          </button>

        </div>
      </div>

      <div id="historyResult" class="mt-6"></div>
    </section>
  `;
}

async function loadHistory() {
  const input = document.getElementById('historyWhatsApp');

  if (!input) return;

  const whatsapp = input.value.trim();

  if (!whatsapp) {
    showToast('Masukkan nomor WhatsApp.', 'error');
    return;
  }

  document.getElementById('historyResult').innerHTML =
    loadingCard('Mengambil riwayat...');

  try {
    const response = await apiGet('getHistory', {
      whatsapp
    });

    const rows = response.data || [];

    if (!rows.length) {
      document.getElementById('historyResult').innerHTML =
        emptyCard(
          'Belum ada transaksi',
          'Belum ditemukan transaksi untuk nomor tersebut.'
        );

      refreshIcons();
      return;
    }

    document.getElementById('historyResult').innerHTML = `
      <div class="grid gap-3">
        ${
          rows.map(tx => `
            <button
              onclick="openHistoryTransaction('${escapeJs(tx.invoice)}')"
              class="glass rounded-2xl p-4 text-left hover:bg-white/[.04] transition">

              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>
                  <div class="font-semibold">
                    ${escapeHtml(tx.invoice)}
                  </div>

                  <div class="text-sm text-slate-500 mt-1">
                    ${escapeHtml(tx.game)} ·
                    ${escapeHtml(tx.productName)} ·
                    ${escapeHtml(tx.createdAt)}
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="font-bold">
                    ${formatRupiah(tx.price)}
                  </div>

                  ${statusBadge(tx.status)}
                </div>

              </div>
            </button>
          `).join('')
        }
      </div>
    `;

    refreshIcons();
  } catch (error) {
    document.getElementById('historyResult').innerHTML =
      emptyCard(
        'Terjadi kesalahan',
        error.message || 'Silakan coba lagi.'
      );

    refreshIcons();
  }
}

function openHistoryTransaction(invoice) {
  navigate('status');

  setTimeout(() => {
    const input = document.getElementById('statusInvoice');

    if (input) {
      input.value = invoice;
      checkStatus();
    }
  }, 80);
}

/* =========================
 * FAQ
 * ========================= */

function renderFaq() {
  document.getElementById('mainView').innerHTML = `
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

      <div>
        <div class="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">
          Bantuan
        </div>

        <h1 class="mt-2 text-4xl font-black">
          Frequently Asked Questions
        </h1>

        <p class="mt-3 text-slate-400">
          Jawaban singkat untuk pertanyaan yang paling sering ditanyakan.
        </p>
      </div>

      <div class="mt-8 space-y-3">
        ${
          state.data.faq.map((item, index) => `
            <div class="glass rounded-2xl overflow-hidden">

              <button
                onclick="toggleFaq(${index})"
                class="w-full p-5 text-left flex items-center justify-between gap-4">

                <span class="font-semibold">
                  ${escapeHtml(item.question)}
                </span>

                <i
                  id="faqIcon${index}"
                  data-lucide="chevron-down"
                  class="w-5 text-slate-500">
                </i>
              </button>

              <div
                id="faqAnswer${index}"
                class="hidden px-5 pb-5 text-sm leading-7 text-slate-400">
                ${escapeHtml(item.answer)}
              </div>

            </div>
          `).join('')
        }
      </div>
    </section>
  `;

  refreshIcons();
}

function toggleFaq(index) {
  const answer = document.getElementById('faqAnswer' + index);

  if (!answer) return;

  answer.classList.toggle('hidden');
}

/* =========================
 * TESTIMONIALS
 * ========================= */

function renderTestimonials() {
  document.getElementById('mainView').innerHTML = `
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

      <div>
        <div class="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">
          Pelanggan
        </div>

        <h1 class="mt-2 text-4xl font-black">
          Testimoni
        </h1>

        <p class="mt-3 text-slate-400">
          Pengalaman pelanggan yang sudah order di
          ${escapeHtml(
            state.data.store.store_name || APP_CONFIG.storeName
          )}.
        </p>
      </div>

      <div class="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        ${
          state.data.testimonials.length
            ? state.data.testimonials.map(testimonialCard).join('')
            : `<div class="md:col-span-2 xl:col-span-3 glass rounded-2xl p-8 text-center text-slate-500">
                Belum ada testimoni.
              </div>`
        }
      </div>
    </section>
  `;

  refreshIcons();
}

function testimonialCard(testimonial) {
  const rating = Math.max(
    1,
    Math.min(5, Number(testimonial.rating || 5))
  );

  return `
    <article class="glass rounded-2xl p-5">

      <div class="flex items-center justify-between gap-3">
        <div class="font-semibold">
          ${escapeHtml(testimonial.name)}
        </div>

        <span class="text-xs rounded-full border border-white/10 px-2 py-1 text-slate-400">
          ${escapeHtml(testimonial.game)}
        </span>
      </div>

      <div class="mt-3 text-amber-300 tracking-[.2em] text-sm">
        ${'★'.repeat(rating)}
      </div>

      <p class="mt-3 text-sm leading-7 text-slate-400">
        “${escapeHtml(testimonial.message)}”
      </p>

      <div class="mt-4 text-xs text-slate-600">
        ${escapeHtml(testimonial.date)}
      </div>

    </article>
  `;
}

/* =========================
 * UI HELPERS
 * ========================= */

function toggleMobileNav(force) {
  const element = document.getElementById('mobileNav');

  if (!element) return;

  if (typeof force === 'boolean') {
    element.classList.toggle('hidden', !force);
  } else {
    element.classList.toggle('hidden');
  }
}

function statusBadge(status, large = false) {
  const classes = {
    PENDING: 'bg-amber-500/10 text-amber-300 border-amber-400/20',
    PROCESSING: 'bg-indigo-500/10 text-indigo-300 border-indigo-400/20',
    SUCCESS: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
    FAILED: 'bg-rose-500/10 text-rose-300 border-rose-400/20',
    CANCELLED: 'bg-slate-500/10 text-slate-300 border-slate-400/20'
  };

  return `
    <span class="${
      large ? 'px-3 py-2 text-sm' : 'px-2 py-1 text-xs'
    } rounded-full border ${
      classes[status] || classes.PENDING
    } font-semibold">
      ${escapeHtml(status)}
    </span>
  `;
}

function statusStep(status, label) {
  const icon =
    status === 'SUCCESS'
      ? 'check'
      : status === 'FAILED'
        ? 'x'
        : status === 'PROCESSING'
          ? 'loader-circle'
          : 'clock-3';

  const color =
    status === 'SUCCESS'
      ? 'bg-emerald-500/10 text-emerald-300'
      : status === 'FAILED'
        ? 'bg-rose-500/10 text-rose-300'
        : status === 'PROCESSING'
          ? 'bg-indigo-500/10 text-indigo-300'
          : 'bg-amber-500/10 text-amber-300';

  return `
    <div class="rounded-xl border border-white/5 bg-slate-950/30 p-3 text-center">
      <div class="mx-auto size-7 rounded-full ${color} flex items-center justify-center">
        <i data-lucide="${icon}" class="w-4"></i>
      </div>

      <div class="mt-2 text-[11px] text-slate-500">
        ${label}
      </div>
    </div>
  `;
}

function featureCard(icon, title, text) {
  return `
    <div class="glass rounded-2xl p-5">
      <div class="size-10 rounded-xl bg-white/5 flex items-center justify-center">
        <i data-lucide="${icon}" class="w-5"></i>
      </div>

      <div class="mt-4 font-semibold">
        ${title}
      </div>

      <div class="mt-1 text-sm leading-6 text-slate-500">
        ${text}
      </div>
    </div>
  `;
}

function miniStat(icon, title, value) {
  return `
    <div class="rounded-2xl border border-white/5 bg-white/[.02] p-3">
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <i data-lucide="${icon}" class="w-4"></i>
        ${title}
      </div>

      <div class="mt-2 text-sm font-semibold">
        ${value}
      </div>
    </div>
  `;
}

function detail(label, value) {
  return `
    <div class="rounded-xl bg-slate-950/40 border border-white/5 p-4">
      <div class="text-xs text-slate-500">
        ${escapeHtml(label)}
      </div>

      <div class="mt-1 font-medium text-slate-200">
        ${escapeHtml(String(value ?? ''))}
      </div>
    </div>
  `;
}

function loadingCard(text) {
  return `
    <div class="glass rounded-2xl p-8 text-center">
      <div class="mx-auto size-10 rounded-full border-2 border-white/10 border-t-indigo-300 animate-spin"></div>

      <div class="mt-4 text-slate-400">
        ${escapeHtml(text)}
      </div>
    </div>
  `;
}

function emptyCard(title, text) {
  return `
    <div class="glass rounded-2xl p-8 text-center">

      <div class="mx-auto size-12 rounded-2xl bg-white/5 flex items-center justify-center">
        <i data-lucide="search-x" class="w-6 text-slate-500"></i>
      </div>

      <div class="mt-4 text-lg font-semibold">
        ${escapeHtml(title)}
      </div>

      <div class="mt-1 text-sm text-slate-500">
        ${escapeHtml(text)}
      </div>
    </div>
  `;
}

function showToast(message, type = 'info') {
  const colors = {
    success: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
    error: 'border-rose-400/20 bg-rose-500/10 text-rose-100',
    info: 'border-indigo-400/20 bg-indigo-500/10 text-indigo-100'
  };

  const element = document.createElement('div');

  element.className =
    `rounded-2xl border px-4 py-3 shadow-2xl ${
      colors[type] || colors.info
    }`;

  element.innerHTML = `
    <div class="text-sm font-medium">
      ${escapeHtml(message)}
    </div>
  `;

  document.getElementById('toastContainer').appendChild(element);

  setTimeout(() => element.remove(), 3500);
}

function renderLoading() {
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-6">
      <div class="text-center">

        <div class="mx-auto size-14 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center animate-pulse">
          <div class="font-black text-indigo-300">
            UB
          </div>
        </div>

        <div class="mt-4 font-bold text-xl">
          Memuat UB STORE...
        </div>

        <div class="mt-1 text-sm text-slate-500">
          Menghubungkan ke REST API
        </div>
      </div>
    </div>
  `;
}

function renderError(message) {
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-6">

      <div class="glass rounded-3xl p-8 max-w-lg text-center">

        <div class="mx-auto size-12 rounded-2xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center text-rose-300 font-black">
          !
        </div>

        <h1 class="mt-4 text-2xl font-bold">
          API belum terhubung
        </h1>

        <p class="mt-2 text-slate-400">
          ${escapeHtml(message)}
        </p>

        <div class="mt-5 rounded-xl bg-slate-950/60 border border-white/5 p-4 text-left text-xs text-slate-500 break-all">
          Periksa <b>GAS_API_URL</b> pada config.js dan pastikan Web App Apps Script sudah di-deploy sebagai <b>Anyone</b>.
        </div>

      </div>
    </div>
  `;
}

function refreshIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

function formatRupiah(value) {
  return new Intl.NumberFormat(
    APP_CONFIG.currencyLocale,
    {
      style: 'currency',
      currency: APP_CONFIG.currencyCode,
      maximumFractionDigits: 0
    }
  ).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat(
    APP_CONFIG.currencyLocale
  ).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));
}

function escapeJs(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}
