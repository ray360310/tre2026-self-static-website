# TRE2026 User Schedule Local Storage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add browser-local purchased schedule management so users can mark official events from tab3, review them in tab1, and view them on a three-day schedule in tab2.

**Architecture:** Keep official JKFace activity data read-only, add a separate browser storage layer for user-selected purchased event IDs, and derive tab1/tab2 view models by joining local selections with official event data. Add structured rule summaries for a small set of priority activities with fallback to official full content.

**Tech Stack:** React 19, TypeScript, localStorage, existing static JSON data layer, Vitest, Testing Library

---

### Task 1: Define local user schedule schema

**Files:**
- Create: `src/types/userSchedule.ts`
- Create: `src/lib/userScheduleStorage.ts`
- Test: `src/lib/__tests__/userScheduleStorage.test.ts`

**Step 1: Write the failing test**

- Add tests for:
  - default empty schedule when local storage has no data
  - valid schedule parsing
  - corrupted storage fallback
  - add/remove purchased event ID

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/userScheduleStorage.test.ts`

**Step 3: Write minimal implementation**

- Define:
  - `UserScheduleRecord`
  - `ManualScheduleEntry`
- Implement:
  - `loadUserSchedule()`
  - `saveUserSchedule()`
  - `togglePurchasedOfficialEventId()`

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/userScheduleStorage.test.ts`

**Step 5: Commit**

```bash
git add src/types/userSchedule.ts src/lib/userScheduleStorage.ts src/lib/__tests__/userScheduleStorage.test.ts
git commit -m "feat: add browser schedule storage"
```

### Task 2: Add app-level user schedule state

**Files:**
- Modify: `src/App.tsx`
- Test: `src/App.tsx` through feature tests rather than direct unit tests

**Step 1: Write the failing test**

- Extend feature tests so tabs react to purchased state changes

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 3: Write minimal implementation**

- Load schedule state on app start
- Keep it in React state
- Pass purchased state and mutators into tab1/tab2/tab3

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire app user schedule state"
```

### Task 3: Add tab3 purchased toggle UI

**Files:**
- Modify: `src/features/event-catalog/EventCatalogTab.tsx`
- Modify: `src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 1: Write the failing test**

- Add tests for:
  - `加入已購`
  - `移出已購`
  - button label reflects current state

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 3: Write minimal implementation**

- Add purchased status indicator to each official event card
- Add toggle button
- Call app-level schedule mutator

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 5: Commit**

```bash
git add src/features/event-catalog/EventCatalogTab.tsx src/features/event-catalog/__tests__/EventCatalogTab.test.tsx
git commit -m "feat: add purchased event toggle in tab3"
```

### Task 4: Build purchased-event view model for tab1

**Files:**
- Create: `src/lib/userScheduleViewModel.ts`
- Test: `src/lib/__tests__/userScheduleViewModel.test.ts`

**Step 1: Write the failing test**

- Add tests for:
  - resolving purchased official event IDs
  - sorting by date and time
  - ignoring unknown IDs safely

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/userScheduleViewModel.test.ts`

**Step 3: Write minimal implementation**

- Create helpers that:
  - map purchased IDs to official event records
  - sort them
  - expose tab1-ready objects

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/userScheduleViewModel.test.ts`

**Step 5: Commit**

```bash
git add src/lib/userScheduleViewModel.ts src/lib/__tests__/userScheduleViewModel.test.ts
git commit -m "feat: add purchased schedule view model"
```

### Task 5: Replace tab1 with purchased schedule list

**Files:**
- Modify: `src/features/my-schedule/MyScheduleTab.tsx`
- Create: `src/features/my-schedule/__tests__/MyScheduleTab.test.tsx`

**Step 1: Write the failing test**

- Add tests for:
  - empty purchased list state
  - time-sorted purchased list
  - purchased activity card content

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/my-schedule/__tests__/MyScheduleTab.test.tsx`

**Step 3: Write minimal implementation**

- Replace current static my-plan driven list with local purchased schedule list
- Keep UI focused on:
  - title
  - date/time
  - vendor
  - people
  - rule summary or fallback

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/my-schedule/__tests__/MyScheduleTab.test.tsx`

**Step 5: Commit**

```bash
git add src/features/my-schedule/MyScheduleTab.tsx src/features/my-schedule/__tests__/MyScheduleTab.test.tsx
git commit -m "feat: show purchased activities in tab1"
```

### Task 6: Add structured rule summary data

**Files:**
- Create: `src/data/official-event-rule-summaries.json`
- Create: `src/types/officialRuleSummary.ts`
- Modify: `src/lib/loadData.ts`
- Test: `src/lib/__tests__/officialRuleSummaryLoad.test.ts`

**Step 1: Write the failing test**

- Add tests for loading summaries
- Validate required fields

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/officialRuleSummaryLoad.test.ts`

**Step 3: Write minimal implementation**

- Add summary schema and loader
- Seed summaries for:
  - TRE 金卡
  - TRE 白銀卡
  - 小花暖 白金互動
  - 雛乃花音活動
  - 野人文庫月野霞活動

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/officialRuleSummaryLoad.test.ts`

**Step 5: Commit**

```bash
git add src/data/official-event-rule-summaries.json src/types/officialRuleSummary.ts src/lib/loadData.ts src/lib/__tests__/officialRuleSummaryLoad.test.ts
git commit -m "feat: add priority event rule summaries"
```

### Task 7: Attach rule summaries to tab1 cards with fallback

**Files:**
- Modify: `src/features/my-schedule/MyScheduleTab.tsx`
- Modify: `src/features/my-schedule/__tests__/MyScheduleTab.test.tsx`

**Step 1: Write the failing test**

- Add tests for:
  - rendering structured summary when present
  - rendering official full content fallback when absent

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/my-schedule/__tests__/MyScheduleTab.test.tsx`

**Step 3: Write minimal implementation**

- Render summary fields in a compact rule panel
- Fallback to official content snippet and source link

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/my-schedule/__tests__/MyScheduleTab.test.tsx`

**Step 5: Commit**

```bash
git add src/features/my-schedule/MyScheduleTab.tsx src/features/my-schedule/__tests__/MyScheduleTab.test.tsx
git commit -m "feat: add rule summaries to tab1"
```

### Task 8: Build tab2 three-day schedule model

**Files:**
- Modify: `src/features/conflict-analysis/ConflictAnalysisTab.tsx`
- Create: `src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`
- Modify or create helper under: `src/lib/userScheduleViewModel.ts`

**Step 1: Write the failing test**

- Add tests for:
  - distributing purchased events to `7/3`, `7/4`, `7/5`
  - showing empty slots when none exist
  - including fixed organizer benefit blocks

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 3: Write minimal implementation**

- Replace current conflict-analysis emphasis with daily schedule view
- Group events by day
- Render organizer benefit blocks for gold and silver related items

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 5: Commit**

```bash
git add src/features/conflict-analysis/ConflictAnalysisTab.tsx src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx src/lib/userScheduleViewModel.ts
git commit -m "feat: add three-day purchased schedule view"
```

### Task 9: Full regression verification

**Files:**
- Verify existing touched files

**Step 1: Run focused tests**

Run:

```bash
npm test -- \
  src/lib/__tests__/userScheduleStorage.test.ts \
  src/lib/__tests__/userScheduleViewModel.test.ts \
  src/lib/__tests__/officialRuleSummaryLoad.test.ts \
  src/features/event-catalog/__tests__/EventCatalogTab.test.tsx \
  src/features/my-schedule/__tests__/MyScheduleTab.test.tsx \
  src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx
```

**Step 2: Run broader existing tests**

Run:

```bash
npm test -- \
  src/lib/__tests__/jkfaceSync.test.ts \
  src/lib/__tests__/officialDataLoad.test.ts
```

**Step 3: Run production build**

Run:

```bash
npm run build
```

**Step 4: Commit final integration**

```bash
git add src package.json package-lock.json
git commit -m "feat: add local purchased schedule workflow"
```
