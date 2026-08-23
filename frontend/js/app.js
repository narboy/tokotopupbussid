const formatIDR = n => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(Number(n||0));
const esc = s => String(s ?? '').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
function toast(message, type='info') {
  const el = document.createElement('div'); el.className='fixed right-4 top-4 z-[100] rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-3 text-sm text-white shadow-2xl';
  el.innerHTML=`<div class="font-semibold">${esc(type==='success'?'Berhasil':type==='error'?'Gagal':'Info')}</div><div class="mt-1 text-slate-300">${esc(message)}</div>`; document.body.appendChild(el); setTimeout(()=>el.remove(),3000);
}
function nav() {
  const user=currentUser(); const box=document.querySelector('#navAuth'); if(!box) return;
  box.innerHTML = user ? `<a class="btn-secondary" href="dashboard.html">Dashboard</a><button class="btn-primary" onclick="logout()">Logout</button>` : `<a class="btn-secondary" href="login.html">Login</a><a class="btn-primary" href="register.html">Daftar</a>`;
}
function statusBadge(status) {
  const s=String(status); const c=s==='SUCCESS'||s==='PAID'?'emerald':s==='REJECTED'||s==='CANCELLED'?'rose':s==='WAITING_VERIFICATION'||s==='PENDING_PAYMENT'?'amber':'sky';
  return `<span class="rounded-full bg-${c}-400/10 px-2.5 py-1 text-xs font-semibold text-${c}-300">${esc(s)}</span>`;
}
document.addEventListener('DOMContentLoaded', nav);
