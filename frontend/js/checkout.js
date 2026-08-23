let checkoutProducts=[]; let selectedProduct=null; let promos=[]; let payments=[]; let orderDraft=null;
async function initCheckout() {
  requireLogin();
  checkoutProducts=await apiRequest('getProducts',{},'GET'); promos=await apiRequest('getPromos',{},'GET'); payments=await apiRequest('getPayments',{},'GET');
  const pid=new URLSearchParams(location.search).get('product'); selectedProduct=checkoutProducts.find(p=>p.product_id===pid)||checkoutProducts[0];
  renderCheckout();
}
function renderCheckout(){
  document.querySelector('#productName').textContent=`${selectedProduct.game} • ${Number(selectedProduct.coin).toLocaleString('id-ID')} Koin`;
  document.querySelector('#productPrice').textContent=formatIDR(selectedProduct.price);
  const select=document.querySelector('#paymentMethod'); select.innerHTML=payments.map(p=>`<option value="${esc(p.payment_id)}">${esc(p.category)} - ${esc(p.name)}</option>`).join('');
}
function calculateCheckout(){
  const code=document.querySelector('#promoCode').value.trim().toUpperCase(); const promo=promos.find(p=>String(p.promo_code).toUpperCase()===code); let discount=0;
  if(promo){ const valid=(Number(selectedProduct.price)>=Number(promo.minimum_purchase||0)); if(valid){ discount=String(promo.discount_type).toUpperCase()==='PERCENTAGE'?selectedProduct.price*Number(promo.discount_value)/100:Number(promo.discount_value); if(promo.maximum_discount) discount=Math.min(discount,Number(promo.maximum_discount)); } }
  discount=Math.min(discount,Number(selectedProduct.price)); document.querySelector('#discount').textContent='- '+formatIDR(discount); document.querySelector('#total').textContent=formatIDR(selectedProduct.price-discount); return {code,discount,total:selectedProduct.price-discount};
}
async function createCheckoutOrder(){
  try{ const c=calculateCheckout(); orderDraft=await apiRequest('createOrder',{product_id:selectedProduct.product_id,player_id:document.querySelector('#playerId').value.trim(),promo_code:c.code,payment_method:document.querySelector('#paymentMethod').value,payment_type:document.querySelector('#paymentMethod').selectedOptions[0]?.text||''}); localStorage.setItem('ub_last_order',JSON.stringify(orderDraft)); location.href=`checkout.html?order=${encodeURIComponent(orderDraft.order_id)}`; }catch(e){toast(e.message,'error');}
}
async function loadOrderCheckout(){
  requireLogin(); const id=new URLSearchParams(location.search).get('order'); if(!id) return; const order=await apiRequest('getOrderDetail',{order_id:id}); const p=await apiRequest('getPayments',{},'GET'); const payment=p.find(x=>x.payment_id===order.payment_method); document.querySelector('#orderDetail').innerHTML=`<div class="card"><div class="flex items-center justify-between"><div><div class="text-sm text-slate-400">Order ID</div><div class="font-bold">${esc(order.order_id)}</div></div>${statusBadge(order.status)}</div><div class="mt-4 grid gap-3 sm:grid-cols-2"><div>Game<br><b>${esc(order.game)}</b></div><div>Koin<br><b>${Number(order.coin).toLocaleString('id-ID')}</b></div><div>Total<br><b>${formatIDR(order.total_price)}</b></div><div>Pembayaran<br><b>${esc(payment?.name||order.payment_method)}</b></div></div></div>`; if(payment) document.querySelector('#paymentInfo').innerHTML=`<div class="card"><h3 class="font-semibold">Instruksi Pembayaran</h3><div class="mt-3 text-slate-300">${esc(payment.instructions||'')}</div>${payment.image_url?`<img class="mt-4 max-h-72 rounded-xl" src="${esc(payment.image_url)}" alt="Pembayaran">`:''}<div class="mt-4"><b>${esc(payment.account_number||'')}</b><div class="text-slate-400">${esc(payment.account_name||'')}</div></div></div>`; document.querySelector('#orderId').value=id;
}
async function uploadProof(){try{const file=document.querySelector('#proof').files[0]; if(!file) throw new Error('Pilih bukti pembayaran.'); if(file.size>5*1024*1024) throw new Error('Maksimal 5 MB.'); const reader=new FileReader(); reader.onload=async()=>{const base64=reader.result; await apiRequest('uploadPaymentProof',{order_id:document.querySelector('#orderId').value,fileName:file.name,mimeType:file.type,base64});toast('Bukti pembayaran berhasil diupload.','success');loadOrderCheckout();}; reader.readAsDataURL(file);}catch(e){toast(e.message,'error');}}
