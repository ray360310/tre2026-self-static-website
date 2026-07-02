# TRE2026 Event Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a structured enhancement layer for selected official TRE2026 events so tab3 can guide users through person, plan, and session selection with automatic date/time filling.

**Architecture:** Keep `official-events.json` as the synced source of truth and add a separate enhancement dataset keyed by `officialEventId`. Load and merge this data in the UI so enhanced events use structured selection flows while all other events keep the current manual form behavior.

**Tech Stack:** React 19, TypeScript, static JSON data files, Vitest, Testing Library

---

### Task 1: Add enhancement data model and loader

**Files:**
- Create: `src/data/event-enhancements.json`
- Create: `src/types/eventEnhancements.ts`
- Create: `src/lib/eventEnhancements.ts`
- Test: `src/lib/__tests__/eventEnhancements.test.ts`

**Step 1: Write the failing test**

- Add tests for:
  - loading enhancement records by `officialEventId`
  - validating person/plan/session structure
  - returning `null` when an event has no enhancement

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/eventEnhancements.test.ts`
Expected: FAIL because the loader/types do not exist yet

**Step 3: Write minimal implementation**

- Define types for:
  - enhancement record
  - profile/person
  - plan
  - session
- Create a small lookup helper such as `getEventEnhancementById`
- Seed the JSON file with the first supported activity records

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/eventEnhancements.test.ts`
Expected: PASS

### Task 2: Add first-batch enhancement content

**Files:**
- Modify: `src/data/event-enhancements.json`

**Step 1: Build the dataset**

- Add structured records for:
  - `TRE AV CULT粉絲見面會`
  - `UR AV ★情慾天國 PARADISE OF DESIRE ★`
  - `「職業痴女誘惑：交給專業的來！」—— 西野繪美 x 碧那美海`
  - `AVWAY Dream Box`
  - `訂閱平台 Fantrie。與韓國 No.1 知名創作者們在TRE現場直接互動並親身體驗吧！`
  - `KMP×六大金釵×TRE粉絲活動 - 彌生美月・羽月乃蒼・虹村由美・胡桃櫻・櫻由乃・小野寺舞`

**Step 2: Keep only reliable structured fields**

- If a session time or outfit is known, include it
- If unknown, leave it empty instead of inventing values
- Mark image-derived vs copy-derived notes where useful

**Step 3: Sanity-check the JSON**

Run: `npm test -- src/lib/__tests__/eventEnhancements.test.ts`
Expected: PASS with the full first-batch data

### Task 3: Extend tab3 form state for enhancement-driven flows

**Files:**
- Modify: `src/features/event-catalog/EventCatalogTab.tsx`
- Modify: `src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 1: Write the failing test**

- Add tests for:
  - enhanced activity shows person/plan/session selectors
  - selecting a single-session plan auto-fills date/time
  - selecting a multi-session plan requires session selection
  - non-enhanced activity still uses current manual flow

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`
Expected: FAIL because enhancement-aware UI does not exist yet

**Step 3: Write minimal implementation**

- Load the enhancement for each expanded event
- Update draft state to include:
  - selected enhancement person
  - selected enhancement plan
  - selected enhancement session
- Auto-fill date/start/end when a session is resolved

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`
Expected: PASS

### Task 4: Show enhancement summaries in tab3

**Files:**
- Modify: `src/features/event-catalog/EventCatalogTab.tsx`
- Modify: `src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 1: Write the failing test**

- Add tests for:
  - plan summary is displayed
  - price label is displayed
  - outfit is displayed when available
  - session label is displayed when multiple sessions exist

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`
Expected: FAIL because summary panels do not exist yet

**Step 3: Write minimal implementation**

- Render a summary panel for enhanced events
- Keep it read-only and derived from the selected plan/session

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`
Expected: PASS

### Task 5: Preserve purchased/candidate save flows

**Files:**
- Modify: `src/features/event-catalog/EventCatalogTab.tsx`
- Modify: `src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 1: Write the failing test**

- Add tests for:
  - enhanced activity can be saved to purchased
  - enhanced activity can be saved to candidate
  - saved labels use the chosen person and plan
  - auto-filled time is written into the saved schedule entry

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`
Expected: FAIL if the enhanced flow does not feed the save path correctly

**Step 3: Write minimal implementation**

- Make `buildEntry` read from enhancement-driven draft values when present
- Preserve existing save behavior for manual entries

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`
Expected: PASS

### Task 6: Regression verification

**Files:**
- Modify only if failures require it

**Step 1: Run focused suites**

Run:

```bash
npm test -- src/lib/__tests__/eventEnhancements.test.ts src/features/event-catalog/__tests__/EventCatalogTab.test.tsx src/features/my-schedule/__tests__/MyScheduleTab.test.tsx src/features/conflict-analysis/__tests__/calendarViewModel.test.ts src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx
```

Expected: PASS

**Step 2: Run full suite**

Run:

```bash
npm test
```

Expected: PASS

**Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS
