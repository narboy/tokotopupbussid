import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Clock,
  MessageCircle,
  Coins,
  Copy,
  RefreshCw,
} from "lucide-react";
import {
  getOrders,
  fetchOrdersFromAppsScript,
  getEndpoint,
  safeCopy,
} from "@/lib/store";
import { GAMES, PAYMENT_METHODS, STORE, formatIDR, formatNum } from "@/data/products";

const StatusBadge = ({ status }) => {
  const map = {
    Pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Failed: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return (
    <span
      data-testid={`riwayat-status-${status}`}
      className={`chip border ${map[status] || "bg-white/5 text-gray-300"}`}
    >
      {status || "—"}
    </span>
  );
};

export default function Riwayat() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("local");
  const [error, setError] = useState("");

  const doSearch = async () => {
    const query = q.trim().toLowerCase();
    setError("");
    if (!query) {
      setError("Masukkan Nomor WhatsApp atau ID Player untuk mencari.");
      setResults(null);
      return;
    }
    setLoading(true);
    // Try remote first if endpoint configured
    let remote = null;
    if (getEndpoint()) {
      const r = await fetchOrdersFromAppsScript();
      if (r.ok) remote = r.data?.orders || [];
    }
    const list = remote || getOrders();
    setSource(remote ? "sheets" : "local");
    const digits = query.replace(/\D/g, "");
    const matched = list.filter((o) => {
      const wa = String(o.whatsapp || "").replace(/\D/g, "");
      const pid = String(o.playerId || "").toLowerCase();
      return (
        (digits && wa && wa.endsWith(digits.slice(-9))) ||
        pid.includes(query) ||
        String(o.id || "").toLowerCase() === query
      );
    });
    setResults(matched);
    setLoading(false);
  };

  const reorderMessage = (o) => {
    const gameLabel = (id) => GAMES.find((g) => g.id === id)?.short || id;
    const items = (o.items || [])
      .map(
        (it) =>
          `• ${gameLabel(it.game)} — ${formatNum(it.coin)} koin × ${it.qty}`,
      )
      .join("\n");
    return `Halo admin TOPUP UB STORE, saya ingin *pesan ulang* seperti order ${o.id}:\n\n${items}\n\nID Player: ${o.playerId}\nNama: ${o.customerName}\nTerima kasih!`;
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#090d16]/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            data-testid="riwayat-back-btn"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Toko
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-4 h-4 text-cyan-400" /> Riwayat Order
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="chip bg-white/5 text-gray-400 mb-3">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Cek Pesanan
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white">
            Cari <span className="text-gradient-cyan">Riwayat Order</span> Kamu
          </h1>
          <p className="text-gray-400 mt-2 text-sm max-w-xl">
            Masukkan nomor WhatsApp atau ID Player yang kamu pakai saat
            checkout. Klik <b>Pesan Ulang</b> untuk order yang sama dalam sekali
            tap.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                data-testid="riwayat-query-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Nomor WhatsApp atau ID Player kamu"
                className="pl-10"
              />
            </div>
            <button
              data-testid="riwayat-search-btn"
              onClick={doSearch}
              disabled={loading}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />{" "}
              Cari
            </button>
          </div>
          {error && (
            <div
              data-testid="riwayat-error"
              className="text-xs mt-3 text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-2.5"
            >
              {error}
            </div>
          )}
          {results !== null && !error && (
            <div className="text-xs text-gray-500 mt-3">
              Sumber:{" "}
              <span className="text-cyan-300 font-mono-num">
                {source === "sheets" ? "Google Sheets" : "Perangkat ini"}
              </span>{" "}
              · Ditemukan{" "}
              <span data-testid="riwayat-count" className="text-white font-semibold">
                {results.length}
              </span>{" "}
              order
            </div>
          )}
        </div>

        <div className="space-y-4" data-testid="riwayat-results">
          {results !== null &&
            results.length === 0 &&
            !error && (
              <div className="glass-card rounded-2xl p-10 text-center text-gray-500">
                Tidak ada order yang cocok. Pastikan nomor WhatsApp / ID Player
                yang kamu masukkan sama dengan saat checkout.
              </div>
            )}

          {(results || []).map((o) => {
            const pm = PAYMENT_METHODS.find((p) => p.id === o.paymentMethod);
            return (
              <div
                key={o.id}
                data-testid={`riwayat-row-${o.id}`}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase">
                      Order
                    </div>
                    <div className="font-mono-num text-cyan-300 text-sm font-semibold">
                      {o.id}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {new Date(o.createdAt).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div className="text-sm">
                    <div className="text-[11px] text-gray-500 uppercase">
                      Player ID
                    </div>
                    <div className="text-white font-mono-num text-xs">
                      {o.playerId}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-[11px] text-gray-500 uppercase">
                      Bayar via
                    </div>
                    <div className="text-white text-xs">
                      {pm?.name || o.paymentMethod}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {(o.items || []).map((it, i) => {
                    const g = GAMES.find((gg) => gg.id === it.game);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs text-gray-300 border-t border-white/5 pt-2 first:border-t-0 first:pt-0"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{
                              background: `${g?.accent || "#00F0FF"}22`,
                              color: g?.accent || "#00F0FF",
                            }}
                          >
                            <Coins className="w-3 h-3" />
                          </div>
                          <span className="text-gray-500">{g?.short}</span>
                          <span className="font-mono-num text-white">
                            {formatNum(it.coin)}
                          </span>
                          <span>× {it.qty}</span>
                        </div>
                        <div className="font-mono-num text-gray-300">
                          {formatIDR(it.price * it.qty)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="text-xs text-gray-400">Total</div>
                  <div className="font-display font-black text-cyan-300 font-mono-num">
                    {formatIDR(o.total)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    data-testid={`riwayat-copy-${o.id}`}
                    onClick={async () => {
                      await safeCopy(o.id);
                    }}
                    className="btn-ghost py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Salin ID
                  </button>
                  <a
                    data-testid={`riwayat-reorder-${o.id}`}
                    href={STORE.waUrl(reorderMessage(o))}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Pesan Ulang
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
