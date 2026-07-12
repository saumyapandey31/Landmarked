# Landmarked — Interactive 3D Travel Journal & Social Platform

A full-stack scaffold for a premium travel journaling platform: 3D interactive globe (CesiumJS),
one-click travel markers, trip journals, a scrapbook-style photo album, social features
(follows/likes/comments), weather + currency widgets, and expense tracking.

## What's included (working)

- **Server**: Express + Prisma (MySQL) with the full schema from the spec, JWT auth
  (register/login/me), protected routes, and CRUD APIs for trips, travel markers, comments,
  likes, and follows.
- **Client**: Vite + React + Tailwind, themed with the deep-green/mint palette you provided.
  Includes a full-bleed video hero landing page (à la theworldtravelguy.com), a dedicated
  "mark destinations" feature spotlight, login/register, a protected dashboard shell with a
  real interactive CesiumJS globe (rotate/zoom/fly-to/search + cinematic idle auto-rotate +
  colored travel markers), a trip creation form, a story page layout, and a first pass at the
  animated travel-album (scrapbook) component.
- **State**: Zustand for auth/session state, TanStack Query + Axios for server state.

## Hero background video

The landing page (`src/components/VideoHero.jsx`) plays a full-bleed autoplay video behind the
headline, same idea as theworldtravelguy.com. Drop your own clip in:

```
client/public/videos/hero.mp4   (required)
client/public/videos/hero.webm  (optional, smaller fallback)
```

See `client/public/videos/README.md` for recommended specs. Until you add a file, the hero
falls back to a static travel photo so the page still looks complete.

## Dashboard redesign (prototype-matched)

The `/dashboard` route was rebuilt to match a supplied premium prototype: dark sidebar with
streak/achievement/premium cards, top bar with search/weather/notifications/level badge, a
hero card with photo-pin markers over an Earth image, "Continue Your Journey", "Recent
Activity" (backed by a new `/api/notifications` endpoint — the `Notification` table already
existed in the schema but had no route until now), a recent-trips carousel, a scrapbook
preview, upcoming plans, and a travel-highlights bar with a real distance-traveled figure
computed from your trip coordinates (`src/utils/distance.js`).

**Real data**: countries/cities/trips visited, media counts, distance traveled, notifications,
markers, bucket list, upcoming plans — all pulled live from your existing API.

**Illustrative placeholders** (clearly marked in code comments, since the schema has no
XP/streak/achievements-earned fields yet): travel level, XP, and streak are derived from real
counts as a stand-in gamification layer. Wire up a real `UserAchievement`/XP system later and
swap these out.

## Dashboard (simplified)

Rebuilt to be clearer and lighter: hero with live stats → current/upcoming trip + recent
activity → interactive globe → trip journals → scrapbook → bucket list → travel highlights.
Removed the extra carousels/CTA cards from the first pass that added visual noise without much
value. Sidebar links now actually scroll to their section (`useEffect` on `location.hash` in
`Dashboard.jsx`, since React Router doesn't auto-scroll on same-route hash changes).

**Image loading**: every background/photo image now has a placeholder color so nothing flashes
white, uses lazy-loading where off-screen, and pulls smaller/compressed Unsplash sizes instead
of full-resolution originals. The scrapbook (`TravelAlbum.jsx`) preloads all of a trip's photos
up front so flipping pages never pops in a blank tile mid-animation.

## Mark-a-destination flow

Clicking anywhere on the globe (or the "Mark a Destination" button) now reverse-geocodes the
coordinates automatically via OpenStreetMap's free Nominatim API — no manual lat/lon entry.
Marking a place as "Visited" creates both a `TravelMarker` and a full `Trip` journal in one
step (`src/components/CreateMemoryModal.jsx`), using your existing `/markers` and `/trips`
endpoints.

## What's stubbed / left for you to extend

Given the scope of the original brief (dozens of features — passports, heat maps, achievements,
route replay, PDF export, etc.), this scaffold focuses on the architectural spine and the
highest-impact features (globe + markers + trips + auth + core social graph) fully wired end to
end. Everything else in `MySQL Database Tables` already exists in `prisma/schema.prisma` so you
can build the remaining routes/UI on the same pattern. Google OAuth, Cloudinary uploads, OpenWeather,
and ExchangeRate calls are wired with clear `.env` placeholders but need your own API keys to go live.

## Setup

### 1. Server

```bash
cd server
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, API keys
npm install
npx prisma migrate dev --name init
npm run dev                # http://localhost:5000
```

### 2. Client

```bash
cd client
cp .env.example .env       # fill in VITE_CESIUM_ION_TOKEN, VITE_API_URL, etc.
npm install
npm run dev                # http://localhost:5173
```

### 3. Cesium token

Sign up free at https://ion.cesium.com, grab an access token, put it in
`client/.env` as `VITE_CESIUM_ION_TOKEN`. Without it the globe falls back to
open imagery with reduced quality but still works.

## Folder structure

```
client/
  src/
    assets/ components/ pages/ layouts/ hooks/ services/ context/ store/ utils/
server/
  controllers/ routes/ middleware/ prisma/ services/ uploads/ config/ utils/
```

## Suggested next steps

1. Wire Cloudinary upload endpoint (`server/services/cloudinary.js` stub included) into
   trip photo/video uploads.
2. Build out Story Page comments/likes UI against the existing `/api/comments` and `/api/likes` routes.
3. Add the Passport / Achievements pages using the `Achievements` + `UserAchievements` tables already
   in the schema.
4. Add the animated travel-album page-turn interaction (CSS 3D transform scaffold is in
   `TravelAlbum.jsx` — extend with drag gestures).
