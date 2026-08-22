import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Coins,
  ShoppingCart,
  Search,
  ShieldCheck,
  Zap,
  MessageCircle,
  Check,
  X,
  Plus,
  Minus,
  Settings,
  Trash2,
  Copy,
  QrCode,
  Wallet,
  Building2,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";
import {
  GAMES,
  PACKAGES,
  getMergedPackages,
  PAYMENT_METHODS,
  STORE,
  formatIDR,
  formatNum,
} from "@/data/products";
import {
  getCart,
  addToCart,
  updateQty,
  removeItem,
  clearCart,
  cartTotal,
  cartCount,
  saveOrder,
  postOrderToAppsScript,
  genOrderId,
  applyPromo,
  safeCopy,
} from "@/lib/store";

const PAYMENT_ICONS = {
  qris: QrCode,
  dana: Wallet,
  seabank: Building2,
  shopeepay: ShoppingBag,
  gopay: Smartphone,
};

export default function Home() {
  const [cart, setCartState] = useState(getCart());
  const [packages, setPackages] = useState(getMergedPackages());
  const [activeGame, setActiveGame] = useState("all");
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    const h = () => setCartState(getCart());
    const p = () => setPackages(getMergedPackages());
    window.addEventListener("cart:changed", h);
    window.addEventListener("packages:changed", p);
    return () => {
      window.removeEventListener("cart:changed", h);
      window.removeEventListener("packages:changed", p);
    };
  }, []);

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const gameOk = activeGame === "all" || p.game === activeGame;
      const q = query.trim().toLowerCase();
      const qOk =
        !q ||
        p.tag.toLowerCase().includes(q) ||
        String(p.coin).includes(q) ||
        p.game.toLowerCase().includes(q);
      return gameOk && qOk;
    });
  }, [activeGame, query, packages]);

  const count = cartCount(cart);
  const total = cartTotal(cart);

  return (
    <div className="min-h-screen relative">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#090d16]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a
            href="#top"
            data-testid="nav-brand-logo"
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-amber-400 flex items-center justify-center shadow-lg shadow-cyan-400/30">
              <Coins className="w-5 h-5 text-black" strokeWidth={2.5} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full pulse-dot" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-black text-[15px] tracking-tight text-white">
                TOPUP <span className="text-gradient-cyan">UB</span> STORE
              </div>
              <div className="text-[10px] text-gray-500 font-mono-num uppercase">
                Bus & Truck Simulator
              </div>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {GAMES.map((g) => (
              <button
                key={g.id}
                data-testid={`nav-game-${g.id}`}
                onClick={() => {
                  setActiveGame(g.id);
                  document
                    .getElementById("packages")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {g.short}
              </button>
            ))}
            <Link
              to="/riwayat"
              data-testid="nav-riwayat-link"
              className="ml-2 px-3 py-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" /> Riwayat
            </Link>
            <Link
              to="/admin"
              data-testid="nav-admin-link"
              className="ml-1 px-3 py-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" /> Admin
            </Link>
          </div>

          <button
            data-testid="nav-cart-trigger"
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 btn-ghost px-3.5 py-2 rounded-full text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Keranjang</span>
            {count > 0 && (
              <span
                data-testid="nav-cart-count"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-amber-400 text-black text-[11px] font-bold font-mono-num flex items-center justify-center"
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div className="grid-pattern absolute inset-0 opacity-40" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-24 lg:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 fade-up">
              <div className="inline-flex items-center gap-2 chip glass-card border-cyan-500/20 text-cyan-300 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Sistem Otomatis · Online 24/7
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] text-white">
                Top Up Koin
                <br />
                <span className="text-gradient-cyan">BUSSID · BS India · TSI</span>
                <br />
                Tanpa Ribet.
              </h1>
              <p className="mt-5 text-gray-400 max-w-xl text-base sm:text-lg">
                {STORE.tagline}. Proses <b className="text-cyan-300">1-3 menit</b>{" "}
                dengan konfirmasi WhatsApp langsung ke admin. Aman, terpercaya,
                harga transparan.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  data-testid="hero-cta-browse"
                  onClick={() =>
                    document
                      .getElementById("packages")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="btn-primary px-6 py-3 rounded-full inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Lihat Paket Koin
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  data-testid="hero-whatsapp-contact-btn"
                  href={STORE.waUrl(
                    "Halo admin TOPUP UB STORE, saya ingin bertanya tentang top up koin.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost px-6 py-3 rounded-full inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" /> Chat
                  WhatsApp Admin
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
                {[
                  { k: "12K+", v: "Order Sukses", c: "text-cyan-300" },
                  { k: "1-3", v: "Menit Proses", c: "text-amber-300" },
                  { k: "24/7", v: "Support Aktif", c: "text-emerald-300" },
                ].map((s) => (
                  <div key={s.v} className="glass-card rounded-2xl p-4">
                    <div
                      className={`font-display font-black text-2xl ${s.c} font-mono-num`}
                    >
                      {s.k}
                    </div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider mt-1">
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 relative fade-up">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-card noise-overlay">
                <img
                  src="https://images.unsplash.com/photo-1646883525658-59eacc0b077b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBnb2xkJTIwY29pbnMlMjB0b3B1cCUyMG5lb258ZW58MHx8fHwxNzg3MzI3MzQ1fDA&ixlib=rb-4.1.0&q=85"
                  alt="Coin stack"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/30 to-transparent" />
                <div className="absolute top-4 left-4 chip bg-black/60 text-cyan-300 border border-cyan-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Aman
                </div>
                <div className="absolute top-4 right-4 chip bg-black/60 text-amber-300 border border-amber-500/30">
                  <Zap className="w-3.5 h-3.5" /> Auto Delivery
                </div>
                <div className="absolute bottom-5 left-5 right-5 glass-card rounded-2xl p-4 border-cyan-500/20 float-slow">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-display font-bold text-lg">
                        1.000.000 + 200K
                      </div>
                      <div className="text-xs text-gray-400">
                        Paket Best Value BUSSID
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-300 font-mono-num font-bold">
                        Rp99K
                      </div>
                      <div className="text-[10px] text-gray-500 line-through font-mono-num">
                        Rp120K
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GAMES ROW */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="grid md:grid-cols-3 gap-4">
          {GAMES.map((g, i) => (
            <button
              key={g.id}
              data-testid={`game-card-${g.id}`}
              onClick={() => {
                setActiveGame(g.id);
                document
                  .getElementById("packages")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative group text-left overflow-hidden rounded-2xl h-40 glass-card hover-lift"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={g.banner}
                alt={g.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, rgba(9,13,22,0.9) 0%, rgba(9,13,22,0.4) 60%, transparent 100%)`,
                }}
              />
              <div className="relative p-5 h-full flex flex-col justify-between">
                <div>
                  <span
                    className="chip"
                    style={{
                      background: `${g.accent}22`,
                      color: g.accent,
                      border: `1px solid ${g.accent}55`,
                    }}
                  >
                    <Star className="w-3 h-3" /> {g.badge}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    {g.short}
                  </div>
                  <div className="font-display font-black text-xl text-white mt-0.5">
                    {g.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{g.tagline}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* PACKAGES */}
      <section
        id="packages"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="chip bg-white/5 text-gray-400 mb-3">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Katalog Koin
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">
              Pilih Paket <span className="text-gradient-cyan">Favoritmu</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              Bonus koin sudah termasuk. Delivery langsung ke ID Player kamu.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              data-testid="search-coin-package-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari paket / koin..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[{ id: "all", short: "Semua", accent: "#F9FAFB" }, ...GAMES].map(
            (g) => {
              const active = activeGame === g.id;
              return (
                <button
                  key={g.id}
                  data-testid={`game-tab-${g.id}`}
                  onClick={() => setActiveGame(g.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                    active
                      ? "text-black shadow-lg"
                      : "text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                  style={
                    active
                      ? {
                          background: `linear-gradient(135deg, ${g.accent || "#00F0FF"}, ${g.accent === "#00F0FF" || !g.accent ? "#0284C7" : g.accent})`,
                          boxShadow: `0 8px 24px -8px ${g.accent || "#00F0FF"}80`,
                        }
                      : {}
                  }
                >
                  {g.short}
                </button>
              );
            },
          )}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => {
            const game = GAMES.find((g) => g.id === p.game);
            return (
              <div
                key={p.id}
                data-testid={`coin-card-${p.id}`}
                className="glass-card rounded-2xl p-5 hover-lift relative overflow-hidden group fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div
                  className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
                  style={{ background: game?.accent || "#00F0FF" }}
                />
                <div className="flex items-start justify-between relative">
                  <div>
                    <div
                      className="chip"
                      style={{
                        background: `${game?.accent || "#00F0FF"}18`,
                        color: game?.accent || "#00F0FF",
                        border: `1px solid ${game?.accent || "#00F0FF"}40`,
                      }}
                    >
                      {game?.short}
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <div className="font-display font-black text-3xl text-white font-mono-num">
                        {formatNum(p.coin)}
                      </div>
                      <span className="text-xs text-gray-500">koin</span>
                    </div>
                    {p.bonus > 0 && (
                      <div className="mt-1.5 text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> +{formatNum(p.bonus)}{" "}
                        bonus koin
                      </div>
                    )}
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${game?.accent || "#00F0FF"}, #0284C7)`,
                    }}
                  >
                    <Coins className="w-6 h-6 text-black" strokeWidth={2.5} />
                  </div>
                </div>

                {p.badge && (
                  <div className="mt-3">
                    <span className="chip bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {p.badge}
                    </span>
                  </div>
                )}

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      Harga
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <div className="font-display font-black text-2xl text-cyan-300 font-mono-num">
                        {formatIDR(p.price)}
                      </div>
                      {p.original && (
                        <div className="text-xs text-gray-500 line-through font-mono-num">
                          {formatIDR(p.original)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500">{p.tag}</div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    data-testid={`btn-add-to-cart-${p.id}`}
                    onClick={() => {
                      addToCart(p);
                      setCartOpen(true);
                    }}
                    className="flex-1 btn-ghost py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Keranjang
                  </button>
                  <button
                    data-testid={`btn-instant-buy-${p.id}`}
                    onClick={() => {
                      addToCart(p);
                      setCheckoutOpen(true);
                    }}
                    className="flex-1 btn-primary py-2.5 rounded-xl text-sm inline-flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" /> Beli
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            Tidak ada paket yang cocok dengan pencarian.
          </div>
        )}
      </section>

      {/* PAYMENT METHODS */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="glass-card rounded-3xl p-8 lg:p-10 overflow-hidden relative">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative">
            <div className="chip bg-white/5 text-gray-400 mb-3">
              <Wallet className="w-3.5 h-3.5 text-cyan-400" /> Metode Pembayaran
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">
              Bayar Sesuai <span className="text-gradient-cyan">Selera</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm max-w-lg">
              Kami menerima 5 metode pembayaran populer di Indonesia. Konfirmasi
              otomatis via WhatsApp.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = PAYMENT_ICONS[pm.id] || Wallet;
                return (
                  <div
                    key={pm.id}
                    data-testid={`payment-showcase-${pm.id}`}
                    className="glass-card rounded-2xl p-4 hover-lift"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${pm.color}22`, color: pm.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-display font-bold text-white text-sm">
                      {pm.name}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {pm.type}
                    </div>
                    <div className="chip mt-3 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      <Check className="w-3 h-3" /> {pm.badge}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white">
            3 Langkah <span className="text-gradient-cyan">Beres</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              n: "01",
              t: "Pilih Paket",
              d: "Pilih game dan paket koin sesuai kebutuhan kamu.",
              i: Coins,
              c: "#00F0FF",
            },
            {
              n: "02",
              t: "Isi Data & Bayar",
              d: "Isi ID Player, WA, pilih metode pembayaran, lalu transfer.",
              i: Wallet,
              c: "#FFB800",
            },
            {
              n: "03",
              t: "Koin Masuk",
              d: "Konfirmasi ke WhatsApp admin, koin diproses 1-3 menit.",
              i: Check,
              c: "#10B981",
            },
          ].map((s) => (
            <div key={s.n} className="glass-card rounded-2xl p-6 relative">
              <div className="flex items-center justify-between">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.c}22`, color: s.c }}
                >
                  <s.i className="w-5 h-5" />
                </div>
                <div
                  className="font-display font-black text-4xl opacity-20 font-mono-num"
                  style={{ color: s.c }}
                >
                  {s.n}
                </div>
              </div>
              <div className="mt-4 font-display font-bold text-xl text-white">
                {s.t}
              </div>
              <div className="mt-1.5 text-sm text-gray-400">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-amber-400 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-black" strokeWidth={2.5} />
                </div>
                <div className="font-display font-black text-white">
                  TOPUP UB STORE
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3 max-w-md">
                Pusat top up koin resmi untuk Bus Simulator Indonesia (BUSSID),
                Bus Simulator India, dan Truck Simulator Indonesia. Cepat,
                aman, dan terpercaya.
              </p>
              <a
                data-testid="footer-whatsapp-btn"
                href={STORE.waUrl(
                  "Halo admin TOPUP UB STORE, saya butuh bantuan.",
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp {STORE.wa}
              </a>
            </div>
            <div>
              <div className="text-white font-semibold text-sm mb-3">Game</div>
              <ul className="space-y-2 text-sm text-gray-400">
                {GAMES.map((g) => (
                  <li key={g.id}>{g.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold text-sm mb-3">
                Operasional
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> 24/7 Otomatis
              </div>
              <div className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Garansi
                proses cepat
              </div>
            </div>
          </div>
          <div className="divider-glow my-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <div>© {new Date().getFullYear()} TOPUP UB STORE. All rights reserved.</div>
            <div>Made with ⚡ for gamers Indonesia.</div>
          </div>
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          total={total}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            setCheckoutOpen(true);
          }}
        />
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          total={total}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={(order) => {
            setCheckoutOpen(false);
            setSuccessOrder(order);
            clearCart();
          }}
        />
      )}

      {/* SUCCESS MODAL */}
      {successOrder && (
        <SuccessModal
          order={successOrder}
          onClose={() => setSuccessOrder(null)}
        />
      )}
    </div>
  );
}

/* -------------------- CART DRAWER -------------------- */
function CartDrawer({ cart, total, onClose, onCheckout }) {
  return (
    <div
      data-testid="cart-drawer-sheet"
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:w-[420px] h-full bg-[#0b1220] border-l border-white/10 flex flex-col fade-up">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              Keranjang
            </div>
            <div className="font-display font-bold text-white text-lg">
              {cart.length} produk
            </div>
          </div>
          <button
            data-testid="cart-close-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full btn-ghost flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <ShoppingCart className="w-10 h-10 mx-auto opacity-40 mb-3" />
              Keranjang masih kosong
            </div>
          )}
          {cart.map((item) => {
            const g = GAMES.find((x) => x.id === item.game);
            return (
              <div
                key={item.id}
                data-testid={`cart-item-${item.id}`}
                className="glass-card rounded-2xl p-3.5 flex items-center gap-3"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${g?.accent || "#00F0FF"}22`,
                    color: g?.accent || "#00F0FF",
                  }}
                >
                  <Coins className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-500 uppercase">
                    {g?.short}
                  </div>
                  <div className="font-semibold text-white text-sm truncate font-mono-num">
                    {formatNum(item.coin)} koin
                    {item.bonus > 0 && (
                      <span className="text-emerald-400 text-xs ml-1">
                        +{formatNum(item.bonus)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-cyan-300 font-mono-num mt-0.5">
                    {formatIDR(item.price)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    data-testid={`cart-dec-${item.id}`}
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 rounded-lg btn-ghost flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="w-7 text-center text-sm font-mono-num text-white">
                    {item.qty}
                  </div>
                  <button
                    data-testid={`cart-inc-${item.id}`}
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 rounded-lg btn-ghost flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    data-testid={`cart-remove-${item.id}`}
                    onClick={() => removeItem(item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 border-t border-white/10 bg-black/40">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">Total</div>
            <div
              data-testid="cart-total"
              className="font-display font-black text-2xl text-cyan-300 font-mono-num"
            >
              {formatIDR(total)}
            </div>
          </div>
          <button
            data-testid="cart-checkout-button"
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="w-full btn-primary py-3 rounded-xl inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Checkout <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- CHECKOUT MODAL -------------------- */
function CheckoutModal({ cart, total, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [wa, setWa] = useState("");
  const [pm, setPm] = useState("qris");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoInfo, setPromoInfo] = useState(null); // {code, discount, label}
  const [promoMsg, setPromoMsg] = useState("");

  const discount = promoInfo?.discount || 0;
  const finalTotal = Math.max(0, total - discount);

  const tryApply = () => {
    setPromoMsg("");
    const res = applyPromo(promoCode, total);
    if (res.ok) {
      setPromoInfo({ code: res.promo.code, discount: res.discount, label: res.promo.label });
      setPromoMsg(`✓ ${res.promo.label} diterapkan.`);
    } else {
      setPromoInfo(null);
      setPromoMsg(res.reason);
    }
  };

  const removePromo = () => {
    setPromoInfo(null);
    setPromoCode("");
    setPromoMsg("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !playerId.trim() || !wa.trim()) {
      setError("Mohon lengkapi semua data.");
      return;
    }
    if (cart.length === 0) {
      setError("Keranjang kosong.");
      return;
    }
    setSubmitting(true);
    const order = {
      id: genOrderId(),
      createdAt: new Date().toISOString(),
      status: "Pending",
      customerName: name.trim(),
      playerId: playerId.trim(),
      whatsapp: wa.trim(),
      paymentMethod: pm,
      items: cart.map((c) => ({
        id: c.id,
        game: c.game,
        coin: c.coin,
        bonus: c.bonus,
        price: c.price,
        qty: c.qty,
      })),
      subtotal: total,
      promoCode: promoInfo?.code || "",
      discount,
      total: finalTotal,
    };
    saveOrder(order);
    const res = await postOrderToAppsScript(order);
    order._synced = res.ok;
    setSubmitting(false);
    onSuccess(order);
  };

  return (
    <div
      data-testid="checkout-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto glass-card rounded-3xl border-cyan-500/20 fade-up">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0b1220]/95 backdrop-blur">
          <div>
            <div className="text-xs text-cyan-300 uppercase tracking-wider">
              Checkout
            </div>
            <div className="font-display font-black text-white text-2xl">
              Konfirmasi Pesanan
            </div>
          </div>
          <button
            data-testid="checkout-close-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full btn-ghost flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Order summary */}
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Ringkasan
            </div>
            {cart.map((item) => {
              const g = GAMES.find((x) => x.id === item.game);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="text-gray-300">
                    <span className="text-[11px] text-gray-500 mr-1">
                      {g?.short}
                    </span>
                    <span className="font-mono-num">
                      {formatNum(item.coin)}
                    </span>{" "}
                    koin × {item.qty}
                  </div>
                  <div className="font-mono-num text-white">
                    {formatIDR(item.price * item.qty)}
                  </div>
                </div>
              );
            })}
            <div className="divider-glow" />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">Subtotal</div>
              <div className="font-mono-num text-gray-200 text-sm">
                {formatIDR(total)}
              </div>
            </div>
            {discount > 0 && (
              <div
                className="flex items-center justify-between"
                data-testid="checkout-discount-row"
              >
                <div className="text-sm text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Diskon ({promoInfo.code})
                </div>
                <div className="font-mono-num text-emerald-300 text-sm">
                  −{formatIDR(discount)}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <div className="text-sm text-gray-400">Total Bayar</div>
              <div className="font-display font-black text-xl text-cyan-300 font-mono-num">
                {formatIDR(finalTotal)}
              </div>
            </div>
          </div>

          {/* PROMO CODE */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">
              Kode Promo (opsional)
            </label>
            {promoInfo ? (
              <div
                data-testid="promo-applied"
                className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-300 font-mono-num">
                    {promoInfo.code}
                  </span>
                  <span className="text-emerald-200/80 text-xs">
                    · {promoInfo.label}
                  </span>
                </div>
                <button
                  type="button"
                  data-testid="promo-remove-btn"
                  onClick={removePromo}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  data-testid="promo-code-input"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: UBHEMAT10"
                  className="uppercase"
                />
                <button
                  type="button"
                  data-testid="promo-apply-btn"
                  onClick={tryApply}
                  className="btn-ghost px-4 rounded-xl text-sm whitespace-nowrap"
                >
                  Pakai
                </button>
              </div>
            )}
            {promoMsg && !promoInfo && (
              <div
                data-testid="promo-message"
                className="text-xs mt-1.5 text-red-300"
              >
                {promoMsg}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">
                Nama Lengkap
              </label>
              <input
                data-testid="checkout-player-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">
                ID Player / User ID
              </label>
              <input
                data-testid="checkout-player-id-input"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="Contoh: BUSSID-123456"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-400 mb-1.5 block">
                Nomor WhatsApp Aktif
              </label>
              <input
                data-testid="checkout-whatsapp-input"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                placeholder="08xxxxxxxxxx"
                inputMode="tel"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">
              Metode Pembayaran
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = PAYMENT_ICONS[m.id];
                const active = pm === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-testid={`payment-method-${m.id}`}
                    onClick={() => setPm(m.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      active
                        ? "border-cyan-500/60 bg-cyan-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `${m.color}22`, color: m.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {m.account}
                      </div>
                    </div>
                    {active && (
                      <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div
              data-testid="checkout-error"
              className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            data-testid="submit-order-button"
            className="w-full btn-primary py-3.5 rounded-xl inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              "Memproses..."
            ) : (
              <>
                Buat Pesanan <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* -------------------- SUCCESS MODAL -------------------- */
function SuccessModal({ order, onClose }) {
  const pm = PAYMENT_METHODS.find((p) => p.id === order.paymentMethod);
  const gameLabel = (id) => GAMES.find((g) => g.id === id)?.short || id;

  const items = order.items
    .map(
      (it) =>
        `• ${gameLabel(it.game)} — ${formatNum(it.coin)} koin${it.bonus ? ` + ${formatNum(it.bonus)} bonus` : ""} × ${it.qty} = ${formatIDR(it.price * it.qty)}`,
    )
    .join("\n");

  const subtotal = order.subtotal ?? order.total;
  const discountLine = order.discount
    ? `\n💸 Diskon (${order.promoCode || "PROMO"}): -${formatIDR(order.discount)}`
    : "";

  const message = `*ORDER BARU - TOPUP UB STORE*
━━━━━━━━━━━━━━━━━━
🆔 ID Order: ${order.id}
👤 Nama: ${order.customerName}
🎮 ID Player: ${order.playerId}
📱 WhatsApp: ${order.whatsapp}

*Pesanan:*
${items}

🧾 Subtotal: ${formatIDR(subtotal)}${discountLine}
💰 Total Bayar: ${formatIDR(order.total)}
💳 Metode: ${pm?.name} (${pm?.account})

Mohon diproses ya admin, terima kasih! 🙏`;

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await safeCopy(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-testid="order-success-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg glass-card rounded-3xl border-emerald-500/30 fade-up">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 glow-emerald">
            <Check className="w-8 h-8 text-emerald-400" strokeWidth={3} />
          </div>
          <div className="font-display font-black text-2xl text-white">
            Pesanan Berhasil Dibuat!
          </div>
          <div className="text-sm text-gray-400 mt-2">
            ID Order:{" "}
            <span
              className="font-mono-num text-cyan-300"
              data-testid="success-order-id"
            >
              {order.id}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-4 mt-5 text-left">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Pesan konfirmasi ke WhatsApp
            </div>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono-num max-h-40 overflow-y-auto">
              {message}
            </pre>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              data-testid="copy-order-message"
              onClick={copy}
              className="btn-ghost py-3 rounded-xl inline-flex items-center justify-center gap-2 text-sm"
            >
              <Copy className="w-4 h-4" />{" "}
              {copied ? "Tersalin!" : "Salin Pesan"}
            </button>
            <a
              data-testid="wa-confirmation-redirect-btn"
              href={STORE.waUrl(message)}
              target="_blank"
              rel="noreferrer"
              className="btn-primary py-3 rounded-xl inline-flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle className="w-4 h-4" /> Kirim ke WhatsApp
            </a>
          </div>

          <button
            data-testid="success-close-btn"
            onClick={onClose}
            className="mt-4 text-xs text-gray-500 hover:text-white"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
