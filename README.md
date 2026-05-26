# TRE2026 Mobile Web

Static, mobile-first TRE2026 planning app for iPhone viewing.

This build is configured for offline bundle use on iPhone with relative asset paths.

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

## iPhone Offline Use

1. Run `npm run build`.
2. Compress the `dist/` folder as a zip if you want to transfer it cleanly.
3. Move the built `dist/` folder to the iPhone using AirDrop, iCloud Drive, or Files.
4. Open the bundle with an app or wrapper that can display local HTML content.

Notes:

- The build uses relative asset paths, so `dist/index.html` can be opened from a local bundle instead of a deployed web root.
- If you update the JSON files, rebuild and replace the whole `dist/` folder on the phone.
