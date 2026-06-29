# TRE2026 User Schedule Local Storage Design

## Goal

讓使用者在純瀏覽器版網站中維護自己的已購活動，不需要登入、不需要後端、不需要 App 安裝。使用者從 tab3 將官方活動加入自己的已購清單，網站在開啟時自動從瀏覽器本機儲存讀取這份資料，並在 tab1 與 tab2 顯示。

## Confirmed Scope

- 平台型態：純瀏覽器版靜態網站
- 使用者資料保存：單機單瀏覽器，不做跨裝置同步
- tab1：單一時間排序的已購活動清單
- tab2：`7/3`、`7/4`、`7/5` 的日行程視圖
- tab3：官方活動列表，可加入或移出已購活動
- 資料來源：以 tab3 官方活動為主
- 手動新增：資料模型預留，但第一版不是主流程
- 規則呈現方式：半整理
- 第一波規則優先整理：
  - TRE 金卡
  - TRE 白銀卡
  - 小花暖 白金互動
  - 雛乃花音相關活動
  - 野人文庫下的月野霞活動

## Recommended Approach

採用「官方資料唯讀 + 使用者選取結果本機保存」的雙層架構：

- 官方活動資料持續來自 repo 內靜態 JSON
- 使用者自己的資料只保存活動 ID 清單與少量狀態欄位
- 頁面載入時，將本機儲存資料與官方活動資料做 join，生成 tab1/tab2 所需 view model

這個方案最符合目前的部署模式，且不依賴伺服器或手機原生能力。

## Architecture

### 1. Official Data Layer

延用現有官方活動資料：

- `src/data/official-events.json`
- `src/data/official-people.json`
- `src/lib/loadData.ts`

此層只負責提供唯讀官方活動資訊，不直接保存使用者行為。

### 2. User Schedule Storage Layer

新增一層瀏覽器本機儲存，例如 `localStorage`：

```json
{
  "version": 1,
  "purchasedOfficialEventIds": ["jkface-event-315", "jkface-event-333"],
  "manualEntries": [],
  "updatedAt": "2026-06-30T12:00:00+08:00"
}
```

設計原則：

- 第一版主資料只保存 `purchasedOfficialEventIds`
- `manualEntries` 預留結構，未來可擴充
- `version` 用來支援之後 schema 升級
- `updatedAt` 方便除錯與未來備份功能

### 3. Derived View-Model Layer

頁面啟動時：

1. 讀官方活動資料
2. 讀本機使用者資料
3. 將 `purchasedOfficialEventIds` 對應回官方活動
4. 生成：
   - tab1 已購活動排序清單
   - tab2 三日日程區塊
   - tab3 每筆活動的已購狀態

## Tab Design

### Tab1: 我的已購活動

目標是「快速確認自己已買了哪些活動」。

顯示方式：

- 單一清單
- 依 `日期 -> 開始時間 -> 標題` 排序
- 每筆卡片顯示：
  - 活動名稱
  - 日期時間
  - 廠商
  - 人員
  - 規則摘要
  - 原始活動連結

規則摘要若有整理結果，顯示固定欄位：

- 報到時間
- 是否含門票
- 是否可退票
- 活動地點
- 注意事項

若沒有整理結果，則顯示：

- 官方全文摘要
- 詳細圖片入口

### Tab2: 三日日程圖

目標是「看這三天時間上排了哪些事情」。

顯示方式：

- 以 `7/3`、`7/4`、`7/5` 分三區
- 每天顯示時間軸
- 內容包含：
  - 使用者已購官方活動
  - 主辦方固定權益時段區塊

固定權益區塊第一版先支援：

- TRE 金卡
- TRE 白銀卡

這些區塊會和一般活動以不同視覺樣式呈現，方便辨識主辦方權益對其他活動的影響。

### Tab3: 官方活動列表

tab3 保留目前的官方活動列表與展開內容設計，新增「已購狀態操作」：

- 未加入時：`加入已購`
- 已加入時：`移出已購`

點擊時即更新本機儲存，並同步影響 tab1/tab2。

## Rules Summarization Strategy

### Structured Rule Summary

新增一份規則摘要資料層，優先只處理使用者指定的重點活動。

建議結構：

```json
{
  "eventId": "jkface-event-315",
  "checkInRule": "活動開始前 30 分鐘報到",
  "includesAdmission": false,
  "refundRule": "活動開演二十日前可退票，收 10% 手續費；二十日內不可退票",
  "locationRule": "台北南港展覽館2館1樓 A32 A33",
  "notes": [
    "使用 Face 會員 QRCode 報到不可截圖",
    "建議提前購買紅鑽"
  ]
}
```

來源可以是：

- 從官方全文抽取
- 人工補寫
- 從詳細圖片或文字中人工確認後寫入

### Fallback

若某活動沒有結構化規則摘要：

- 不阻擋加入已購
- tab1/tab2 仍可正常顯示活動
- 規則區退回官方全文與詳細圖片

這能避免因為規則整理未完成而讓主流程不可用。

## Error Handling

- `localStorage` 沒資料：視為空行程
- `localStorage` 資料損壞：清空並回退預設值
- 本機已購 ID 找不到對應官方活動：
  - 自動忽略該 ID
  - 保留其他有效資料
- 規則摘要缺漏：退回官方全文顯示

## Testing Strategy

至少要覆蓋：

- 本機儲存讀寫與 schema 容錯
- tab3 加入 / 移出已購
- tab1 正確依時間排序
- tab2 正確分配到 `7/3`、`7/4`、`7/5`
- 重點活動規則摘要正確顯示
- 找不到摘要時退回全文顯示

## Phased Delivery

### Phase 1

- local storage 資料層
- tab3 已購切換
- tab1 已購清單

### Phase 2

- tab2 三日日程圖
- 金卡 / 白銀卡固定權益區塊

### Phase 3

- 重點活動規則摘要
- 規則 fallback 與細節打磨

## Recommendation

先做 Phase 1 + Phase 2 的主流程，再補你指定的規則摘要。原因是：

- 你現在最需要的是能快速維護已購清單
- 日程圖能立即支援活動前的行程確認
- 規則整理可以優先補你真正會參加的幾個活動，不必一次整理全站
