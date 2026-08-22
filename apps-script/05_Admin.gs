function adminDashboard_(p) {
  const admin = requireAdmin_(p);
  const tx = rows_('Transactions');
  const users = rows_('Users');
  const products = rows_('Products');
  const pending = tx.filter(function(x){return x.status === 'Pending';});
  const revenue = tx.filter(function(x){return x.status === 'Selesai' || x.status === 'Disetujui';}).reduce(function(s,x){return s+money_(x.amount);},0);
  const counts = {};
  tx.forEach(function(x){ counts[x.productName] = (counts[x.productName]||0) + 1; });
  const bestseller = Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];})[0] || '-';
  return ok_({stats:{totalTransactions:tx.length,revenue:revenue,totalUsers:users.filter(function(u){return u.role==='user';}).length,pendingTransactions:pending.length,bestseller:bestseller},pending:pending.sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);}).map(publicTransaction_),admin:safeUser_(admin)});
}

function adminApprove_(p) {
  const admin = requireAdmin_(p);
  requireFields_(p,['transactionId']);
  const tx = findOne_('Transactions','transactionId',p.transactionId);
  if (!tx) throw new Error('Transaksi tidak ditemukan.');
  if (tx.status !== 'Pending') throw new Error('Transaksi sudah diproses.');
  const when = nowIso_();
  updateByField_('Transactions','transactionId',tx.transactionId,{status:'Disetujui',approvedAt:when,paymentNote:sanitize_(p.note,500)});
  notifyUser_(tx.userId,'Pembayaran disetujui','Pembayaran untuk ' + tx.productName + ' telah disetujui. Pesanan sedang diproses.','success');
  logAdmin_(admin,'APPROVE_PAYMENT',tx.transactionId,p.note || '');
  sendTelegram_('✅ Pembayaran disetujui\nInvoice: ' + tx.transactionId + '\nUser: ' + tx.userEmail + '\nProduk: ' + tx.productName + '\nNominal: Rp' + tx.amount + '\nStatus: Disetujui');
  return ok_(findOne_('Transactions','transactionId',tx.transactionId),'Pembayaran disetujui.');
}

function adminReject_(p) {
  const admin = requireAdmin_(p);
  requireFields_(p,['transactionId','reason']);
  const tx = findOne_('Transactions','transactionId',p.transactionId);
  if (!tx) throw new Error('Transaksi tidak ditemukan.');
  if (tx.status !== 'Pending') throw new Error('Transaksi sudah diproses.');
  const reason = sanitize_(p.reason,500);
  updateByField_('Transactions','transactionId',tx.transactionId,{status:'Ditolak',rejectionReason:reason,paymentNote:sanitize_(p.note,500)});
  notifyUser_(tx.userId,'Pembayaran ditolak','Pembayaran untuk ' + tx.productName + ' ditolak. Alasan: ' + reason,'error');
  logAdmin_(admin,'REJECT_PAYMENT',tx.transactionId,reason);
  sendTelegram_('❌ Pembayaran ditolak\nInvoice: ' + tx.transactionId + '\nUser: ' + tx.userEmail + '\nProduk: ' + tx.productName + '\nAlasan: ' + reason);
  return ok_(findOne_('Transactions','transactionId',tx.transactionId),'Pembayaran ditolak.');
}
function adminComplete_(p) {
  const admin = requireAdmin_(p); requireFields_(p,['transactionId']);
  const tx = findOne_('Transactions','transactionId',p.transactionId);
  if (!tx || tx.status !== 'Disetujui') throw new Error('Transaksi belum dapat diselesaikan.');
  updateByField_('Transactions','transactionId',tx.transactionId,{status:'Selesai',completedAt:nowIso_()});
  notifyUser_(tx.userId,'Pesanan selesai','Pesanan ' + tx.productName + ' telah selesai diproses.','success');
  logAdmin_(admin,'COMPLETE_ORDER',tx.transactionId,'');
  sendTelegram_('🎉 Pesanan selesai\nInvoice: ' + tx.transactionId + '\nUser: ' + tx.userEmail + '\nStatus: Selesai');
  return ok_(findOne_('Transactions','transactionId',tx.transactionId),'Transaksi ditandai selesai.');
}

function adminProducts_(p) { requireAdmin_(p); return ok_(rows_('Products').map(productAdmin_)); }
function productAdmin_(p) { return Object.assign(productPublic_(p),{createdAt:p.createdAt,updatedAt:p.updatedAt}); }
function adminSaveProduct_(p) {
  const admin = requireAdmin_(p);
  requireFields_(p,['name','game','coins','price']);
  const productId = sanitize_(p.productId || ('P-' + new Date().getTime()),80);
  const existing = findOne_('Products','productId',productId);
  const data = {productId:productId,game:sanitize_(p.game,30).toUpperCase(),name:sanitize_(p.name,120),coins:Number(p.coins)||0,price:money_(p.price),description:sanitize_(p.description,500),imageUrl:sanitize_(p.imageUrl,1000),active:bool_(p.active),createdAt:existing ? existing.createdAt : nowIso_(),updatedAt:nowIso_()};
  if (existing) updateByField_('Products','productId',productId,data); else append_('Products',data);
  logAdmin_(admin,existing?'UPDATE_PRODUCT':'CREATE_PRODUCT',productId,data.name);
  return ok_(productAdmin_(data),'Produk tersimpan.');
}
function adminDeleteProduct_(p) { const admin = requireAdmin_(p); requireFields_(p,['productId']); updateByField_('Products','productId',p.productId,{active:false,updatedAt:nowIso_()}); logAdmin_(admin,'DISABLE_PRODUCT',p.productId,''); return ok_(null,'Produk dinonaktifkan.'); }

function adminPromos_(p) { requireAdmin_(p); return ok_(rows_('Promotions').sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);})); }
function adminSavePromo_(p) {
  const admin = requireAdmin_(p); requireFields_(p,['title','discountType','discountValue','startAt','endAt']);
  const id = sanitize_(p.promoId || ('PROMO-' + new Date().getTime()),80);
  const existing = findOne_('Promotions','promoId',id);
  const data={promoId:id,title:sanitize_(p.title,120),description:sanitize_(p.description,500),bannerUrl:sanitize_(p.bannerUrl,1000),discountType:sanitize_(p.discountType,30),discountValue:money_(p.discountValue),startAt:p.startAt,endAt:p.endAt,active:bool_(p.active),createdAt:existing?existing.createdAt:nowIso_(),updatedAt:nowIso_()};
  if(existing) updateByField_('Promotions','promoId',id,data); else append_('Promotions',data);
  logAdmin_(admin,existing?'UPDATE_PROMO':'CREATE_PROMO',id,data.title); return ok_(data,'Promo tersimpan.');
}
function adminDeletePromo_(p) { const admin=requireAdmin_(p); requireFields_(p,['promoId']); updateByField_('Promotions','promoId',p.promoId,{active:false,updatedAt:nowIso_()}); logAdmin_(admin,'DISABLE_PROMO',p.promoId,''); return ok_(null,'Promo dinonaktifkan.'); }

function adminSettings_(p) { requireAdmin_(p); return ok_(getPaymentSettings_()); }
function adminSaveSettings_(p) {
  const admin=requireAdmin_(p); const keys=['QRIS_IMAGE_URL','BANK_NAME','BANK_ACCOUNT','BANK_HOLDER','DANA_NUMBER','OVO_NUMBER','GOPAY_NUMBER','SHOPEEPAY_NUMBER','PAYMENT_FOLDER_ID','SUPPORT_CONTACT'];
  keys.forEach(function(k){ if(p[k] !== undefined) setSetting_(k,sanitize_(p[k],1000)); });
  logAdmin_(admin,'UPDATE_SETTINGS','SETTINGS','Payment settings updated');
  return ok_(getPaymentSettings_(),'Pengaturan pembayaran tersimpan.');
}
function adminLogs_(p) { requireAdmin_(p); return ok_(rows_('Admin Logs').sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);}).slice(0,200)); }
function logAdmin_(admin,action,targetId,details) { append_('Admin Logs',{logId:'LOG-' + new Date().getTime(),adminUserId:admin.userId,action:action,targetId:targetId,details:sanitize_(details,1000),createdAt:nowIso_()}); }
