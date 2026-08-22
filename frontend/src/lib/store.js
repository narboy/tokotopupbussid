// Lightweight store using localStorage + custom event

const CART_KEY = "ub_cart_v1";
const ORDERS_KEY = "ub_orders_v1";
const ENDPOINT_KEY = "ub_appscript_url";
const PROMOS_KEY = "ub_promos_v1";
const PKG_OVERRIDES_KEY = "ub_pkg_overrides_v1";
const NOTIF_KEY = "ub_notif_v1";

const emit = (name) => window.dispatchEvent(new Event(name));

export const safeCopy = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to fallback
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

/* -------------------- PROMO CODES -------------------- */
const DEFAULT_PROMOS = [
  { code: "UBHEMAT10", type: "percent", value: 10, minTotal: 30000, active: true, label: "Diskon 10% min. Rp30rb" },
  { code: "NEWBIE5K", type: "flat", value: 5000, minTotal: 20000, active: true, label: "Potongan Rp5.000" },
];

export const getPromos = () => {
  try {
    const raw = localStorage.getItem(PROMOS_KEY);
    if (!raw) return DEFAULT_PROMOS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROMOS;
  }
};
export const savePromos = (list) => {
  localStorage.setItem(PROMOS_KEY, JSON.stringify(list));
  emit("promos:changed");
};
export const applyPromo = (code, subtotal) => {
  const c = String(code || "").trim().toUpperCase();
  if (!c) return { ok: false, reason: "Masukkan kode promo." };
  const promo = getPromos().find((p) => p.code.toUpperCase() === c && p.active);
  if (!promo) return { ok: false, reason: "Kode promo tidak valid." };
  if (promo.minTotal && subtotal < promo.minTotal)
    return { ok: false, reason: `Minimum transaksi Rp${promo.minTotal.toLocaleString("id-ID")}.` };
  const discount =
    promo.type === "percent"
      ? Math.floor((subtotal * promo.value) / 100)
      : Math.min(promo.value, subtotal);
  return { ok: true, promo, discount };
};

/* -------------------- PACKAGE OVERRIDES -------------------- */
export const getPackageOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(PKG_OVERRIDES_KEY) || "{}");
  } catch {
    return {};
  }
};
export const savePackageOverrides = (map) => {
  localStorage.setItem(PKG_OVERRIDES_KEY, JSON.stringify(map || {}));
  emit("packages:changed");
};
export const setPackageOverride = (id, patch) => {
  const map = getPackageOverrides();
  map[id] = { ...(map[id] || {}), ...patch };
  savePackageOverrides(map);
};
export const clearPackageOverride = (id) => {
  const map = getPackageOverrides();
  delete map[id];
  savePackageOverrides(map);
};

/* -------------------- NOTIFICATION SETTINGS -------------------- */
export const getNotifSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || "{}");
  } catch {
    return {};
  }
};
export const setNotifSettings = (obj) => {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(obj || {}));
  emit("notif:changed");
};

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};

export const setCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  emit("cart:changed");
};

export const addToCart = (pkg) => {
  const cart = getCart();
  const existing = cart.find((c) => c.id === pkg.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...pkg, qty: 1 });
  }
  setCart(cart);
};

export const updateQty = (id, qty) => {
  const cart = getCart()
    .map((c) => (c.id === id ? { ...c, qty: Math.max(0, qty) } : c))
    .filter((c) => c.qty > 0);
  setCart(cart);
};

export const removeItem = (id) => {
  setCart(getCart().filter((c) => c.id !== id));
};

export const clearCart = () => setCart([]);

export const cartTotal = (cart) =>
  cart.reduce((sum, c) => sum + c.price * c.qty, 0);

export const cartCount = (cart) => cart.reduce((sum, c) => sum + c.qty, 0);

// Orders (local backup)
export const getOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveOrder = (order) => {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  emit("orders:changed");
};

export const updateOrderLocal = (id, patch) => {
  const orders = getOrders().map((o) => (o.id === id ? { ...o, ...patch } : o));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  emit("orders:changed");
};

export const removeOrderLocal = (id) => {
  const orders = getOrders().filter((o) => o.id !== id);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  emit("orders:changed");
};

// Apps Script endpoint (admin config)
export const getEndpoint = () => localStorage.getItem(ENDPOINT_KEY) || "";
export const setEndpoint = (url) => {
  localStorage.setItem(ENDPOINT_KEY, url || "");
  emit("endpoint:changed");
};

// POST order to Apps Script (no-cors friendly form-encoded)
export const postOrderToAppsScript = async (order) => {
  const url = getEndpoint();
  if (!url) return { ok: false, reason: "no-endpoint" };
  try {
    const formData = new URLSearchParams();
    formData.append("action", "createOrder");
    formData.append("payload", JSON.stringify(order));
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const text = await res.text();
    try {
      return { ok: true, data: JSON.parse(text) };
    } catch {
      return { ok: true, data: text };
    }
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
};

export const fetchOrdersFromAppsScript = async () => {
  const url = getEndpoint();
  if (!url) return { ok: false, reason: "no-endpoint" };
  try {
    const res = await fetch(`${url}?action=listOrders`);
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
};

export const updateOrderStatusAppsScript = async (id, status) => {
  const url = getEndpoint();
  if (!url) return { ok: false, reason: "no-endpoint" };
  try {
    const formData = new URLSearchParams();
    formData.append("action", "updateStatus");
    formData.append("id", id);
    formData.append("status", status);
    const res = await fetch(url, { method: "POST", body: formData });
    const text = await res.text();
    try {
      return { ok: true, data: JSON.parse(text) };
    } catch {
      return { ok: true, data: text };
    }
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
};

export const genOrderId = () =>
  "UB" +
  Date.now().toString(36).toUpperCase() +
  Math.random().toString(36).slice(2, 5).toUpperCase();
