<div align="center">

# 🥚 SCSC Compliance Tracker

**Digital compliance record-keeping for Canadian egg farmers**

*Built for the [Start Clean Stay Clean (SCSC)](https://www.eggs.ca/producers/on-farm-programs) program — administered by Egg Farmers of Canada — replacing paper binders with a mobile-friendly, always audit-ready Progressive Web App.*

</div>

---

## 📸 Screenshot

![Dashboard screenshot](public/screenshot.png)

---

## 🛠 Tech Stack

<table>
  <tr>
    <th>Layer</th>
    <th>Technologies</th>
  </tr>
  <tr>
    <td align="center"><b>🖥 Frontend</b></td>
    <td>
      <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
      <img src="https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
      <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS 4" />
      <img src="https://img.shields.io/badge/TypeScript-323330?style=for-the-badge&logo=typescript&logoColor=3178C6" alt="Typescript" />
      <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=googlechrome&logoColor=white" alt="PWA" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>⚙️ Backend</b></td>
    <td>
      <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black" alt="Supabase" />
      <img src="https://img.shields.io/badge/PostgREST_API-008bb9?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgREST" />
      <img src="https://img.shields.io/badge/Supabase_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black" alt="Supabase Auth" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>🗄 Database</b></td>
    <td>
      <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>☁️ Hosting</b></td>
    <td>
      <img src="https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white" alt="Railway" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>🧪 Testing</b></td>
    <td>
      <img src="https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" />
    </td>
  </tr>
  <tr>
    <td align="center"><b>📄 PDF Reports</b></td>
    <td>
      <img src="https://img.shields.io/badge/@react--pdf/renderer-FF6B6B?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="react-pdf" />
      <img src="https://img.shields.io/badge/jsPDF-FF6B6B?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="jsPDF" />
    </td>
  </tr>
</table>

---

## 🏗 Architecture

The app follows a **serverless, client-driven architecture** — no custom backend server. The React SPA talks directly to Supabase, which handles the database, auto-generated REST API, and authentication.

```mermaid
graph TD
    Farmer("🧑‍🌾 Farmer<br/>iOS / Android / Desktop")

    subgraph Railway ["☁️ Railway (Static Host)"]
        SPA["React 19 SPA<br/>Vite · TailwindCSS · PWA"]
    end

    subgraph Supabase ["🔷 Supabase (BaaS)"]
        Auth["Supabase Auth<br/>JWT / Email-Password"]
        API["PostgREST API<br/>Auto-generated REST"]
        DB["PostgreSQL<br/>Row Level Security"]
    end

    Farmer -->|HTTPS| SPA
    SPA -->|Auth requests| Auth
    SPA -->|Data requests + Bearer JWT| API
    Auth -->|Session token| SPA
    API -->|RLS-enforced reads/writes| DB
```

### Data ownership chain

Every database table has Row Level Security enabled. Data access cascades strictly from the authenticated user down through their farm:

```
auth.uid() → farms → barns → monthly_audits → form records
```

No user can ever read or write another farm's data — this is enforced at the database level, not just in application code.

---

## 📋 What it tracks

The app digitises the four SCSC compliance forms required of all licensed Canadian egg producers:

| Form | Area | Frequency |
|------|------|-----------|
| Form 07 | Production & Cooler Records — egg output, floor eggs, cooler temps, sanitation, flock age, thermometer calibration | Daily |
| Form 08 | Welfare Records — daily barn checks, weekly 15-point inspection, monthly ammonia/alarm/generator | Daily / Weekly / Monthly |
| Form 09 | Feed & Water Records — actuals vs. targets, mortality, health events | Daily |
| Form 10 | Pest Control Records — trap checks, bait monitoring, rodent index calculation, range inspections | As performed / Monthly |

Plus a cross-form **Corrective Action Log**, on-demand **PDF report generation**, and an **Analytics Dashboard** with feed, water, and egg production charts.

---

## 🚀 Run locally

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build production bundle
npm run test:e2e   # Run Playwright end-to-end tests
```

---

## 🚂 Railway deployment — lockfile note

Railway builds with Node 20 / npm 10. When dependencies change, regenerate the lockfile with npm 10 before committing:

```bash
npm run lockfile:railway   # Regenerate package-lock.json with npm 10
npm run lockfile:check     # Verify the lockfile is clean
```

Then commit `package-lock.json` (and `package.json` if it changed). This prevents `npm ci` failures on Railway caused by missing transitive dependencies.

---

## 📱 Install on mobile (PWA)

No app store required. Install directly from the browser:

- **iPhone (Safari):** Share → Add to Home Screen
- **Android (Chrome):** Menu → Install App (or Add to Home Screen)

Share the Railway URL by text; recipients install from that link. Once installed, the app icon appears on the home screen and runs in standalone mode. Updates deploy automatically — users always get the latest version.

---

<div align="center">

Built by **KoMoPa Dev** · Questions or feedback? [komopadev@gmail.com](mailto:komopadev@gmail.com)

</div>
