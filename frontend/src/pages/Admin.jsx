import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  RefreshCw,
  Check,
  Clock,
  X,
  Trash2,
  ExternalLink,
  Copy,
  Search,
  ShieldCheck,
  Coins,
  Ticket,
  Package,
  Bell,
  Plus,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  getOrders,
  updateOrderLocal,
  removeOrderLocal,
  getEndpoint,
  setEndpoint,
  fetchOrdersFromAppsScript,
  updateOrderStatusAppsScript,
  getPromos,
  savePromos,
  getPackageOverrides,
  setPackageOverride,
  clearPackageOverride,
  getNotifSettings,
  setNotifSettings,
  safeCopy,
} from "@/lib/store";
import {
  GAMES,
  PACKAGES,
  PAYMENT_METHODS,
  formatIDR,
  formatNum,
  STORE,
} from "@/data/products";

const STATUSES = ["Pending", "Success", "Failed"];

const buildAppScriptCode = (notif = {}) => {
  const sheetId = notif.sheetId || "";
  const botToken = notif.telegramBotToken || "";
  const chatId = notif.telegramChatId || "";
  const email = notif.adminEmail || "";
  return `// TOPUP UB STORE — Google Apps Script backend
// Panduan setup lengkap ada di halaman Admin. Deploy → Web app → Anyone.

// Isi kalau script standalone. Kalau dibuka via Extensions → Apps Script
// dari dalam Sheet, boleh kosong.
const SHEET_ID = '${sheetId}';

const SHEET_NAME = 'Orders';
const HEADERS = ['id','createdAt','status','customerName','playerId','whatsapp','paymentMethod','items','subtotal','discount','promoCode','total','synced'];

// === NOTIFIKASI (opsional) ===
const TELEGRAM_BOT_TOKEN = '${botToken}';
const TELEGRAM_CHAT_ID   = '${chatId}';
const ADMIN_EMAIL        = '${email}';

function getSpreadsheet_() {
  if (SHEET_ID && String(SHEET_ID).trim()) return SpreadsheetApp.openById(String(SHEET_ID).trim());
  const active = SpreadsheetApp.getActive();
  if (!active) throw new Error('Isi SHEET_ID di atas dengan ID Google Sheet kamu.');
  return active;
}
function getSheet_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}
function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'listOrders';
  try {
    if (action === 'listOrders') return jsonOut_({ ok:true, orders: listOrders_() });
    if (action === 'ping')       return jsonOut_({ ok:true, msg:'pong' });
    return jsonOut_({ ok:false, error:'unknown action' });
  } catch (err) { return jsonOut_({ ok:false, error:String(err && err.message || err) }); }
}
function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'createOrder') {
      const order = JSON.parse(p.payload || '{}');
      const res = createOrder_(order);
      try { notify_(order); } catch (err) {}
      return jsonOut_(res);
    }
    if (p.action === 'updateStatus') return jsonOut_(updateStatus_(p.id, p.status));
    if (p.action === 'deleteOrder')  return jsonOut_(deleteOrder_(p.id));
    return jsonOut_({ ok:false, error:'unknown action' });
  } catch (err) { return jsonOut_({ ok:false, error:String(err && err.message || err) }); }
}
function createOrder_(o) {
  getSheet_().appendRow([
    o.id, o.createdAt, o.status || 'Pending', o.customerName, o.playerId,
    o.whatsapp, o.paymentMethod, JSON.stringify(o.items || []),
    Number(o.subtotal || o.total || 0), Number(o.discount || 0),
    o.promoCode || '', Number(o.total || 0), true
  ]);
  return { ok:true, id:o.id };
}
function listOrders_() {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const [head, ...rows] = values;
  return rows.filter(function(r){return r[0];}).map(function(r){
    const o = {}; head.forEach(function(k,i){ o[k]=r[i]; });
    try { o.items = JSON.parse(o.items || '[]'); } catch(e) { o.items = []; }
    if (o.createdAt instanceof Date) o.createdAt = o.createdAt.toISOString();
    return o;
  }).reverse();
}
function updateStatus_(id, status) {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  for (let i=1; i<values.length; i++) if (String(values[i][0])===String(id)) {
    sh.getRange(i+1, 3).setValue(status); return { ok:true };
  }
  return { ok:false, error:'not found' };
}
function deleteOrder_(id) {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  for (let i=1; i<values.length; i++) if (String(values[i][0])===String(id)) {
    sh.deleteRow(i+1); return { ok:true };
  }
  return { ok:false, error:'not found' };
}

// === NOTIFIKASI ADMIN ===
function notify_(o) {
  const lines = (o.items || []).map(function(it){
    return '• ' + it.game.toUpperCase() + ' — ' + Number(it.coin).toLocaleString('id-ID') + ' × ' + it.qty;
  }).join('\\n');
  const msg =
    '🔔 ORDER BARU - TOPUP UB STORE\\n' +
    '━━━━━━━━━━━━━━━━\\n' +
    'ID: ' + o.id + '\\n' +
    'Nama: ' + o.customerName + '\\n' +
    'Player: ' + o.playerId + '\\n' +
    'WA: ' + o.whatsapp + '\\n\\n' +
    lines + '\\n\\n' +
    'Total: Rp' + Number(o.total || 0).toLocaleString('id-ID') + '\\n' +
    'Bayar: ' + o.paymentMethod;

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
    UrlFetchApp.fetch(url, {
      method: 'post',
      payload: { chat_id: TELEGRAM_CHAT_ID, text: msg },
      muteHttpExceptions: true
    });
  }
  if (ADMIN_EMAIL) {
    MailApp.sendEmail(ADMIN_EMAIL, '🔔 Order Baru ' + o.id, msg);
  }
}`;
};

export default function Admin() {
  const [tab, setTab] = useState("orders");
  const [endpoint, setEP] = useState(getEndpoint());
  const [orders, setOrders] = useState(getOrders());
  const [remoteOrders, setRemoteOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [pingResult, setPingResult] = useState(null);

  useEffect(() => {
    const h = () => setOrders(getOrders());
    window.addEventListener("orders:changed", h);
    return () => window.removeEventListener("orders:changed", h);
  }, []);

  const saveEndpoint = (val) => {
    setEP(val);
    setEndpoint(val);
  };

  const testConnection = async () => {
    setLoading(true);
    setPingResult(null);
    const r = await fetchOrdersFromAppsScript();
    setLoading(false);
    if (r.ok) {
      setRemoteOrders(r.data?.orders || []);
      setPingResult({
        ok: true,
        msg: `Terhubung. ${(r.data?.orders || []).length} order ditemukan.`,
      });
    } else {
      setPingResult({
        ok: false,
        msg: `Gagal: ${r.reason}. Pastikan URL benar & deploy sebagai "Anyone".`,
      });
    }
  };

  const refreshRemote = async () => {
    setLoading(true);
    const r = await fetchOrdersFromAppsScript();
    setLoading(false);
    if (r.ok) setRemoteOrders(r.data?.orders || []);
  };

  const changeStatus = async (id, status) => {
    updateOrderLocal(id, { status });
    if (endpoint) {
      await updateOrderStatusAppsScript(id, status);
      refreshRemote();
    }
  };

  const displayed = (remoteOrders || orders).filter((o) => {
    const st = statusFilter === "all" || o.status === statusFilter;
    const q = query.trim().toLowerCase();
    const qq =
      !q ||
      String(o.id || "").toLowerCase().includes(q) ||
      String(o.customerName || "").toLowerCase().includes(q) ||
      String(o.playerId || "").toLowerCase().includes(q) ||
      String(o.whatsapp || "").includes(q);
    return st && qq;
  });

  const stats = {
    total: (remoteOrders || orders).length,
    pending: (remoteOrders || orders).filter((o) => o.status === "Pending").length,
    success: (remoteOrders || orders).filter((o) => o.status === "Success").length,
    revenue: (remoteOrders || orders)
      .filter((o) => o.status === "Success")
      .reduce((s, o) => s + Number(o.total || 0), 0),
  };

  const TABS = [
    { id: "orders", label: "Pesanan", icon: Coins },
    { id: "packages", label: "Kelola Paket", icon: Package },
    { id: "promo", label: "Voucher", icon: Ticket },
    { id: "notif", label: "Notifikasi", icon: Bell },
    { id: "backend", label: "Backend", icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#090d16]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            data-testid="admin-back-btn"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Toko
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Admin Panel
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="chip bg-white/5 text-gray-400 mb-3">
            <Settings className="w-3.5 h-3.5" /> Dashboard
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white">
            Kelola <span className="text-gradient-cyan">TOPUP UB STORE</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Order", value: stats.total, color: "text-cyan-300", testid: "stat-total" },
            { label: "Pending", value: stats.pending, color: "text-amber-300", testid: "stat-pending" },
            { label: "Sukses", value: stats.success, color: "text-emerald-300", testid: "stat-success" },
            {
              label: "Revenue Sukses",
              value: formatIDR(stats.revenue),
              color: "text-cyan-300",
              testid: "stat-revenue",
              small: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              data-testid={s.testid}
              className="glass-card rounded-2xl p-5"
            >
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {s.label}
              </div>
              <div
                className={`mt-1 font-display font-black font-mono-num ${s.color} ${s.small ? "text-xl" : "text-3xl"}`}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                data-testid={`admin-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap inline-flex items-center gap-1.5 transition-all ${
                  active
                    ? "text-black bg-gradient-to-r from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-400/40"
                    : "text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "orders" && (
          <OrdersTab
            displayed={displayed}
            remoteOrders={remoteOrders}
            query={query}
            setQuery={setQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            loading={loading}
            endpoint={endpoint}
            refreshRemote={refreshRemote}
            changeStatus={changeStatus}
          />
        )}
        {tab === "packages" && <PackagesTab />}
        {tab === "promo" && <PromoTab />}
        {tab === "notif" && <NotifTab />}
        {tab === "backend" && (
          <BackendTab
            endpoint={endpoint}
            saveEndpoint={saveEndpoint}
            testConnection={testConnection}
            loading={loading}
            pingResult={pingResult}
          />
        )}
      </main>
    </div>
  );
}

/* -------------------- ORDERS TAB -------------------- */
function OrdersTab({
  displayed,
  remoteOrders,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  loading,
  endpoint,
  refreshRemote,
  changeStatus,
}) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Daftar Pesanan
          </div>
          <div className="font-display font-bold text-lg text-white">
            {remoteOrders ? "Dari Google Sheets" : "Data Lokal"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              data-testid="admin-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari ID / nama..."
              className="pl-9 py-2 text-sm w-full sm:w-56"
            />
          </div>
          <select
            data-testid="admin-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 text-sm"
          >
            <option value="all">Semua Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {endpoint && (
            <button
              data-testid="admin-refresh"
              onClick={refreshRemote}
              className="btn-ghost px-3 py-2 rounded-lg text-xs inline-flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto" data-testid="admin-orders-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-black/30">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Player ID</th>
              <th className="p-3">Item</th>
              <th className="p-3">Total</th>
              <th className="p-3">Bayar</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-10 text-gray-500">
                  Belum ada pesanan.
                </td>
              </tr>
            )}
            {displayed.map((o) => {
              const pm = PAYMENT_METHODS.find((p) => p.id === o.paymentMethod);
              return (
                <tr
                  key={o.id}
                  data-testid={`admin-order-row-${o.id}`}
                  className="border-t border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="p-3">
                    <div className="font-mono-num text-cyan-300 text-xs">
                      {o.id}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {new Date(o.createdAt).toLocaleString("id-ID")}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-white">{o.customerName}</div>
                    <a
                      href={STORE.waUrl(
                        `Halo ${o.customerName}, pesanan ${o.id} kami proses.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      {o.whatsapp}
                    </a>
                  </td>
                  <td className="p-3 text-gray-300 font-mono-num text-xs">
                    {o.playerId}
                  </td>
                  <td className="p-3">
                    {(o.items || []).map((it, idx) => {
                      const g = GAMES.find((gg) => gg.id === it.game);
                      return (
                        <div key={idx} className="text-xs text-gray-300">
                          <span className="text-gray-500">{g?.short}</span>{" "}
                          <span className="font-mono-num">
                            {formatNum(it.coin)}
                          </span>{" "}
                          × {it.qty}
                        </div>
                      );
                    })}
                  </td>
                  <td className="p-3 font-mono-num text-cyan-300 text-xs">
                    {formatIDR(o.total)}
                    {o.discount ? (
                      <div className="text-[10px] text-emerald-400">
                        -{formatIDR(o.discount)}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <div className="chip bg-white/5 text-gray-300">
                      {pm?.name || o.paymentMethod}
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button
                        data-testid={`mark-success-${o.id}`}
                        onClick={() => changeStatus(o.id, "Success")}
                        title="Tandai Sukses"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        data-testid={`mark-pending-${o.id}`}
                        onClick={() => changeStatus(o.id, "Pending")}
                        title="Tandai Pending"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-500/10"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        data-testid={`mark-failed-${o.id}`}
                        onClick={() => changeStatus(o.id, "Failed")}
                        title="Tandai Gagal"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {!remoteOrders && (
                        <button
                          data-testid={`delete-order-${o.id}`}
                          onClick={() => {
                            if (window.confirm("Hapus order ini?"))
                              removeOrderLocal(o.id);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------- PACKAGES TAB -------------------- */
function PackagesTab() {
  const [overrides, setOverrides] = useState(getPackageOverrides());
  const [saved, setSaved] = useState("");

  const merged = PACKAGES.map((p) => ({ ...p, ...(overrides[p.id] || {}) }));

  const update = (id, field, value) => {
    const next = {
      ...overrides,
      [id]: {
        ...(overrides[id] || {}),
        [field]: field === "badge" || field === "tag" ? value : Number(value) || 0,
      },
    };
    setOverrides(next);
  };

  const saveAll = () => {
    // Strip empty
    const cleaned = {};
    Object.entries(overrides).forEach(([id, patch]) => {
      const base = PACKAGES.find((p) => p.id === id);
      if (!base) return;
      const diff = {};
      Object.entries(patch || {}).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined && v !== base[k]) diff[k] = v;
      });
      if (Object.keys(diff).length) cleaned[id] = diff;
    });
    setOverrides(cleaned);
    localStorage.setItem("ub_pkg_overrides_v1", JSON.stringify(cleaned));
    window.dispatchEvent(new Event("packages:changed"));
    setSaved("Tersimpan!");
    setTimeout(() => setSaved(""), 1800);
  };

  const resetOne = (id) => {
    clearPackageOverride(id);
    setOverrides(getPackageOverrides());
  };

  const resetAll = () => {
    if (!window.confirm("Reset semua paket ke default?")) return;
    localStorage.removeItem("ub_pkg_overrides_v1");
    window.dispatchEvent(new Event("packages:changed"));
    setOverrides({});
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Kelola Paket
          </div>
          <div className="font-display font-bold text-lg text-white">
            Edit Harga, Bonus & Badge
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Ubah nilai di bawah lalu simpan. Perubahan langsung tampil di
            katalog toko.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            data-testid="packages-reset-all"
            onClick={resetAll}
            className="btn-ghost px-4 py-2 rounded-lg text-xs inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Semua
          </button>
          <button
            data-testid="packages-save-all"
            onClick={saveAll}
            className="btn-primary px-4 py-2 rounded-lg text-xs inline-flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Simpan
          </button>
        </div>
      </div>

      {saved && (
        <div
          data-testid="packages-save-msg"
          className="text-xs mb-3 text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5"
        >
          {saved}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-black/30">
              <th className="p-3">Paket</th>
              <th className="p-3">Koin</th>
              <th className="p-3">Bonus</th>
              <th className="p-3">Harga (Rp)</th>
              <th className="p-3">Ori (coret)</th>
              <th className="p-3">Badge</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {merged.map((p) => {
              const g = GAMES.find((gg) => gg.id === p.game);
              const isOverridden = !!overrides[p.id];
              return (
                <tr
                  key={p.id}
                  data-testid={`pkg-row-${p.id}`}
                  className="border-t border-white/5"
                >
                  <td className="p-3">
                    <div className="text-[11px] text-gray-500 uppercase">
                      {g?.short}
                    </div>
                    <div className="text-white font-mono-num text-xs">
                      {formatNum(p.coin)} koin
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono-num">
                      {p.id}
                    </div>
                  </td>
                  <td className="p-3 text-gray-400 font-mono-num text-xs">
                    {formatNum(p.coin)}
                  </td>
                  <td className="p-3">
                    <input
                      data-testid={`pkg-bonus-${p.id}`}
                      type="number"
                      value={overrides[p.id]?.bonus ?? p.bonus}
                      onChange={(e) => update(p.id, "bonus", e.target.value)}
                      className="py-1.5 text-xs w-24"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      data-testid={`pkg-price-${p.id}`}
                      type="number"
                      value={overrides[p.id]?.price ?? p.price}
                      onChange={(e) => update(p.id, "price", e.target.value)}
                      className="py-1.5 text-xs w-28"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      data-testid={`pkg-original-${p.id}`}
                      type="number"
                      value={overrides[p.id]?.original ?? p.original ?? ""}
                      onChange={(e) => update(p.id, "original", e.target.value)}
                      className="py-1.5 text-xs w-24"
                      placeholder="—"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      data-testid={`pkg-badge-${p.id}`}
                      type="text"
                      value={overrides[p.id]?.badge ?? p.badge ?? ""}
                      onChange={(e) => update(p.id, "badge", e.target.value)}
                      className="py-1.5 text-xs w-32"
                      placeholder="—"
                    />
                  </td>
                  <td className="p-3">
                    {isOverridden ? (
                      <button
                        data-testid={`pkg-reset-${p.id}`}
                        onClick={() => resetOne(p.id)}
                        className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-600">default</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------- PROMO TAB -------------------- */
function PromoTab() {
  const [promos, setPromosState] = useState(getPromos());
  const [saved, setSaved] = useState("");

  const update = (idx, field, value) => {
    const next = [...promos];
    if (field === "value" || field === "minTotal")
      next[idx][field] = Number(value) || 0;
    else if (field === "active") next[idx][field] = value;
    else next[idx][field] = value;
    setPromosState(next);
  };

  const add = () => {
    setPromosState([
      ...promos,
      {
        code: "PROMO" + Math.floor(Math.random() * 900 + 100),
        type: "percent",
        value: 10,
        minTotal: 0,
        active: true,
        label: "Diskon baru",
      },
    ]);
  };

  const remove = (idx) => {
    setPromosState(promos.filter((_, i) => i !== idx));
  };

  const saveAll = () => {
    savePromos(promos);
    setSaved("Voucher tersimpan!");
    setTimeout(() => setSaved(""), 1800);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Voucher Diskon
          </div>
          <div className="font-display font-bold text-lg text-white">
            Kelola Kode Promo
          </div>
        </div>
        <div className="flex gap-2">
          <button
            data-testid="promo-add"
            onClick={add}
            className="btn-ghost px-4 py-2 rounded-lg text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
          <button
            data-testid="promo-save"
            onClick={saveAll}
            className="btn-primary px-4 py-2 rounded-lg text-xs inline-flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Simpan
          </button>
        </div>
      </div>

      {saved && (
        <div
          data-testid="promo-save-msg"
          className="text-xs mb-3 text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5"
        >
          {saved}
        </div>
      )}

      <div className="space-y-3">
        {promos.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">
            Belum ada voucher. Klik <b>Tambah</b> untuk membuat kode baru.
          </div>
        )}
        {promos.map((p, i) => (
          <div
            key={i}
            data-testid={`promo-row-${i}`}
            className="glass-card rounded-xl p-4 grid sm:grid-cols-6 gap-3 items-center"
          >
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Kode</label>
              <input
                data-testid={`promo-code-${i}`}
                value={p.code}
                onChange={(e) =>
                  update(i, "code", e.target.value.toUpperCase())
                }
                className="uppercase font-mono-num text-sm py-2"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Tipe</label>
              <select
                data-testid={`promo-type-${i}`}
                value={p.type}
                onChange={(e) => update(i, "type", e.target.value)}
                className="text-sm py-2"
              >
                <option value="percent">% Persen</option>
                <option value="flat">Rp Flat</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase">
                Nilai
              </label>
              <input
                data-testid={`promo-value-${i}`}
                type="number"
                value={p.value}
                onChange={(e) => update(i, "value", e.target.value)}
                className="text-sm py-2 font-mono-num"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase">
                Min. Total
              </label>
              <input
                data-testid={`promo-min-${i}`}
                type="number"
                value={p.minTotal || 0}
                onChange={(e) => update(i, "minTotal", e.target.value)}
                className="text-sm py-2 font-mono-num"
              />
            </div>
            <div className="sm:col-span-2 flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 uppercase">
                  Label
                </label>
                <input
                  data-testid={`promo-label-${i}`}
                  value={p.label || ""}
                  onChange={(e) => update(i, "label", e.target.value)}
                  className="text-sm py-2"
                />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-gray-300 whitespace-nowrap pb-2">
                <input
                  data-testid={`promo-active-${i}`}
                  type="checkbox"
                  checked={p.active}
                  onChange={(e) => update(i, "active", e.target.checked)}
                  className="w-auto"
                />
                Aktif
              </label>
              <button
                data-testid={`promo-delete-${i}`}
                onClick={() => remove(i)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 mb-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- NOTIFIKASI TAB -------------------- */
function NotifTab() {
  const [notif, setNotif] = useState(getNotifSettings());
  const [saved, setSaved] = useState("");
  const [copied, setCopied] = useState(false);

  const update = (field, value) => setNotif({ ...notif, [field]: value });

  const save = () => {
    setNotifSettings(notif);
    setSaved("Pengaturan tersimpan. Copy kode di bawah lalu paste ke Apps Script kamu.");
    setTimeout(() => setSaved(""), 2500);
  };

  const code = buildAppScriptCode(notif);
  const copyCode = async () => {
    await safeCopy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-5">
        <div className="text-xs text-gray-500 uppercase tracking-wider">
          Notifikasi Admin
        </div>
        <div className="font-display font-bold text-lg text-white mb-1">
          Ping Setiap Order Baru
        </div>
        <div className="text-xs text-gray-500 mb-5">
          Isi Telegram bot &amp; chat ID atau email admin, klik{" "}
          <b>Simpan &amp; Buat Kode</b>, lalu paste kode Apps Script baru ke
          Google Apps Script kamu (Extensions → Apps Script → replace all → Deploy → Manage
          deployments → New version). Tinggalkan kosong untuk mematikan channel.
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-400 mb-1.5 block">
              Google Sheet ID{" "}
              <span className="text-amber-300">
                (wajib jika Apps Script standalone)
              </span>
            </label>
            <input
              data-testid="notif-sheet-id"
              value={notif.sheetId || ""}
              onChange={(e) => update("sheetId", e.target.value)}
              placeholder="1AbCdEfGhIjKlMnOpQrStUvWxYz-example-id"
              className="font-mono-num text-xs"
            />
            <div className="text-[10px] text-gray-500 mt-1">
              Ambil dari URL Sheet:{" "}
              <span className="font-mono-num">
                docs.google.com/spreadsheets/d/<b className="text-cyan-300">SHEET_ID</b>/edit
              </span>
              . Kosongkan kalau script dibuka via Extensions → Apps Script
              dari dalam Sheet.
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">
              Telegram Bot Token
            </label>
            <input
              data-testid="notif-telegram-token"
              value={notif.telegramBotToken || ""}
              onChange={(e) => update("telegramBotToken", e.target.value)}
              placeholder="123456:ABC-DEF..."
              className="font-mono-num text-xs"
            />
            <div className="text-[10px] text-gray-500 mt-1">
              Buat bot lewat @BotFather di Telegram.
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">
              Telegram Chat ID
            </label>
            <input
              data-testid="notif-telegram-chat"
              value={notif.telegramChatId || ""}
              onChange={(e) => update("telegramChatId", e.target.value)}
              placeholder="123456789"
              className="font-mono-num text-xs"
            />
            <div className="text-[10px] text-gray-500 mt-1">
              Kirim pesan ke bot lalu buka{" "}
              <span className="font-mono-num">
                api.telegram.org/bot&lt;token&gt;/getUpdates
              </span>{" "}
              untuk cek chat.id.
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-400 mb-1.5 block">
              Email Admin (opsional)
            </label>
            <input
              data-testid="notif-admin-email"
              value={notif.adminEmail || ""}
              onChange={(e) => update("adminEmail", e.target.value)}
              placeholder="admin@toko.com"
              className="text-sm"
            />
            <div className="text-[10px] text-gray-500 mt-1">
              Menggunakan Gmail milik akun Google Apps Script (100 email/hari).
            </div>
          </div>
        </div>

        <button
          data-testid="notif-save"
          onClick={save}
          className="mt-5 btn-primary px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Simpan &amp; Buat Kode
        </button>
        {saved && (
          <div
            data-testid="notif-save-msg"
            className="text-xs mt-3 text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5"
          >
            {saved}
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              Kode Apps Script
            </div>
            <div className="font-display font-bold text-lg text-white">
              Code.gs (dengan notifikasi)
            </div>
          </div>
          <button
            data-testid="notif-copy-code"
            onClick={copyCode}
            className="btn-ghost px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5"
          >
            <Copy className="w-3 h-3" /> {copied ? "Tersalin!" : "Salin Kode"}
          </button>
        </div>
        <pre className="bg-black/60 border border-white/10 rounded-xl p-4 text-[11px] text-gray-300 overflow-x-auto max-h-80 font-mono-num leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
}

/* -------------------- BACKEND TAB -------------------- */
function BackendTab({ endpoint, saveEndpoint, testConnection, loading, pingResult }) {
  const [copied, setCopied] = useState(false);
  const code = buildAppScriptCode(getNotifSettings());
  const copy = async () => {
    await safeCopy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs text-cyan-300 uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5" /> Konfigurasi Backend
        </div>
        <div className="font-display font-bold text-lg text-white mb-3">
          URL Google Apps Script
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            data-testid="admin-endpoint-input"
            value={endpoint}
            onChange={(e) => saveEndpoint(e.target.value)}
            placeholder="https://script.google.com/macros/s/xxxx/exec"
          />
          <button
            data-testid="admin-test-connection"
            onClick={testConnection}
            disabled={!endpoint || loading}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-40 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />{" "}
            Tes Koneksi
          </button>
        </div>
        {pingResult && (
          <div
            data-testid="admin-ping-result"
            className={`mt-3 text-sm p-3 rounded-lg border ${
              pingResult.ok
                ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
                : "text-red-300 bg-red-500/10 border-red-500/30"
            }`}
          >
            {pingResult.msg}
          </div>
        )}
        <div className="mt-4 text-xs text-amber-300/90 bg-amber-500/5 border border-amber-500/30 rounded-lg p-3">
          <b>Dapat error "Cannot read properties of null (getSheetByName)"?</b>{" "}
          Script kamu kemungkinan standalone. Buka tab{" "}
          <b>Notifikasi</b> dan isi kolom <b>Google Sheet ID</b>, lalu re-deploy
          Code.gs.
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              Kode Apps Script
            </div>
            <div className="font-display font-bold text-lg text-white">
              Paste ke Extensions → Apps Script
            </div>
          </div>
          <button
            data-testid="copy-appscript-code"
            onClick={copy}
            className="btn-ghost px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5"
          >
            <Copy className="w-3 h-3" /> {copied ? "Tersalin!" : "Salin"}
          </button>
        </div>
        <pre className="bg-black/60 border border-white/10 rounded-xl p-4 text-[11px] text-gray-300 overflow-x-auto max-h-80 font-mono-num leading-relaxed">
          {code}
        </pre>
      </div>

      <div className="glass-card rounded-2xl p-5 text-xs text-gray-400 leading-relaxed">
        <div className="flex items-center gap-2 mb-2 text-cyan-300">
          <Coins className="w-4 h-4" /> Setup singkat backend
        </div>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Buat Google Sheets baru, rename sheet1 menjadi <b>Orders</b>.</li>
          <li>Menu <b>Extensions → Apps Script</b>, paste kode di atas, simpan.</li>
          <li>Klik <b>Deploy → New deployment</b>, pilih <b>Web app</b>.</li>
          <li>
            Execute as: <b>Me</b>, Who has access: <b>Anyone</b>, lalu{" "}
            <b>Deploy</b>.
          </li>
          <li>
            Salin URL <b>Web app</b>, paste di kolom di atas, lalu klik{" "}
            <b>Tes Koneksi</b>.
          </li>
        </ol>
        <a
          href="https://developers.google.com/apps-script/guides/web"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-cyan-400 hover:underline"
        >
          <ExternalLink className="w-3 h-3" /> Dokumentasi Apps Script
        </a>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Failed: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return (
    <span className={`chip border ${map[status] || "bg-white/5 text-gray-300"}`}>
      {status || "—"}
    </span>
  );
}
