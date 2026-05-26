# TRE2026 Mobile Web

Static, mobile-first TRE2026 planning app for iPhone viewing.

## Scripts

- `npm install`
- `npm run dev`
- `npm test -- --runInBand`
- `npm run build`

## Data Files

Update local JSON data in:

- `src/data/people.json`
- `src/data/events.json`
- `src/data/my-plan.json`
- `src/data/rules.json`

## Update Flow

1. Edit the JSON files with your latest TRE2026 schedule and candidate activities.
2. Run `npm test -- --runInBand` to verify the data still passes validation.
3. Run `npm run build`.
4. Copy the built `dist/` output to the phone for offline viewing.
