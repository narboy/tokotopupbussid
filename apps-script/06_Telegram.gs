function sendTelegram_(text) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('TELEGRAM_BOT_TOKEN');
  const chatId = props.getProperty('TELEGRAM_ADMIN_CHAT_ID');
  if (!token || !chatId) return false;
  const url = 'https://api.telegram.org/bot' + encodeURIComponent(token) + '/sendMessage';
  const payload = {chat_id:chatId,text:text,disable_web_page_preview:true};
  try {
    const res = UrlFetchApp.fetch(url,{method:'post',contentType:'application/json',payload:JSON.stringify(payload),muteHttpExceptions:true});
    return res.getResponseCode() >= 200 && res.getResponseCode() < 300;
  } catch(e) { return false; }
}
function notifyAdminNewOrder_(tx) {
  const success = sendTelegram_('🔔 Pesanan Baru\nUser: ' + tx.userEmail + '\nProduk: ' + tx.productName + '\nHarga: Rp' + tx.amount + '\nMetode: ' + tx.paymentMethod + '\nInvoice: ' + tx.transactionId + '\nStatus: Menunggu pembayaran');
  if (success) updateByField_('Transactions','transactionId',tx.transactionId,{telegramNotified:true});
}
function configureTelegram(botToken, chatId) {
  if (!botToken || !chatId) throw new Error('BOT TOKEN dan CHAT ID wajib diisi.');
  PropertiesService.getScriptProperties().setProperties({TELEGRAM_BOT_TOKEN:String(botToken),TELEGRAM_ADMIN_CHAT_ID:String(chatId)},true);
  sendTelegram_('✅ Telegram Bot tersambung ke ' + CONFIG.APP_NAME + '.');
  return ok_(null,'Konfigurasi Telegram tersimpan.');
}
