/* 天命藍圖：網站設定。上線前只需要修改這個檔案。 */
window.BLUEPRINT_CONFIG = {
  brand: 'Willy.co',                 // 報告與信件上的品牌名稱
  reader: 'Willy.co · @willy.monetize', // 封面「解讀者」欄位

  // 部署 Google Apps Script 後，把網頁應用程式網址貼在這裡（以 /exec 結尾）。
  // 留空時是「測試模式」：送出後直接開啟報告，不會寄信、不會記錄名單。
  appsScriptUrl: '',

  // 第 6 頁的兩個升級方案。url 留空時，按鈕會顯示「即將開放」。
  upgrade: {
    title: '完整版天命藍圖',
    price: '',                       // 例如 'NT$ 1,980'
    url: '',                         // 付款或購買頁連結
    points: ['21 頁完整解讀與 PDF', '星盤 × 人類圖合成對照輪', '未來一年：愛情、事業、人際、家庭、身心', '90 天實踐計畫與年度關鍵日期']
  },
  consult: {
    title: '一對一解讀諮詢',
    price: '',                       // 例如 'NT$ 3,600／60 分鐘'
    url: '',                         // 預約表單、LINE 或 Skool 連結
    points: ['由解讀師親自帶你看懂自己的盤', '針對你現在卡住的問題給具體建議', '含完整版天命藍圖']
  }
};
