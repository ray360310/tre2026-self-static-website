# TRE2026 Mobile Web Design

## Summary

Build a mobile-first static web app for iPhone viewing. The app is updated locally, rebuilt, and then copied to the phone as a fixed-data bundle. No login, backend, or live sync is required.

## Goals

- Show the user's purchased TRE2026 activities in a clear mobile schedule view.
- Show pending Gold Card and Silver Card benefit selections, including desired people and time slots.
- Show the full TRE2026 activity catalog, including unreleased activities supplied manually.
- Analyze whether a candidate activity conflicts with purchased activities or card-benefit activities.

## Non-Goals

- No account system or login.
- No scraping or live fetch from the TRE website.
- No cloud storage or multi-device sync.
- No drag-and-drop schedule editing.
- No push notifications or ticket alerts.

## Product Structure

The app uses three tabs:

1. `我的行程`
   - Purchased activities
   - Gold Card and Silver Card pending selections
   - Desired people and time slots
   - Quick conflict indicators on candidate activities

2. `衝突分析`
   - Timeline-style comparison of purchased activities, candidate activities, and card-benefit activities
   - Selected candidate activity highlights overlapping items
   - Summary of affected purchased items and card benefits

3. `TRE2026 活動`
   - Full manually maintained event catalog
   - Activity descriptions
   - Person information
   - Filters by date, person, and event type

## Data Model

Use local JSON files under a data directory.

### `people.json`

Shared person information:

- `id`
- `name`
- `group`
- `bio`
- `tags`
- `notes`
- `image`

### `events.json`

All activities across purchased, candidate, official, and card-benefit events:

- `id`
- `title`
- `date`
- `start`
- `end`
- `type`
- `peopleIds`
- `description`
- `location`
- `source`
- `status`

`type` values:

- `purchased`
- `candidate`
- `official`
- `card-benefit`

`status` values:

- `confirmed`
- `planned`
- `unreleased`

### `my-plan.json`

User-specific planning state:

- owned cards: one Gold Card, one Silver Card
- purchased event ids
- candidate event ids
- pending card-benefit preferences
- preferred people and time-slot notes

### `rules.json`

Conflict and labeling rules:

- overlapping time windows count as conflict
- conflicts with `女優親密接觸` affect Gold Card benefit
- conflicts with `招財女神祝福儀式` affect Silver Card benefit

## Conflict Logic

Two events conflict when:

- same calendar date
- candidate start time is earlier than other end time
- candidate end time is later than other start time

Conflict output should distinguish:

- general purchased-event conflicts
- Gold Card benefit impact
- Silver Card benefit impact

## Technical Design

Use a static mobile-first frontend:

- `Vite`
- `React`
- `TypeScript`
- `Tailwind CSS`
- `Zod` for JSON validation
- a lightweight chart or timeline visualization library only if needed after a simple CSS timeline proves insufficient

The app should be fully usable from static build output with all data bundled locally.

## UX Direction

- Mobile-first layout for iPhone width
- iOS-inspired tab shell and card layout
- Clear schedule chips for date and time
- Strong visual distinction between purchased, candidate, and card-benefit events
- Conflict warnings visible without requiring deep navigation

## Initial Seed Data

Seed the first version with these purchased activities:

1. `2026/07/03 13:30-14:10`
   - Person: `雛乃花音`
   - Title: `ACT 激情水鑽感謝祭`

2. `2026/07/03 15:45-16:35`
   - Person: `小花暖`
   - Title: `夢想企画感謝祭`
   - Note: `白金互動`

## Error Handling

- Invalid JSON should show a visible data-error state.
- Events missing time fields should remain visible in lists but be excluded from overlap calculations.
- Unknown person references should surface as fallback labels instead of breaking rendering.

## Testing Scope

- JSON schema validation tests
- event normalization tests
- overlap detection tests
- Gold Card and Silver Card impact tests
- at least one UI integration test covering the purchased schedule seed data
