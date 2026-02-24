# Ramadan Timing — Web App

A responsive Ramadan timing web application showing **Sehri** (Fajr) and **Iftar** (Maghrib) for your location, with optional full prayer times and Ramadan month view.

## Features

- **Ramadan-first**: Today’s Sehri and Iftar with optional countdown to next event
- **Location**: Use browser geolocation, search by city, or IP-based fallback
- **All prayer times**: Expandable list (Fajr, Dhuhr, Asr, Maghrib, Isha, etc.) in 12h format
- **Full Ramadan month**: Table of all 30 days with Sehri/Iftar per roza
- **Responsive**: Mobile-first, touch-friendly, works on all screen sizes
- **Theme**: Deep night palette with gold accents (WCAG-friendly contrast)

## Tech

- **Next.js 15** (App Router), TypeScript, Tailwind CSS
- **API**: [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api) via Next.js API routes (proxy to avoid CORS)
- **Location**: Browser geolocation, Open-Meteo city search, ipapi.co for IP fallback

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Project layout

- `app/` — Layout, page, API routes (`/api/timings`, `/api/next-prayer`, `/api/calendar`, `/api/geo`, `/api/search-city`, `/api/methods`)
- `components/` — HeroRamadan, AllPrayerTimes, RamadanMonth, LocationPicker, ui/Button
- `lib/` — Aladhan client, format helpers, geo/localStorage helpers
- `types/` — Prayer types (PrayerData, PrayerTimings, etc.)

Location is stored in `localStorage` and used for all API calls.
