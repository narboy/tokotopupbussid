// Product catalog for TOPUP UB STORE
// Prices in IDR

export const GAMES = [
  {
    id: "bussid",
    name: "Bus Simulator Indonesia",
    short: "BUSSID",
    tagline: "Livery & Bus Custom Tanpa Batas",
    badge: "Terpopuler",
    accent: "#00F0FF",
    banner:
      "https://images.pexels.com/photos/6498716/pexels-photo-6498716.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "bs_india",
    name: "Bus Simulator India",
    short: "BS India",
    tagline: "Jelajahi Rute Eksotik India",
    badge: "Hot Game",
    accent: "#FFB800",
    banner:
      "https://images.unsplash.com/photo-1545804913-688517980abc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBnb2xkJTIwY29pbnMlMjB0b3B1cCUyMG5lb258ZW58MHx8fHwxNzg3MzI3MzQ1fDA&ixlib=rb-4.1.0&q=85",
  },
  {
    id: "tsi",
    name: "Truck Simulator Indonesia",
    short: "TSI",
    tagline: "Raja Jalanan & Muatan Berat",
    badge: "New Arrival",
    accent: "#10B981",
    banner:
      "https://images.pexels.com/photos/5767676/pexels-photo-5767676.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
];

// Coin packages per game
const buildPackages = (gameId, gamePrefix) => [
  {
    id: `${gameId}-100k`,
    game: gameId,
    coin: 100_000,
    bonus: 0,
    price: 12_000,
    original: null,
    tag: "Starter",
    badge: null,
  },
  {
    id: `${gameId}-250k`,
    game: gameId,
    coin: 250_000,
    bonus: 25_000,
    price: 28_000,
    original: 32_000,
    tag: "Reguler",
    badge: "+10% Bonus",
  },
  {
    id: `${gameId}-500k`,
    game: gameId,
    coin: 500_000,
    bonus: 75_000,
    price: 52_000,
    original: 60_000,
    tag: "Populer",
    badge: "+15% Bonus",
  },
  {
    id: `${gameId}-1m`,
    game: gameId,
    coin: 1_000_000,
    bonus: 200_000,
    price: 99_000,
    original: 120_000,
    tag: "Best Value",
    badge: "Hot 🔥",
  },
  {
    id: `${gameId}-3m`,
    game: gameId,
    coin: 3_000_000,
    bonus: 750_000,
    price: 285_000,
    original: 360_000,
    tag: "Premium",
    badge: "+25% Bonus",
  },
  {
    id: `${gameId}-5m`,
    game: gameId,
    coin: 5_000_000,
    bonus: 1_500_000,
    price: 465_000,
    original: 600_000,
    tag: "Ultimate",
    badge: "+30% Bonus",
  },
];

export const PACKAGES = [
  ...buildPackages("bussid", "BUSSID"),
  ...buildPackages("bs_india", "BS India"),
  ...buildPackages("tsi", "TSI"),
];

// Merge base packages with admin overrides stored in localStorage.
// Overrides can change: price, bonus, original, badge, tag.
export const getMergedPackages = () => {
  let overrides = {};
  try {
    overrides = JSON.parse(localStorage.getItem("ub_pkg_overrides_v1") || "{}");
  } catch {
    overrides = {};
  }
  return PACKAGES.map((p) => (overrides[p.id] ? { ...p, ...overrides[p.id] } : p));
};

export const PAYMENT_METHODS = [
  {
    id: "qris",
    name: "QRIS All Payment",
    type: "E-Wallet / Bank",
    badge: "Instant Scan",
    account: "Scan QRIS TOPUP UB STORE",
    color: "#00F0FF",
  },
  {
    id: "dana",
    name: "DANA",
    type: "E-Wallet",
    badge: "Bebas Biaya",
    account: "0838 2599 3903 (a.n. TOPUP UB)",
    color: "#118EEA",
  },
  {
    id: "seabank",
    name: "SeaBank",
    type: "Bank Transfer",
    badge: "Transfer Gratis",
    account: "9012 3456 7890 (a.n. TOPUP UB)",
    color: "#EE4D2D",
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    type: "E-Wallet",
    badge: "Cashback Ready",
    account: "0838 2599 3903 (a.n. TOPUP UB)",
    color: "#F04E23",
  },
  {
    id: "gopay",
    name: "GoPay",
    type: "E-Wallet",
    badge: "Serba Praktis",
    account: "0838 2599 3903 (a.n. TOPUP UB)",
    color: "#00AA13",
  },
];

export const STORE = {
  name: "TOPUP UB STORE",
  wa: "083825993903",
  waIntl: "6283825993903",
  waUrl: (msg) => `https://wa.me/6283825993903?text=${encodeURIComponent(msg)}`,
  tagline:
    "Pusat Top Up Koin Bus Simulator & Truck Simulator Tercepat & Terpercaya",
};

export const formatIDR = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export const formatNum = (n) => new Intl.NumberFormat("id-ID").format(n);
