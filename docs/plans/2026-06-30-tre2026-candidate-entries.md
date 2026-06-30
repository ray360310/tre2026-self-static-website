# TRE2026 Candidate Entries Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add candidate activity storage and visualization so users can save official events they want to buy later and inspect overlaps in the three-day calendar without blocking the save.

**Architecture:** Extend the existing browser-local schedule state to store both purchased and candidate entries with the same record shape. Reuse tab3 input flow, split tab1 display into purchased/candidate sections, and extend the tab2 calendar view model to render candidate blocks plus overlap labels against purchased activities and card-benefit windows.

**Tech Stack:** React 19, TypeScript, localStorage, existing static JSON official event data, Vitest, Testing Library

---

### Task 1: Extend local schedule schema for candidate entries

**Files:**
- Modify: `src/types/userSchedule.ts`
- Modify: `src/lib/userScheduleStorage.ts`
- Modify: `src/lib/__tests__/userScheduleStorage.test.ts`

**Step 1: Write the failing test**

- Add tests for:
  - default empty `candidateEntries`
  - add/remove candidate entry helpers

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/userScheduleStorage.test.ts`

**Step 3: Write minimal implementation**

- Add `candidateEntries` to the schedule record
- Add candidate add/remove helpers

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/userScheduleStorage.test.ts`

### Task 2: Add candidate actions to tab3

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/event-catalog/EventCatalogTab.tsx`
- Modify: `src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 1: Write the failing test**

- Add tests for:
  - `加入預選`
  - `移出預選`
  - saving candidate even when it would overlap

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 3: Write minimal implementation**

- Wire app-level candidate add/remove handlers
- Render candidate action buttons in tab3

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

### Task 3: Split tab1 into purchased and candidate sections

**Files:**
- Modify: `src/features/my-schedule/MyScheduleTab.tsx`
- Modify: `src/features/my-schedule/__tests__/MyScheduleTab.test.tsx`

**Step 1: Write the failing test**

- Add tests for:
  - empty candidate section
  - rendering candidate section content
  - delete candidate item

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/my-schedule/__tests__/MyScheduleTab.test.tsx`

**Step 3: Write minimal implementation**

- Render purchased and candidate sections separately

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/my-schedule/__tests__/MyScheduleTab.test.tsx`

### Task 4: Extend tab2 calendar model for candidate conflicts

**Files:**
- Modify: `src/features/conflict-analysis/calendarViewModel.ts`
- Modify: `src/features/conflict-analysis/__tests__/calendarViewModel.test.ts`
- Modify: `src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 1: Write the failing test**

- Add tests for:
  - rendering candidate blocks
  - candidate overlap labels against purchased entries
  - candidate overlap labels against gold/silver benefits

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/conflict-analysis/__tests__/calendarViewModel.test.ts src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 3: Write minimal implementation**

- Add candidate block kind
- Compute overlaps without blocking save

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/conflict-analysis/__tests__/calendarViewModel.test.ts src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

### Task 5: Render candidate styling and detail info in tab2

**Files:**
- Modify: `src/features/conflict-analysis/TimelineView.tsx`
- Modify: `src/features/conflict-analysis/ConflictAnalysisTab.tsx`

**Step 1: Write the failing test**

- Add assertions for candidate card label, detail panel labels, and overlap notes

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 3: Write minimal implementation**

- Add candidate card styling
- Show overlap summary in detail panel

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

### Task 6: Full regression verification

**Files:**
- Modify only if failures require it

**Step 1: Run focused suites**

Run:

```bash
npm test -- src/lib/__tests__/userScheduleStorage.test.ts src/features/event-catalog/__tests__/EventCatalogTab.test.tsx src/features/my-schedule/__tests__/MyScheduleTab.test.tsx src/features/conflict-analysis/__tests__/calendarViewModel.test.ts src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx
```

**Step 2: Run full suite**

Run:

```bash
npm test
```

**Step 3: Run build**

Run:

```bash
npm run build
```
