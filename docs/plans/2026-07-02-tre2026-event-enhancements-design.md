# TRE2026 Event Enhancements Design

## Goal

為指定的 TRE2026 官方活動建立可人工維護的結構化補充資料，讓 `tab3` 可以從「人物 → 方案 → 場次」逐步選擇，並在選定場次後自動帶入日期、開始時間、結束時間，同時顯示服裝與方案資訊。

## Confirmed Scope

- 採用通用框架，但第一批只處理指定活動
- 場次、服裝資訊可以來自文案或圖片人工整理
- 不修改現有官方同步資料的核心流程
- 有補充資料的活動啟用進階選單
- 沒有補充資料的活動維持現有自由輸入模式

第一批活動：

- `TRE AV CULT粉絲見面會`
- `UR AV ★情慾天國 PARADISE OF DESIRE ★`
- `「職業痴女誘惑：交給專業的來！」—— 西野繪美 x 碧那美海`
- `AVWAY Dream Box`
- `訂閱平台 Fantrie。與韓國 No.1 知名創作者們在TRE現場直接互動並親身體驗吧！`
- `KMP×六大金釵×TRE粉絲活動 - 彌生美月・羽月乃蒼・虹村由美・胡桃櫻・櫻由乃・小野寺舞`

## Recommended Approach

新增獨立的 `event-enhancements.json` 作為人工補充資料層，用 `officialEventId` 關聯既有 `official-events.json`。`tab3` 渲染時先查是否存在 enhancement；若存在，就使用結構化方案與場次資料驅動 UI；若不存在，則退回現有的手動輸入模式。

這樣可以把「同步抓下來的原始資料」與「人工整理的高精度資料」分開管理，避免之後重跑同步時覆蓋人工補充內容。

## Alternatives Considered

### 1. 直接把補充欄位寫入 `official-events.json`

優點：

- 檔案少一個
- 載入邏輯較直觀

缺點：

- 原始資料與人工資料混雜
- 之後重跑同步時容易被覆蓋或產生 merge 噪音

### 2. 另外建立 `event-enhancements.json` 並在前端合併

優點：

- 資料責任清楚
- 易於逐步擴充
- 只需對少數活動補資料

缺點：

- 需要多一層載入與合併邏輯

### 3. 直接從文案與圖片全自動抽取

優點：

- 理論上人工維護較少

缺點：

- 準確率不穩
- 圖片內場次與服裝資訊解析風險高
- 不適合活動前最後幾天使用

## Data Model

新增補充資料檔，概念上如下：

```json
{
  "officialEventId": "jkface-event-647",
  "profiles": [
    {
      "personName": "倉本堇",
      "plans": [
        {
          "planCode": "A",
          "planName": "白羽聖域",
          "priceLabel": "25,000紅鑽",
          "summary": "拍立得合照 1 張、手機合照 2 次、寫真攝影 15 秒",
          "outfit": null,
          "sessions": [
            {
              "sessionId": "kuramoto-a-20260703-1",
              "date": "2026/07/03",
              "start": "13:30",
              "end": "14:10",
              "label": "7/3 第1場",
              "outfit": "白色比基尼",
              "notes": "圖片整理",
              "sourceType": "image"
            }
          ]
        }
      ]
    }
  ]
}
```

必要支援：

- 每個活動可以有多位人物
- 每位人物可以有多個方案
- 每個方案可以有多個場次
- 服裝可以放在方案層或場次層
- 備註可標記來源是文案或圖片
- 某些活動可支援共用方案或全員方案

## UI Behavior

### Activities With Enhancements

在 `tab3` 展開活動後，表單改成：

1. 選擇活動人物
2. 選擇方案
3. 若該方案有多場次，再選擇場次

當選定場次後：

- 自動帶入日期
- 自動帶入開始時間
- 自動帶入結束時間
- 顯示服裝資訊
- 顯示價格與方案摘要

若某方案只有單一場次，則不顯示場次選單，直接自動帶入時間。

### Activities Without Enhancements

維持現有流程：

- 人物可手選
- 方案可手選或輸入其他
- 日期與時間仍可手動輸入

## Save Behavior

儲存到已購或預選時仍沿用現有 `UserScheduleEntry`。

新增 enhancement 後只影響表單來源，不改動最終儲存格式。這樣 `tab1`、`tab2` 與 local storage 不需要做結構性重寫。

## Parsing and Authoring Strategy

第一批資料採人工整理：

- 優先從 `fullContent` 抽人物、方案、價格與說明
- 若場次或服裝只出現在圖片，則直接人工整理寫入 enhancement 檔
- 不依賴 OCR 自動流程作為主路徑

之後若需要加速，可再補腳本協助從文案提取初稿，但資料最終仍以人工校正為準。

## Testing Strategy

至少覆蓋：

- enhancement 資料可正確載入
- 有 enhancement 的活動會顯示人物/方案/場次流程
- 選方案與場次後自動帶入日期與時間
- 服裝與方案摘要會顯示
- 沒有 enhancement 的活動仍維持原本自由輸入
- 已購與預選儲存流程不因 enhancement 而破壞

## Risks

- 某些活動圖片中的場次資訊可能不完整，需要接受部分活動只先整理到方案層
- 同一活動的人物與方案關係可能不是一對一，需要資料格式能表達共用方案
- 若日後官方文案更新，人工補充資料可能需要同步調整

## Recommendation

先完成框架與第一批活動的人工補充資料，讓高需求活動先可用。不要現在追求全量自動化，避免在活動前引入不可靠的解析結果。
