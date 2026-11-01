# 天命藍圖：免費報告網站

訪客填寫姓名、出生資料與 Email → 名單自動存進你的 Google 試算表 → 系統寄出專屬報告連結 → 對方打開即可看到 6 頁的星盤 × 人類圖解讀（觀測站版），最後一頁引導升級完整版或預約諮詢。

全部免費：網站放在 GitHub Pages，名單與寄信使用你自己的 Google 帳號。

---

## 上線步驟（約 20 分鐘）

### 一、把網站放上 GitHub Pages
1. 登入 GitHub → 右上角「＋」→ **New repository**，名稱例如 `blueprint`，設為 **Public** → Create。
2. 進入新的 repository → **Add file → Upload files**，把這個資料夾裡的所有檔案與資料夾（`index.html`、`report.html`、`assets`、`vendor`、`apps-script`、`README.md`）拖進去 → **Commit changes**。
3. **Settings → Pages** → Source 選 **Deploy from a branch**，Branch 選 `main`、資料夾 `/ (root)` → Save。
4. 約 1–2 分鐘後，網站網址會是：`https://你的帳號.github.io/blueprint/`

> 這時網站已經能用，但處於「測試模式」：送出後直接打開報告，不會寄信、不會存名單。

### 二、建立名單試算表與自動寄信（Google Apps Script）
1. 到 Google 雲端硬碟 → 新增 **Google 試算表**，命名例如「天命藍圖名單」。
2. 試算表上方 **擴充功能 → Apps Script**。
3. 刪掉預設內容，把 `apps-script/Code.gs` 的全部內容貼上。
4. 修改最上面三個設定：
   - `SENDER_NAME`：寄件人名稱，例如 `Willy.co`
   - `REPLY_TO`：回覆信箱（可留空）
   - `SITE_ORIGIN`：你的網站網址，例如 `https://你的帳號.github.io/blueprint/`（結尾要有 `/`）
5. 右上角 **部署 → 新增部署作業** → 齒輪選 **網頁應用程式**
   - 執行身分：**我**
   - 誰可以存取：**所有人**
6. 按「部署」，第一次會要求授權（選你的帳號 → 進階 → 前往專案 → 允許）。
7. 複製「網頁應用程式網址」（以 `/exec` 結尾）。

### 三、把網址填進網站設定
1. 在 GitHub 打開 `assets/config.js` → 鉛筆圖示編輯。
2. 把剛剛的網址貼到 `appsScriptUrl: ''` 的引號中。
3. 順便填好升級方案：
   - `upgrade.price`、`upgrade.url`：完整版的價格與付款／購買頁連結
   - `consult.price`、`consult.url`：諮詢的價格與預約連結（LINE、表單、Skool 都可以）
   - 連結留空時，按鈕會顯示「即將開放」
4. **Commit changes**，等 1 分鐘後重新整理網站，用自己的 Email 測試一次。

---

## 需要知道的事
- **寄信數量**：一般 Gmail 帳號每天約可寄 100 封、Google Workspace 約 1,500 封。名單變多時，可以改接 MailerLite、Brevo 等寄信服務。
- **名單位置**：所有填寫資料都在你的 Google 試算表「名單」分頁，可以直接匯出。
- **修改解讀文字**：所有文字都在 `assets/texts.js`，改完 Commit 就會生效。
- **計算精度**：行星位置使用 Astronomy Engine（MIT 授權，可商用），與 Swiss Ephemeris 比對誤差小於 0.05°；宮位為 Placidus；時區與夏令時間依出生地自動換算。
- **個資**：表單已附同意勾選。若有人要求刪除資料，直接刪除試算表中的那一列即可。
- **連結機制**：報告內容由連結中的出生資料即時計算，不會存在網站上；懂技術的人可能繞過 Email 直接產生報告，對名單磁鐵來說屬於可接受的風險。
