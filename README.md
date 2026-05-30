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

## Install on phone (PWA)

The web app can be installed to home screen and will use the app icon.

1. Open the Railway URL on phone browser.
2. iPhone (Safari): Share -> Add to Home Screen.
3. Android (Chrome): menu -> Add to Home Screen (or Install App).

Sharing the app link by text sends the URL; users install from that link.
