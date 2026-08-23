async function loadProducts(targetId='productGrid') {
  const el=document.getElementById(targetId); if(!el) return;
  try {
    const products=await apiRequest('getProducts',{},'GET');
    el.innerHTML=products.length?products.map(p=>`<div class="card"><div class="text-sm text-sky-300">${esc(p.game)}</div><div class="mt-2 text-2xl font-bold">${Number(p.coin).toLocaleString('id-ID')} Koin</div><div class="mt-2 text-slate-300">${formatIDR(p.price)}</div><a class="btn-primary mt-5 w-full text-center" href="topup.html?product=${encodeURIComponent(p.product_id)}">Top Up</a></div>`).join(''):`<div class="col-span-full card text-slate-400">Belum ada produk aktif.</div>`;
  } catch(e) { el.innerHTML=`<div class="col-span-full card text-rose-300">${esc(e.message)}</div>`; }
}
