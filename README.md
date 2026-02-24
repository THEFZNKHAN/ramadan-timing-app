# Ramadan Timing

A modern, responsive web app for **Sehri** and **Iftar** times during Ramadan. Get today’s timings, a countdown to the next prayer, full prayer times, and a full Ramadan month calendar—all for your location.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwind-css)

---

## Features

- **Sehri & Iftar** — Today’s Fajr (Sehri) and Maghrib (Iftar) with 12-hour format
- **Next prayer countdown** — Live countdown to the next prayer (Sehri or Iftar)
- **Location** — “Use my location”, city search, or IP-based fallback (ipapi.co → ipwho.is)
- **All prayer times** — Dedicated page: Imsak, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, Midnight
- **Ramadan month** — 30-day grid with Sehri & Iftar per roza; today highlighted; correct Hijri year
- **Toast notifications** — Errors and messages as toasts (auto-dismiss), no inline error blocks
- **Night theme** — Dark palette with gold accents and optional starfield background
- **Responsive** — Mobile-first, works on all screen sizes

---

## Tech stack

| Layer        | Stack |
|-------------|--------|
| Framework   | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| Language    | [TypeScript](https://www.typescriptlang.org/) |
| Styling     | [Tailwind CSS 4](https://tailwindcss.com/) |
| Validation  | [Zod](https://zod.dev/) (API responses) |
| Prayer data | [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api) (proxied via API routes) |
| Location    | Browser geolocation, Open-Meteo city search, ipapi.co / ipwho.is for IP fallback |

---

## Getting started

### Prerequisites

- **Node.js** 18+ (recommend 20+)
- **npm** (or yarn/pnpm)

### Install and run

```bash
# Clone the repo (or use your own)
git clone https://github.com/thefznkhan/ramadan-timing-app.git
cd ramadan-timing-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Project structure

```
ramadan-timing-app/
├── app/
│   ├── layout.tsx              # Root layout, ToastProvider, NightSky
│   ├── page.tsx                # Home: Sehri/Iftar, location, links
│   ├── prayer-times/
│   │   └── page.tsx            # Full prayer times list
│   ├── ramadan-month/
│   │   └── page.tsx            # 30-day Ramadan calendar (Hijri-based)
│   ├── api/
│   │   ├── timings/            # GET — daily timings (lat/lng or city)
│   │   ├── next-prayer/        # GET — next prayer (computed from timings)
│   │   ├── calendar/           # GET — Hijri calendar (Ramadan month)
│   │   ├── geo/                # GET — IP-based location fallback
│   │   ├── search-city/        # GET — city search (Open-Meteo)
│   │   └── methods/            # GET — Aladhan calculation methods
│   └── globals.css
├── components/
│   ├── HeroRamadan.tsx         # Sehri/Iftar cards + countdown
│   ├── LocationPicker.tsx      # Location label, “Use my location”, city search
│   ├── BackLink.tsx            # Link back to home
│   ├── NightSky.tsx            # Optional starfield background
│   ├── Toast.tsx               # Toast context + provider + UI
│   ├── AllPrayerTimes.tsx      # Full prayer list (used on prayer-times page)
│   ├── RamadanMonth.tsx        # Day grid (used on ramadan-month page)
│   └── ui/
│       └── Button.tsx
├── lib/
│   ├── aladhan.ts              # Aladhan API client (timings, calendar)
│   ├── format.ts               # to12HourTime, etc.
│   └── geo.ts                  # getStoredLocation, setStoredLocation, getBrowserLocation
├── types/
│   └── prayer.ts               # PrayerData, PrayerTimings, HijriDate, etc.
├── package.json
├── tsconfig.json
└── README.md
```

- **Location** is stored in `localStorage` and reused across pages and API calls.
- **Ramadan month** uses the current Hijri year (from `/api/timings`) so the calendar shows the correct Gregorian dates (e.g. Ramadan 1447).

---

## API routes (proxy to Aladhan)

All routes are **GET** and accept query parameters. Responses are validated with Zod.

| Route             | Purpose |
|-------------------|--------|
| `/api/timings`    | Daily prayer timings (by coordinates, city, or address) |
| `/api/next-prayer`| Next prayer name and time (computed server-side from timings) |
| `/api/calendar`   | Hijri calendar (year, month 9) for Ramadan month page |
| `/api/geo`        | IP-based location (ipapi.co → ipwho.is); returns 200 with `detected: false` on failure |
| `/api/search-city`| City search (Open-Meteo) for location picker |
| `/api/methods`    | Aladhan calculation methods (optional) |

No API keys required for Aladhan in normal use.

---

## License

MIT (or your chosen license).
