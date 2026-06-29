# TRE2026 Event Tab Redesign

## Summary

Redesign the third tab so it shows all TRE2026 activities from the JKFace event page at `https://jkface.net/redexpo/2026/event`. The tab should become a filterable mobile list with banner image, title, and tags, and each item should expand inline to show the full public activity content from the source site.

## Goals

- Replace the current generic event catalog in the third tab with the official TRE2026 event list from JKFace.
- Display each activity as a mobile-friendly list item with banner image, title, and tags.
- Allow tapping a list item to expand downward and reveal the full activity content as published publicly.
- Support filtering by:
  - vendor name
  - actress name
  - price type (`鑽石`, `FACE券`)
- Keep the first two tabs unchanged in scope for this work.

## Non-Goals

- Do not add time-slot conflict analysis into the third tab in this iteration.
- Do not require login or private ticket data from JKFace.
- Do not attempt to normalize every content block from the source into separate structured UI fields.
- Do not replace `my-plan.json` or the user’s private planning data.

## UX Direction

- The third tab becomes a single-column mobile list.
- Each row includes:
  - banner image
  - title
  - compact tag row
- Rows are collapsed by default.
- Only one activity may be expanded at a time.
- When expanded, the row shows the activity’s full public content in reading order.
- The filter area lives above the list and supports multi-dimensional narrowing by vendor, actress, and price type.

## Data Strategy

Official synced data must live in separate files from user-authored data.

### New files

- `src/data/official-events.json`
- `src/data/official-people.json`

Optional future file if vendor modeling becomes large:

- `src/data/official-vendors.json`

### Merge rules

- Official data is treated as the source of truth for the third tab.
- User-authored data remains in:
  - `src/data/events.json`
  - `src/data/people.json`
  - `src/data/my-plan.json`
- This redesign should not overwrite or mutate the user-authored files.

## Scraping Scope

Primary source page:

- `https://jkface.net/redexpo/2026/event`

The sync process should collect:

- activity title
- activity detail URL
- banner image URL
- vendor name when present
- actress names when present
- price-type tags derived from visible content
- full public content block as display-ready text or HTML-safe content

If detail pages contain richer activity content than the listing page, the sync should fetch them as well.

## Parsing Policy

- Prefer resilient extraction over brittle DOM assumptions.
- Preserve full public content as close to source order as possible.
- If a field cannot be reliably structured, keep it in the full content block instead of forcing a lossy parse.
- For activities where price markers or actress names are only detectable from text, use best-effort extraction and keep unknowns empty rather than inventing values.

## Filters

The tab replaces the current date/person/type filters with:

- vendor
- actress
- price type

Filter options should be derived from the synced official data itself.

## Expand/Collapse Rules

- Default: all collapsed
- Tap a row header to expand
- Expanding one row collapses the previously open row
- Expanded content appears inline below the selected row header

## Error Handling

- If official sync data is missing, the third tab should show a clear empty state.
- If synced banner images fail to load, fall back to a neutral placeholder block.
- If an activity has no parsed tags, it still appears in the list with title and content.

## Testing Scope

- sync parser tests for official list extraction
- filter tests for vendor / actress / price type
- expansion tests enforcing one-open-item behavior
- rendering tests ensuring banner, title, tags, and full content appear

## Open Decisions Resolved

- Full activity content is displayed in original public form rather than deeply restructured.
- Only one item may be expanded at a time.
- The third tab does not yet include slot-selection conflict analysis.
