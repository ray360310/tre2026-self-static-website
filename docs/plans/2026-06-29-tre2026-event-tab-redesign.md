# TRE2026 Event Tab Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the third tab so it shows all official JKFace TRE2026 activities as a filterable mobile banner list with inline expansion for full content.

**Architecture:** Add a dedicated official-data sync layer that writes separate JSON files for JKFace activity data, then change the third tab to render that official dataset with vendor, actress, and price-type filters plus one-open-at-a-time expandable rows. Keep user planning data isolated from the official event feed.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, Node fetch/HTML parsing, local JSON data files

---

### Task 1: Add official data contracts and loader support

**Files:**
- Create: `src/types/officialData.ts`
- Modify: `src/lib/loadData.ts`
- Create: `src/data/official-events.json`
- Create: `src/data/official-people.json`
- Create: `src/lib/__tests__/officialDataLoad.test.ts`

**Step 1: Write the failing test**

```ts
import { loadOfficialEventData } from "../loadData";

test("loads official JKFace events separately from personal events", () => {
  const result = loadOfficialEventData();
  expect(result.events.length).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/officialDataLoad.test.ts`
Expected: FAIL because official data files and loader do not exist.

**Step 3: Write minimal implementation**

- Define official event and official person types.
- Add placeholder official data JSON files.
- Add loader helpers that validate and return official data separately from personal planning data.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/officialDataLoad.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/types/officialData.ts src/lib/loadData.ts src/data/official-events.json src/data/official-people.json src/lib/__tests__/officialDataLoad.test.ts
git commit -m "feat: add official event data layer"
```

### Task 2: Add JKFace sync parser and sync command

**Files:**
- Create: `scripts/sync-jkface-tre2026.mjs`
- Modify: `package.json`
- Create: `src/lib/__tests__/jkfaceSync.test.ts`
- Modify: `README.md`

**Step 1: Write the failing test**

```ts
import { extractOfficialEvents } from "../../../scripts/sync-jkface-tre2026.mjs";

test("extracts official event title, banner, and content from JKFace markup", () => {
  const result = extractOfficialEvents(sampleHtml);
  expect(result[0].title).toBe("...");
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/jkfaceSync.test.ts`
Expected: FAIL because the parser script does not exist.

**Step 3: Write minimal implementation**

- Add a sync script that fetches `https://jkface.net/redexpo/2026/event`.
- Parse the list page and, if needed, detail pages for full public content.
- Write `official-events.json` and `official-people.json`.
- Add `npm run sync`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/jkfaceSync.test.ts`
Expected: PASS for parser extraction logic.

**Step 5: Commit**

```bash
git add scripts/sync-jkface-tre2026.mjs package.json README.md src/lib/__tests__/jkfaceSync.test.ts
git commit -m "feat: add jkface sync command"
```

### Task 3: Build third-tab data shaping for tags and filters

**Files:**
- Create: `src/features/event-catalog/officialEventViewModel.ts`
- Create: `src/features/event-catalog/__tests__/officialEventViewModel.test.ts`

**Step 1: Write the failing test**

```ts
test("builds vendor, actress, and price tags for official events", () => {
  const viewModel = buildOfficialEventViewModel(sampleEvents, samplePeople);
  expect(viewModel.filters.vendors).toContain("...");
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/event-catalog/__tests__/officialEventViewModel.test.ts`
Expected: FAIL because the view-model helper does not exist.

**Step 3: Write minimal implementation**

- Convert official raw data into list-ready view models.
- Derive vendor, actress, and price-type filter values.
- Preserve full public content for display.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/event-catalog/__tests__/officialEventViewModel.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/event-catalog/officialEventViewModel.ts src/features/event-catalog/__tests__/officialEventViewModel.test.ts
git commit -m "feat: shape official event tags and filters"
```

### Task 4: Replace third-tab filter UI

**Files:**
- Modify: `src/features/event-catalog/CatalogFilters.tsx`
- Modify: `src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`

**Step 1: Write the failing test**

```tsx
test("shows vendor, actress, and price-type filters", () => {
  render(<EventCatalogTab data={...} />);
  expect(screen.getByLabelText("廠商篩選")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`
Expected: FAIL because the current filter UI still uses date/person/type assumptions.

**Step 3: Write minimal implementation**

- Replace the filter controls with vendor, actress, and price-type selectors.
- Remove the old third-tab date and event-type semantics.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTab.test.tsx`
Expected: PASS for new filter labels and behavior.

**Step 5: Commit**

```bash
git add src/features/event-catalog/CatalogFilters.tsx src/features/event-catalog/__tests__/EventCatalogTab.test.tsx
git commit -m "feat: replace event tab filters"
```

### Task 5: Replace third-tab rows with expandable banner list

**Files:**
- Create: `src/features/event-catalog/OfficialEventListItem.tsx`
- Modify: `src/features/event-catalog/EventCatalogTab.tsx`
- Create: `src/features/event-catalog/__tests__/OfficialEventListItem.test.tsx`

**Step 1: Write the failing test**

```tsx
test("renders banner, title, tags, and expandable full content", async () => {
  render(<OfficialEventListItem event={sampleEvent} />);
  expect(screen.getByRole("img")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/event-catalog/__tests__/OfficialEventListItem.test.tsx`
Expected: FAIL because the expandable list item component does not exist.

**Step 3: Write minimal implementation**

- Render official events as banner cards.
- Show title and tags in collapsed state.
- Expand inline to reveal the full content block.
- Keep only one item expanded at a time.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/event-catalog/__tests__/OfficialEventListItem.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/event-catalog/OfficialEventListItem.tsx src/features/event-catalog/EventCatalogTab.tsx src/features/event-catalog/__tests__/OfficialEventListItem.test.tsx
git commit -m "feat: add expandable official event list"
```

### Task 6: Add empty/error states for missing official sync data

**Files:**
- Modify: `src/features/event-catalog/EventCatalogTab.tsx`
- Create: `src/features/event-catalog/__tests__/EventCatalogTabEmptyState.test.tsx`

**Step 1: Write the failing test**

```tsx
test("shows a clear empty state when official sync data is missing", () => {
  render(<EventCatalogTab data={emptyData} />);
  expect(screen.getByText("尚未同步官方活動")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTabEmptyState.test.tsx`
Expected: FAIL because no official-data empty state exists.

**Step 3: Write minimal implementation**

- Show a clear empty state when official data is unavailable.
- Keep filter UI and expansion logic safe under empty conditions.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/event-catalog/__tests__/EventCatalogTabEmptyState.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/event-catalog/EventCatalogTab.tsx src/features/event-catalog/__tests__/EventCatalogTabEmptyState.test.tsx
git commit -m "feat: add official event tab empty state"
```
