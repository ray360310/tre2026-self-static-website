# TRE2026 Candidate Entries Design

## Goal

新增「預選活動」功能，讓使用者可以把尚未購買、但想買的官方活動先存起來，並在 tab2 的三日月曆中直接觀察它和已購活動、金卡、白銀卡權益的重疊情況。

## Confirmed Scope

- 預選活動只從 `tab3` 官方活動加入
- 不做手動新增預選活動
- 不因衝突而阻擋儲存
- 預選活動與已購活動分開保存
- `tab1` 顯示兩區：
  - 已購活動
  - 預選活動
- `tab2` 同時顯示：
  - 已購活動
  - 預選活動
  - 金卡/白銀卡權益

## Recommended Approach

沿用既有 local storage 結構，擴充為兩份活動清單：

- `purchasedEntries`
- `candidateEntries`

兩者欄位結構一致，方便 tab1/tab2/tab3 共用同一套表單、排序與日曆 view model。差異只在用途與視覺樣式。

## Data Model

將目前的 `PurchasedScheduleEntry` 泛化成可同時表示已購與預選的使用者行程項目，並透過所在陣列區分用途。

保留欄位：

- `id`
- `sourceType`
- `officialEventId`
- `officialEventTitle`
- `selectionLabel`
- `date`
- `start`
- `end`
- `vendorName`
- `peopleNames`
- `notes`
- `sourceUrl`

`UserScheduleRecord` 改為：

- `purchasedEntries`
- `candidateEntries`
- `updatedAt`

## Tab Behavior

### Tab3

每個官方活動展開後增加兩種儲存方式：

- `加入已購`
- `加入預選`

若該活動已存在對應清單中，則改顯示：

- `移出已購`
- `移出預選`

表單輸入共用同一份人物/方案/日期/時間/備註欄位。

### Tab1

改成兩個區塊：

- `我的已購活動`
- `我的預選活動`

兩區都依時間排序，卡片格式一致，但預選活動用不同 badge 標記。

### Tab2

三日月曆需同時顯示三種 block：

- 已購活動
- 預選活動
- 權益活動

視覺區分：

- 已購：深色
- 預選：紫紅或橘色系
- 權益：金卡/白銀卡維持現有淺色

衝突標示：

- 預選撞到已購：顯示 `撞到已購`
- 預選撞到金卡：顯示 `撞到金卡`
- 預選撞到白銀卡：顯示 `撞到白銀卡`
- 若多重重疊，全部列出

### Detail Panel

點選預選活動時，詳情面板除了原本活動資訊，還要列出它重疊到哪些安排。

## Conflict Rules

衝突系統只做觀察，不做限制：

- 預選活動可以永遠加入成功
- 即使和已購或權益重疊，也不阻擋
- 衝突資訊只用於 tab2 可視化與詳情說明

## Testing Strategy

至少覆蓋：

- local storage 可保存與移除 `candidateEntries`
- tab3 可加入與移出預選
- tab1 正確分區顯示已購/預選
- tab2 正確渲染預選活動
- 預選活動重疊時會顯示對應標記
- 預選活動可在重疊情況下正常儲存

## Recommendation

這一版先不要加入「預選轉已購」快捷操作。先把加入、刪除、顯示、衝突觀察做好，能最快滿足你目前臨近活動前的排程判斷需求。
