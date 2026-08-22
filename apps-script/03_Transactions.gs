function checkout_(p) {
  const user = requireAuth_(p);
  requireFields_(p,['productId','paymentMethod']);
  const product = findOne_('Products','productId',p.productId);
  if (!product || !bool_(product.active)) throw new Error('Produk tidak tersedia.');
  const allowed = ['QRIS','BANK','DANA','OVO','GOPAY','SHOPEEPAY'];
  const method = String(p.paymentMethod).toUpperCase();
  if (allowed.indexOf(method) < 0) throw new Error('Metode pembayaran tidak valid.');
  const txId = 'INV-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random()*900+100);
  const amount = money_(product.price);
  const tx = {transactionId:txId,userId:user.userId,userEmail:user.email,productId:product.productId,productName:product.name,amount:amount,paymentMethod:method,status:'Pending',paymentNote:sanitize_(p.paymentNote,500),rejectionReason:'',proofUrl:'',createdAt:nowIso_(),approvedAt:'',completedAt:'',telegramNotified:false};
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try { append_('Transactions',tx); } finally { lock.releaseLock(); }
  notifyAdminNewOrder_(tx);
  return ok_({transaction:publicTransaction_(tx),payment:getPaymentSettings_()},'Invoice berhasil dibuat.');
}

function uploadPayment_(p) {
  const user = requireAuth_(p);
  requireFields_(p,['transactionId','fileName','mimeType','base64']);
  const tx = findOne_('Transactions','transactionId',p.transactionId);
  if (!tx || tx.userId !== user.userId) throw new Error('Transaksi tidak ditemukan.');
  if (tx.status !== 'Pending') throw new Error('Transaksi ini tidak lagi menunggu pembayaran.');
  const mime = String(p.mimeType);
  if (CONFIG.ALLOWED_PROOF_MIME.indexOf(mime) < 0) throw new Error('Format bukti pembayaran harus JPG, PNG, WEBP, atau PDF.');
  const data = String(p.base64).replace(/^data:[^;]+;base64,/,'');
  const bytes = Utilities.base64Decode(data);
  if (bytes.length > CONFIG.MAX_PROOF_BYTES) throw new Error('Ukuran bukti pembayaran maksimal 5 MB.');
  const folderId = getSetting_('PAYMENT_FOLDER_ID','');
  const blob = Utilities.newBlob(bytes,mime,sanitize_(p.fileName,150));
  let file;
  if (folderId) file = DriveApp.getFolderById(folderId).createFile(blob);
  else file = DriveApp.createFile(blob);
  file.setDescription('Bukti pembayaran ' + tx.transactionId + ' - ' + user.email);
  const url = file.getUrl();
  updateByField_('Transactions','transactionId',tx.transactionId,{proofUrl:url,paymentNote:sanitize_(p.note,500)});
  append_('Payments',{paymentId:'PAY-' + new Date().getTime(),transactionId:tx.transactionId,method:tx.paymentMethod,reference:sanitize_(p.reference,120),amount:tx.amount,proofUrl:url,status:'Pending',note:sanitize_(p.note,500),createdAt:nowIso_()});
  return ok_({transactionId:tx.transactionId,proofUrl:url},'Bukti pembayaran berhasil diunggah.');
}

function getTransactions_(p) {
  const user = requireAuth_(p);
  const rows = rows_('Transactions').filter(function(x){ return x.userId === user.userId; }).sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);}).map(publicTransaction_);
  return ok_(rows);
}
function getTransaction_(p) {
  const user = requireAuth_(p);
  const tx = findOne_('Transactions','transactionId',p.transactionId);
  if (!tx || (tx.userId !== user.userId && user.role !== 'admin')) throw new Error('Transaksi tidak ditemukan.');
  return ok_(publicTransaction_(tx));
}
function publicTransaction_(x) { return {transactionId:x.transactionId,productId:x.productId,productName:x.productName,amount:money_(x.amount),paymentMethod:x.paymentMethod,status:x.status,paymentNote:x.paymentNote,rejectionReason:x.rejectionReason,proofUrl:x.proofUrl || '',createdAt:x.createdAt,approvedAt:x.approvedAt,completedAt:x.completedAt}; }

function getPaymentSettings_() {
  return {qrisImageUrl:getSetting_('QRIS_IMAGE_URL',''),bank:{name:getSetting_('BANK_NAME',''),account:getSetting_('BANK_ACCOUNT',''),holder:getSetting_('BANK_HOLDER','')},ewallet:{DANA:getSetting_('DANA_NUMBER',''),OVO:getSetting_('OVO_NUMBER',''),GOPAY:getSetting_('GOPAY_NUMBER',''),SHOPEEPAY:getSetting_('SHOPEEPAY_NUMBER','')},support:getSetting_('SUPPORT_CONTACT','')};
}

function getProfile_(p) { const user = requireAuth_(p); return ok_({user:safeUser_(user),payment:getPaymentSettings_()}); }
function updateProfile_(p) {
  const user = requireAuth_(p);
  const patch = {};
  if (p.name !== undefined) { const name = sanitize_(p.name,100); if (!name) throw new Error('Nama tidak boleh kosong.'); patch.name = name; }
  if (p.password !== undefined && String(p.password)) { if (String(p.password).length < 8) throw new Error('Password minimal 8 karakter.'); patch.passwordHash = hashPassword_(String(p.password)); }
  if (!Object.keys(patch).length) throw new Error('Tidak ada perubahan.');
  updateByField_('Users','userId',user.userId,patch);
  return ok_({user:safeUser_(findOne_('Users','userId',user.userId))},'Profil diperbarui.');
}
