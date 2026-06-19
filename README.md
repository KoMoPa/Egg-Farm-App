# Egg Farm App

## Run locally

1. Install deps: `npm install`
2. Start dev server: `npm run dev`
3. Build production bundle: `npm run build`

## Railway lockfile note (important)

Railway deploys this service with Node 20 / npm 10 behavior.
When dependencies change, regenerate lockfile with npm 10 before committing:

1. `npm run lockfile:railway`
2. `npm run lockfile:check`
3. Commit `package-lock.json` (and `package.json` if it changed)

This avoids recurring `npm ci` failures for missing transitive deps in Railway builds.

## Key Benefits

- **Digital forms on iPad** – Fill out all compliance forms on tablet instead of paper; data syncs to cloud.
- **Real-time alerts** – Dashboard shows trends instantly; orange badge alerts warn when 7-day rolling feed/water deviations exceed 25%.
- **Automatic calculations** – Egg production %, mortality rates, totals compute automatically; no manual math errors.
- **Multi-barn management** – Switch between barns in one app; all records linked and accessible.
- **Offline capability** – PWA install means the app works on iPad even without internet; syncs when connection returns.
- **Compliance-ready** – Forms structured around egg farm welfare standards; generate audit reports on demand.
- **Configurable per barn** – Housing type and feed method dropdowns adapt form labels and calculations for different setups.
- **Data never lost** – Supabase stores everything permanently with audit trail instead of risking damaged/misplaced paper forms.

## Install on phone (PWA)

The web app can be installed to home screen and will use the app icon.

1. Open the Railway URL on phone browser.
2. iPhone (Safari): Share -> Add to Home Screen.
3. Android (Chrome): menu -> Add to Home Screen (or Install App).

Sharing the app link by text sends the URL; users install from that link.
