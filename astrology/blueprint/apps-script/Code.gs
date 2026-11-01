/**
 * 天命藍圖：收名單＋自動寄信（Google Apps Script）
 * 1. 建立一份 Google 試算表 → 擴充功能 → Apps Script → 貼上本檔全部內容。
 * 2. 修改下面三個設定。
 * 3. 部署 → 新增部署作業 → 類型「網頁應用程式」→ 執行身分「我」、存取權「所有人」→ 部署。
 * 4. 把產生的網址（/exec 結尾）貼到網站的 assets/config.js 的 appsScriptUrl。
 */
const SENDER_NAME = 'Willy.co';                 // 寄件人顯示名稱
const REPLY_TO = '';                            // 回覆信箱（留空＝你的 Gmail）
const SHEET_ID = '';                            // 名單試算表的 ID（留空＝使用綁定的試算表）
const SITE_ORIGIN = 'https://hss84066-pixel.github.io/my-landing-pages/astrology/blueprint/'; // 網站網址（已填好）

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    const email = String(p.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ ok: false, error: 'email' });
    if (!p.code || String(p.code).length > 2000) return json({ ok: false, error: 'code' });
    const base = SITE_ORIGIN || String(p.link || '').replace(/report\.html#.*$/, '');
    if (!/^https:\/\//.test(base)) return json({ ok: false, error: 'link' });
    const link = base + 'report.html#' + p.code;
    const name = String(p.name || '').slice(0, 20);

    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('名單') || ss.insertSheet('名單');
    if (sheet.getLastRow() === 0) sheet.appendRow(['時間', '名字', 'Email', '出生日期', '出生時間', '出生地', '同意', '報告連結']);
    sheet.appendRow([new Date(), name, email, p.birth || '', p.time || '', p.city || '', p.consent ? '是' : '否', link]);
    lock.releaseLock();

    MailApp.sendEmail({
      to: email,
      subject: (name ? name + '，' : '') + '你的天命藍圖已完成',
      name: SENDER_NAME,
      replyTo: REPLY_TO || undefined,
      htmlBody: mailHtml(name, link)
    });
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() { return json({ ok: true, service: 'celestial-blueprint' }); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function mailHtml(name, link) {
  const n = name ? escapeHtml(name) : '你';
  return '<div style="background:#0a0e1d;padding:32px 16px;font-family:\'Noto Sans TC\',\'PingFang TC\',\'Microsoft JhengHei\',sans-serif;">' +
    '<div style="max-width:520px;margin:0 auto;background:#11162b;border:1px solid #2c3557;border-top:3px solid #c8a35f;border-radius:8px;padding:32px 28px;color:#e6e9f2;">' +
    '<p style="margin:0 0 6px;color:#86cfe0;font-size:13px;letter-spacing:.2em;">占星本命盤 × 人類圖</p>' +
    '<h1 style="margin:0 0 18px;font-size:28px;line-height:1.3;">' + n + '的天命藍圖已完成</h1>' +
    '<p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#b3bad2;">依照你提供的出生時間與地點，我們算出了你的本命星盤與人類圖，整理成 6 頁的解讀。點下面的按鈕就能閱讀，也可以存成 PDF 保存。</p>' +
    '<p style="margin:0 0 26px;"><a href="' + link + '" style="display:inline-block;background:#c8a35f;color:#11162b;text-decoration:none;font-weight:700;padding:13px 26px;border-radius:6px;">開啟我的天命藍圖</a></p>' +
    '<p style="margin:0;font-size:12px;line-height:1.7;color:#7f89aa;">如果按鈕沒有反應，請複製這個連結到瀏覽器：<br><span style="word-break:break-all;color:#9aa3bf;">' + link + '</span></p>' +
    '</div><p style="text-align:center;margin:16px 0 0;font-size:12px;color:#7f89aa;">' + escapeHtml(SENDER_NAME) + '　·　不想再收到信件，直接回覆這封信告訴我們即可。</p></div>';
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
