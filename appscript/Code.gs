// ================================================================
// TOPUP UB STORE — Google Apps Script Backend
// ================================================================
// Panduan setup lengkap: /app/appscript/README.md dan tab Admin.
//
// PENTING - Cara Buka Apps Script Yang Benar:
//   Buka Google Sheet kamu → menu Extensions → Apps Script.
//   (JANGAN buat lewat script.google.com secara langsung / standalone.)
//   Kalau terlanjur bikin standalone, isi variabel SHEET_ID di bawah
//   dengan ID sheet kamu.
// ================================================================

// === KONFIGURASI ===
// (Opsional) Kalau script kamu STANDALONE, isi ID Google Sheet di bawah.
// Cara ambil ID: buka Google Sheet → lihat URL:
// https://docs.google.com/spreadsheets/d/<INI_SHEET_ID>/edit
// Kalau script container-bound (dibuka dari Extensions → Apps Script),
// biarkan string kosong.
const SHEET_ID = '';

const SHEET_NAME = 'Orders';
const HEADERS = [
  'id','createdAt','status','customerName','playerId','whatsapp',
  'paymentMethod','items','subtotal','discount','promoCode','total','synced'
];

// === NOTIFIKASI (opsional — kosongkan untuk mematikan) ===
const TELEGRAM_BOT_TOKEN = '';
const TELEGRAM_CHAT_ID   = '';
const ADMIN_EMAIL        = '';

function getSpreadsheet_() {
  if (SHEET_ID && String(SHEET_ID).trim()) {
    return SpreadsheetApp.openById(String(SHEET_ID).trim());
  }
  const active = SpreadsheetApp.getActive();
  if (!active) {
    throw new Error(
      'Spreadsheet tidak ditemukan. Isi konstanta SHEET_ID di bagian atas ' +
      'Code.gs dengan ID Google Sheet kamu, atau buka script ini via ' +
      'Extensions → Apps Script dari dalam Google Sheet.'
    );
  }
  return active;
}

function getSheet_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'listOrders';
  try {
    if (action === 'listOrders') return jsonOut_({ ok: true, orders: listOrders_() });
    if (action === 'ping')       return jsonOut_({ ok: true, msg: 'pong', time: new Date().toISOString() });
    return jsonOut_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err && err.message || err) });
  }
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'createOrder') {
      const order = JSON.parse(p.payload || '{}');
      const res = createOrder_(order);
      try { notify_(order); } catch (err) { /* jangan gagalkan order karena notif */ }
      return jsonOut_(res);
    }
    if (p.action === 'updateStatus') return jsonOut_(updateStatus_(p.id, p.status));
    if (p.action === 'deleteOrder')  return jsonOut_(deleteOrder_(p.id));
    return jsonOut_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err && err.message || err) });
  }
}

function createOrder_(o) {
  const sh = getSheet_();
  sh.appendRow([
    o.id, o.createdAt, o.status || 'Pending', o.customerName, o.playerId,
    o.whatsapp, o.paymentMethod, JSON.stringify(o.items || []),
    Number(o.subtotal || o.total || 0), Number(o.discount || 0),
    o.promoCode || '', Number(o.total || 0), true
  ]);
  return { ok: true, id: o.id };
}

function listOrders_() {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const [head, ...rows] = values;
  return rows
    .filter(function (r) { return r[0]; })
    .map(function (r) {
      const o = {};
      head.forEach(function (k, i) { o[k] = r[i]; });
      try { o.items = JSON.parse(o.items || '[]'); } catch (e) { o.items = []; }
      if (o.createdAt instanceof Date) o.createdAt = o.createdAt.toISOString();
      return o;
    })
    .reverse();
}

function updateStatus_(id, status) {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sh.getRange(i + 1, 3).setValue(status);
      return { ok: true };
    }
  }
  return { ok: false, error: 'not found' };
}

function deleteOrder_(id) {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sh.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { ok: false, error: 'not found' };
}

// === NOTIFIKASI ADMIN ===
function notify_(o) {
  const lines = (o.items || []).map(function (it) {
    return '• ' + String(it.game || '').toUpperCase() + ' — ' +
      Number(it.coin).toLocaleString('id-ID') + ' × ' + it.qty;
  }).join('\n');
  const msg =
    '🔔 ORDER BARU - TOPUP UB STORE\n' +
    '━━━━━━━━━━━━━━━━\n' +
    'ID: ' + o.id + '\n' +
    'Nama: ' + o.customerName + '\n' +
    'Player: ' + o.playerId + '\n' +
    'WA: ' + o.whatsapp + '\n\n' +
    lines + '\n\n' +
    'Total: Rp' + Number(o.total || 0).toLocaleString('id-ID') + '\n' +
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
}
