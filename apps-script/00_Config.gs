const CONFIG = {
  APP_NAME: 'KoinPlay Store',
  SESSION_DAYS: 7,
  MAX_PROOF_BYTES: 3 * 1024 * 1024,
  ALLOWED_PROOF_MIME: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  SHEETS: {
    Users: ['userId','name','email','passwordHash','role','status','balance','createdAt','lastLoginAt'],
    Products: ['productId','game','name','coins','price','description','imageUrl','active','createdAt','updatedAt'],
    Transactions: ['transactionId','userId','userEmail','productId','productName','amount','paymentMethod','status','paymentNote','rejectionReason','proofUrl','createdAt','approvedAt','completedAt','telegramNotified'],
    Payments: ['paymentId','transactionId','method','reference','amount','proofUrl','status','note','createdAt'],
    Promotions: ['promoId','title','description','bannerUrl','discountType','discountValue','startAt','endAt','active','createdAt','updatedAt'],
    Settings: ['key','value','updatedAt'],
    'Admin Logs': ['logId','adminUserId','action','targetId','details','createdAt'],
    Sessions: ['sessionId','userId','tokenHash','createdAt','expiresAt','active'],
    Notifications: ['notificationId','userId','title','message','type','read','createdAt']
  }
};

function getDb() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  if (spreadsheetId) return SpreadsheetApp.openById(spreadsheetId);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('Database belum dikonfigurasi. Jalankan setupDatabase() atau isi Script Property SPREADSHEET_ID.');
}

function nowIso_() { return new Date().toISOString(); }
function json_(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }
function ok_(data, message) { return { ok:true, message:message || 'OK', data:data === undefined ? null : data }; }
function err_(message, code) { return { ok:false, error:message, code:code || 'ERROR' }; }
function sanitize_(value, max) {
  const s = String(value == null ? '' : value).trim();
  return s.slice(0, max || 5000);
}
function normalizeEmail_(email) { return sanitize_(email, 200).toLowerCase(); }
function bool_(value) { return value === true || value === 'true' || value === 1 || value === '1'; }
function money_(n) { return Math.round(Number(n) || 0); }
function isValidEmail_(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isAdminRole_(role) { return role === 'admin'; }

function uuid_() { return Utilities.getUuid(); }
function secureRandom_() {
  const bytes = Utilities.newBlob(Utilities.getUuid()).getBytes();
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes);
  return digest.map(function(b){ return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
function sha256_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function(b){ return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
function hashPassword_(password, salt) { return (salt || secureRandom_()) + '$' + sha256_((salt || '') + '|' + password); }
function verifyPassword_(stored, password) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 2) return false;
  return stored === hashPassword_(password, parts[0]);
}

function rows_(sheetName) {
  const sh = getDb().getSheetByName(sheetName);
  if (!sh) throw new Error('Sheet tidak ditemukan: ' + sheetName);
  const values = sh.getDataRange().getValues();
  if (!values.length) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(function(row){ return row.some(function(v){ return v !== ''; }); }).map(function(row){
    const obj = {};
    headers.forEach(function(h, i){ obj[h] = row[i]; });
    return obj;
  });
}
function sheet_(sheetName) {
  const sh = getDb().getSheetByName(sheetName);
  if (!sh) throw new Error('Sheet tidak ditemukan: ' + sheetName);
  return sh;
}
function append_(sheetName, obj) {
  const sh = sheet_(sheetName);
  const headers = CONFIG.SHEETS[sheetName];
  sh.appendRow(headers.map(function(h){ return obj[h] === undefined ? '' : obj[h]; }));
}
function findOne_(sheetName, field, value) {
  const list = rows_(sheetName);
  for (let i=0;i<list.length;i++) if (String(list[i][field]) === String(value)) return list[i];
  return null;
}
function updateByField_(sheetName, field, value, patch) {
  const sh = sheet_(sheetName);
  const headers = CONFIG.SHEETS[sheetName];
  const range = sh.getDataRange();
  const values = range.getValues();
  if (values.length < 2) return false;
  const fieldIdx = headers.indexOf(field);
  if (fieldIdx < 0) throw new Error('Field tidak ditemukan: ' + field);
  for (let r=1; r<values.length; r++) {
    if (String(values[r][fieldIdx]) === String(value)) {
      Object.keys(patch).forEach(function(k){
        const idx = headers.indexOf(k);
        if (idx >= 0) values[r][idx] = patch[k];
      });
      range.setValues(values);
      return true;
    }
  }
  return false;
}
function requireFields_(obj, fields) {
  fields.forEach(function(f){ if (obj[f] === undefined || String(obj[f]).trim() === '') throw new Error('Field wajib: ' + f); });
}

function getSetting_(key, fallback) {
  const row = findOne_('Settings','key',key);
  return row ? row.value : fallback;
}
function setSetting_(key, value) {
  const current = findOne_('Settings','key',key);
  if (current) updateByField_('Settings','key',key,{value:value,updatedAt:nowIso_()});
  else append_('Settings',{key:key,value:value,updatedAt:nowIso_()});
}

function ensureHeader_(sh, headers) {
  if (sh.getLastRow() === 0) sh.getRange(1,1,1,headers.length).setValues([headers]);
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#111827').setFontColor('#ffffff');
  sh.autoResizeColumns(1, headers.length);
}

function setupDatabase() {
  const props = PropertiesService.getScriptProperties();
  let ss;
  const id = props.getProperty('SPREADSHEET_ID');
  if (id) ss = SpreadsheetApp.openById(id);
  else {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    ss = active || SpreadsheetApp.create(CONFIG.APP_NAME + ' Database');
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }
  Object.keys(CONFIG.SHEETS).forEach(function(name){
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    ensureHeader_(sh, CONFIG.SHEETS[name]);
  });
  const settings = rows_('Settings');
  if (!settings.length) {
    [
      ['STORE_NAME', CONFIG.APP_NAME],
      ['STORE_TAGLINE', 'Top up koin game cepat, rapi, dan terpercaya'],
      ['QRIS_IMAGE_URL', 'https://placehold.co/600x600/png?text=UPLOAD+QRIS'],
      ['BANK_NAME', 'BCA'],
      ['BANK_ACCOUNT', '1234567890'],
      ['BANK_HOLDER', 'NAMA TOKO'],
      ['DANA_NUMBER', '08xxxxxxxxxx'],
      ['OVO_NUMBER', '08xxxxxxxxxx'],
      ['GOPAY_NUMBER', '08xxxxxxxxxx'],
      ['SHOPEEPAY_NUMBER', '08xxxxxxxxxx'],
      ['PAYMENT_FOLDER_ID', ''],
      ['SUPPORT_CONTACT', 'Telegram @username']
    ].forEach(function(item){ append_('Settings',{key:item[0],value:item[1],updatedAt:nowIso_()}); });
  }
  seedDummyData_();
  return ok_({spreadsheetId:ss.getId(),spreadsheetUrl:ss.getUrl()}, 'Database siap digunakan.');
}

function seedDummyData_() {
  if (!rows_('Products').length) {
    const products = [
      {productId:'P-BUSSID-10K',game:'BUSSID',name:'10.000 Koin BUSSID',coins:10000,price:25000,description:'Paket koin BUS Simulator Indonesia.',imageUrl:'https://placehold.co/800x600/png?text=BUSSID+10K',active:true,createdAt:nowIso_(),updatedAt:nowIso_()},
      {productId:'P-BUSSIN-10K',game:'BUSSIN',name:'10.000 Koin BUSSIN',coins:10000,price:27000,description:'Paket koin Bus Simulator Indonesia.',imageUrl:'https://placehold.co/800x600/png?text=BUSSIN+10K',active:true,createdAt:nowIso_(),updatedAt:nowIso_()},
      {productId:'P-TRUCKSID-20K',game:'TRUCKSID',name:'20.000 Koin TRUCKSID',coins:20000,price:45000,description:'Paket koin Truck Simulator Indonesia.',imageUrl:'https://placehold.co/800x600/png?text=TRUCKSID+20K',active:true,createdAt:nowIso_(),updatedAt:nowIso_()}
    ];
    products.forEach(function(p){append_('Products',p);});
  }
  const userRows = rows_('Users');
  if (!userRows.length) {
    append_('Users',{userId:'U-ADMIN-001',name:'Administrator',email:'admin@demo.com',passwordHash:hashPassword_('Admin123!'),role:'admin',status:'active',balance:0,createdAt:nowIso_(),lastLoginAt:''});
    append_('Users',{userId:'U-DEMO-001',name:'Demo User',email:'user@demo.com',passwordHash:hashPassword_('User123!'),role:'user',status:'active',balance:0,createdAt:nowIso_(),lastLoginAt:''});
  } else {
    const adminDemo = findOne_('Users','email','admin@demo.com');
    const userDemo = findOne_('Users','email','user@demo.com');
    if (adminDemo && String(adminDemo.passwordHash).indexOf('<generated-by-setup>') >= 0) updateByField_('Users','email','admin@demo.com',{passwordHash:hashPassword_('Admin123!')});
    if (userDemo && String(userDemo.passwordHash).indexOf('<generated-by-setup>') >= 0) updateByField_('Users','email','user@demo.com',{passwordHash:hashPassword_('User123!')});
  }
  if (!rows_('Promotions').length) append_('Promotions',{promoId:'PROMO-WELCOME',title:'Promo Welcome',description:'Diskon Rp5.000 untuk paket tertentu.',bannerUrl:'https://placehold.co/1200x360/png?text=Promo+Welcome',discountType:'fixed',discountValue:5000,startAt:nowIso_(),endAt:new Date(Date.now()+30*86400000).toISOString(),active:true,createdAt:nowIso_(),updatedAt:nowIso_()});
}
