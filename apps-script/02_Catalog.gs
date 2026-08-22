function getProducts_(p) {
  const rows = rows_('Products').filter(function(x){ return bool_(x.active); }).map(productPublic_);
  return ok_(rows);
}
function getProduct_(p) {
  requireFields_(p,['productId']);
  const row = findOne_('Products','productId',p.productId);
  if (!row || !bool_(row.active)) throw new Error('Produk tidak tersedia.');
  return ok_(productPublic_(row));
}
function productPublic_(p) {
  return {productId:p.productId,game:p.game,name:p.name,coins:Number(p.coins)||0,price:money_(p.price),description:p.description||'',imageUrl:p.imageUrl||'',active:bool_(p.active)};
}

function getPromotions_(p) {
  const now = Date.now();
  const rows = rows_('Promotions').filter(function(x){
    const active = bool_(x.active);
    const start = new Date(x.startAt).getTime();
    const end = new Date(x.endAt).getTime();
    return active && (!start || start <= now) && (!end || end >= now);
  }).map(function(x){ return {promoId:x.promoId,title:x.title,description:x.description,bannerUrl:x.bannerUrl,discountType:x.discountType,discountValue:money_(x.discountValue),startAt:x.startAt,endAt:x.endAt,active:bool_(x.active)}; });
  return ok_(rows);
}
