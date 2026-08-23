const API_URL = 'https://script.google.com/macros/s/AKfycbzkycHTygKrJH-Xkz_swkxrFf7iDR27fsreuPM0M9RccaWfjXb5a5s8C2HXvRe0doRfTw/exec'; // WAJIB DIGANTI

function getToken() { return localStorage.getItem('ub_token') || ''; }
function setToken(token) { if (token) localStorage.setItem('ub_token', token); else localStorage.removeItem('ub_token'); }

async function apiRequest(action, data = {}, method = 'POST') {
  const payload = { action, ...data };
  if (getToken()) payload.token = getToken();
  const url = API_URL;
  if (!url || url.includes('GANTI_DENGAN')) throw new Error('API_URL belum dikonfigurasi.');
  const options = { method, headers: { 'Content-Type': 'text/plain;charset=utf-8' } };
  if (method !== 'GET') options.body = JSON.stringify(payload);
  const response = await fetch(method === 'GET' ? `${url}?action=${encodeURIComponent(action)}` : url, options);
  const result = await response.json();
  if (!result.success) throw new Error(result.message || 'Request gagal.');
  return result.data;
}
