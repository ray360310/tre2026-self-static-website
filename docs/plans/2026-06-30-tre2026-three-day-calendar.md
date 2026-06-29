# TRE2026 Three-Day Calendar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace tab2 with a mobile-friendly three-day calendar view that shows purchased activities from local storage and highlights overlaps with gold/silver card benefit windows.

**Architecture:** Keep tab2 mounted from `src/App.tsx`, but change its inputs from candidate-analysis-only data to a combined model of `AppData` plus `UserScheduleRecord`. Build a small calendar view-model layer that maps purchased entries and card-benefit events into three date columns with time-based positioning and conflict flags.

**Tech Stack:** React 19, TypeScript, existing static JSON app data, browser localStorage-backed user schedule state, Vitest, Testing Library

---

### Task 1: Define failing tests for the new tab2 contract

**Files:**
- Modify: `src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 1: Write the failing test**

- Replace candidate-selection expectations with tests for:
  - rendering `7/3`、`7/4`、`7/5`
  - showing purchased local-schedule entries
  - showing gold/silver card benefit blocks
  - marking overlaps

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 3: Write minimal implementation**

- No production code yet

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 5: Commit**

```bash
git add src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx
git commit -m "test: define three-day calendar behavior"
```

### Task 2: Add calendar view-model helpers

**Files:**
- Create: `src/features/conflict-analysis/calendarViewModel.ts`
- Create: `src/features/conflict-analysis/__tests__/calendarViewModel.test.ts`

**Step 1: Write the failing test**

- Add tests for:
  - bucketing purchased entries by `2026/07/03`、`2026/07/04`、`2026/07/05`
  - including gold/silver card events from `AppData`
  - conflict flagging between purchased entries and card-benefit events
  - computing stable time bounds for layout

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/conflict-analysis/__tests__/calendarViewModel.test.ts`

**Step 3: Write minimal implementation**

- Implement helpers to:
  - normalize purchased entries into calendar blocks
  - resolve gold/silver card benefit events from app rules
  - mark overlaps
  - return day columns and hour bounds

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/conflict-analysis/__tests__/calendarViewModel.test.ts`

**Step 5: Commit**

```bash
git add src/features/conflict-analysis/calendarViewModel.ts src/features/conflict-analysis/__tests__/calendarViewModel.test.ts
git commit -m "feat: add three-day calendar view model"
```

### Task 3: Replace tab2 container behavior

**Files:**
- Modify: `src/features/conflict-analysis/ConflictAnalysisTab.tsx`
- Modify: `src/App.tsx`

**Step 1: Write the failing test**

- Extend feature tests to require:
  - schedule state passed from app
  - summary badges based on purchased entries and card-benefit conflicts

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 3: Write minimal implementation**

- Change `ConflictAnalysisTab` props to accept `schedule`
- Replace candidate selector summary with:
  - purchased count
  - benefit count
  - conflict count

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 5: Commit**

```bash
git add src/features/conflict-analysis/ConflictAnalysisTab.tsx src/App.tsx
git commit -m "feat: repurpose tab2 as three-day calendar"
```

### Task 4: Render the three-day calendar grid

**Files:**
- Modify: `src/features/conflict-analysis/TimelineView.tsx`
- Create or Modify: `src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 1: Write the failing test**

- Add assertions for:
  - three day headers visible
  - purchased entry rendered in correct day
  - benefit block rendered in correct day
  - overlap badge visible on conflicted purchased entry

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 3: Write minimal implementation**

- Replace list timeline with:
  - horizontal scroll container
  - fixed-width day columns
  - vertical time rail
  - absolutely positioned blocks

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx`

**Step 5: Commit**

```bash
git add src/features/conflict-analysis/TimelineView.tsx src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx
git commit -m "feat: render mobile three-day calendar"
```

### Task 5: Run regression verification

**Files:**
- Modify only if failures require it

**Step 1: Run focused feature tests**

Run:

```bash
npm test -- src/features/conflict-analysis/__tests__/ConflictAnalysisTab.test.tsx src/features/event-catalog/__tests__/EventCatalogTab.test.tsx src/features/my-schedule/__tests__/MyScheduleTab.test.tsx
```

**Step 2: Run full test suite**

Run:

```bash
npm test
```

**Step 3: Run production build**

Run:

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/App.tsx src/features/conflict-analysis
git commit -m "feat: add three-day calendar schedule view"
```
