/* 天命藍圖：網站設定。上線前只需要修改這個檔案。 */
window.BLUEPRINT_CONFIG = {
  brand: 'Willy.co',                 // 報告與信件上的品牌名稱
  reader: 'Willy.co · @willy.monetize', // 封面「解讀者」欄位

  // 部署 Google Apps Script 後，把網頁應用程式網址貼在這裡（以 /exec 結尾）。
  // 留空時是「測試模式」：送出後直接開啟報告，不會寄信、不會記錄名單。
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycby8Mo8WZlJy341JYR67On5z7y8z--lP4w7_IQMswbEsTNli-eyp1ZrHwh3-J-ohrPceeg/exec',

  // 第 6 頁的兩個升級方案。url 留空時，按鈕會顯示「即將開放」。
  upgrade: {
    title: '完整版天命藍圖',
    price: 'NT$899',                 // 留空＝不顯示價格
    url: 'https://lin.ee/PMhYd4e',   // 官方 LINE
    cta: '加 LINE 索取完整版',
    keyword: '完整版',               // 請對方在 LINE 輸入的關鍵字
    desc: '，就可以加購完整版，更了解自己未來半年到一年的狀況。'
  },
  consult: {
    title: '一對一解讀諮詢',
    price: '',
    url: 'https://lin.ee/PMhYd4e',   // 官方 LINE
    cta: '加 LINE 預約諮詢',
    keyword: '諮詢',
    desc: '，會有專人協助你。'
  }
};
