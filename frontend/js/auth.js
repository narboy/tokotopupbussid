async function login(identifier, password) {
  const data = await apiRequest('login', { identifier, password });
  setToken(data.session.token);
  localStorage.setItem('ub_user', JSON.stringify(data.user));
  return data.user;
}

async function register(form) { return apiRequest('register', form); }
async function getProfile() { const user = await apiRequest('getProfile', {}); localStorage.setItem('ub_user', JSON.stringify(user)); return user; }
async function logout() { try { await apiRequest('logout'); } finally { setToken(''); localStorage.removeItem('ub_user'); location.href = 'index.html'; } }
function requireLogin() { if (!getToken()) location.href = 'login.html'; }
function currentUser() { try { return JSON.parse(localStorage.getItem('ub_user') || 'null'); } catch (_) { return null; } }
