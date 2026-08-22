function doGet(e) {
  try { return json_(dispatch_(e && e.parameter ? e.parameter.action : '', e && e.parameter ? e.parameter : {}, 'GET')); }
  catch (err) { return json_(err_(err.message || String(err))); }
}

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = body.action || (e && e.parameter && e.parameter.action) || '';
    return json_(dispatch_(action, body, 'POST'));
  } catch (err) {
    return json_(err_(err.message || String(err)));
  }
}

function dispatch_(action, payload, method) {
  switch(String(action || '').toLowerCase()) {
    case 'setup': return setupDatabase();
    case 'register': return registerUser_(payload);
    case 'login': return login_(payload);
    case 'logout': return logout_(payload);
    case 'me': return authMe_(payload);
    case 'products': return getProducts_(payload);
    case 'product': return getProduct_(payload);
    case 'checkout': return checkout_(payload);
    case 'transactions': return getTransactions_(payload);
    case 'transaction': return getTransaction_(payload);
    case 'upload-payment': return uploadPayment_(payload);
    case 'promotions': return getPromotions_(payload);
    case 'profile': return getProfile_(payload);
    case 'update-profile': return updateProfile_(payload);
    case 'notifications': return getNotifications_(payload);
    case 'mark-notification-read': return markNotificationRead_(payload);
    case 'admin/dashboard': return adminDashboard_(payload);
    case 'admin/approve': return adminApprove_(payload);
    case 'admin/reject': return adminReject_(payload);
    case 'admin/complete': return adminComplete_(payload);
    case 'admin/products': return adminProducts_(payload);
    case 'admin/product/save': return adminSaveProduct_(payload);
    case 'admin/product/delete': return adminDeleteProduct_(payload);
    case 'admin/promos': return adminPromos_(payload);
    case 'admin/promo/save': return adminSavePromo_(payload);
    case 'admin/promo/delete': return adminDeletePromo_(payload);
    case 'admin/settings': return adminSettings_(payload);
    case 'admin/settings/save': return adminSaveSettings_(payload);
    case 'admin/logs': return adminLogs_(payload);
    default: return err_('Action tidak dikenal: ' + action, 'NOT_FOUND');
  }
}

function registerUser_(p) {
  requireFields_(p,['name','email','password']);
  const email = normalizeEmail_(p.email);
  const name = sanitize_(p.name,100);
  const password = String(p.password || '');
  if (!isValidEmail_(email)) throw new Error('Format email tidak valid.');
  if (password.length < 8) throw new Error('Password minimal 8 karakter.');
  if (findOne_('Users','email',email)) throw new Error('Email sudah terdaftar.');
  const user = {userId:'U-' + new Date().getTime(),name:name,email:email,passwordHash:hashPassword_(password),role:'user',status:'active',balance:0,createdAt:nowIso_(),lastLoginAt:''};
  append_('Users', user);
  return ok_({user:safeUser_(user)},'Registrasi berhasil.');
}

function login_(p) {
  requireFields_(p,['email','password']);
  const email = normalizeEmail_(p.email);
  const user = findOne_('Users','email',email);
  if (!user || !verifyPassword_(String(user.passwordHash), String(p.password))) throw new Error('Email atau password salah.');
  if (String(user.status) !== 'active') throw new Error('Akun tidak aktif.');
  const rawToken = secureRandom_() + secureRandom_();
  const tokenHash = sha256_(rawToken);
  const expires = new Date(Date.now() + CONFIG.SESSION_DAYS * 86400000).toISOString();
  append_('Sessions',{sessionId:'S-' + new Date().getTime(),userId:user.userId,tokenHash:tokenHash,createdAt:nowIso_(),expiresAt:expires,active:true});
  updateByField_('Users','userId',user.userId,{lastLoginAt:nowIso_()});
  return ok_({token:rawToken,user:safeUser_(user)},'Login berhasil.');
}

function logout_(p) {
  const session = requireSession_(p);
  updateByField_('Sessions','tokenHash',session.tokenHash,{active:false});
  return ok_(null,'Logout berhasil.');
}

function authMe_(p) { const user = requireAuth_(p); return ok_({user:safeUser_(user)}); }

function requireSession_(p) {
  const token = sanitize_(p.token,500);
  if (!token) throw new Error('Token diperlukan.');
  const tokenHash = sha256_(token);
  const session = findOne_('Sessions','tokenHash',tokenHash);
  if (!session || !bool_(session.active) || new Date(session.expiresAt).getTime() < Date.now()) throw new Error('Session tidak valid atau sudah kedaluwarsa.');
  return session;
}

function requireAuth_(p) {
  const session = requireSession_(p);
  const user = findOne_('Users','userId',session.userId);
  if (!user || user.status !== 'active') throw new Error('Akun tidak ditemukan atau tidak aktif.');
  return user;
}
function requireAdmin_(p) {
  const user = requireAuth_(p);
  if (!isAdminRole_(String(user.role))) throw new Error('Akses admin ditolak.');
  return user;
}
function safeUser_(user) {
  return {userId:user.userId,name:user.name,email:user.email,role:user.role,status:user.status,balance:money_(user.balance),createdAt:user.createdAt,lastLoginAt:user.lastLoginAt};
}
