# Talipot LP Dashboard

A clean, mobile-first **React Native (Expo)** app for tracking private markets
LP investments — built for Talipot Capital (Coppel family office).

Track fund commitments, called capital, distributions, NAV, IRR/MOIC/DPI/TVPI,
LPAC seats and co-invest opportunities. Data persists locally on the phone via
AsyncStorage. Light/dark mode included.

## Features

- **4-tab navigation** — Portfolio (dashboard), Positions (list), Metrics (deep
  dive), Add (form).
- **Portfolio dashboard** — total value hero, KPI grid (Committed, NAV, Called,
  Unfunded, Distributed, MOIC), capital-deployment progress, and an allocation
  **pie chart** by NAV.
- **Positions list** — searchable + filterable by type or vintage, with quick
  **edit/delete** and tap-to-edit.
- **Metrics** — portfolio multiples, **bar chart** (NAV or commitment by
  position), capital summary, and best/worst performers.
- **Add / Edit** — full validated form for every data-model field.
- **Persistence** — `@react-native-async-storage/async-storage`.
- **Nice-to-haves** — pull-to-refresh, CSV + formatted-text export (to
  clipboard), dark mode (system / light / dark toggle).

## Quick start

```bash
npm install        # or: yarn
npx expo start
```

Then scan the QR code with **Expo Go** (iOS/Android), or press `i` / `a` for a
simulator. The app seeds a realistic sample portfolio on first launch.

> Requires Node 18+ and the Expo tooling. No native build step needed — runs in
> Expo Go.

## Project structure

```
App.tsx                     # Entry: providers + navigation
app.json                    # Expo config
src/
  components/               # Reusable UI (Card, StatCard, Badge, PositionCard,
                            #   PositionForm, ScreenContainer, ThemeToggle, ...)
  context/
    PortfolioContext.tsx    # CRUD + AsyncStorage persistence + rollups
    ThemeContext.tsx        # Light/dark theme preference
  data/sampleData.ts        # Seed portfolio (Era, Founders Fund X, B1, ...)
  navigation/               # Tab + modal stack navigator
  screens/                  # Portfolio / Positions / Metrics / Add / Edit
  theme/                    # Design tokens (colors, spacing, type)
  types/                    # Position + PortfolioTotals models
  utils/                    # format, calculations, CSV/text export
```

## Data model

Each `Position` (see `src/types/index.ts`) captures: name, type (VC, PE, Real
Estate, Credit, …), manager, commitment, called capital, distributed, current
NAV, gross/net IRR, gross/net MOIC, DPI, net TVPI, vintage year, thesis/notes,
LPAC seat, and co-invest opportunity.

## Notes on the math

- Portfolio multiples (TVPI/DPI/MOIC) are computed from **aggregate cash
  flows** — the correct way to roll up a book.
- Portfolio IRR is a **NAV-weighted average** of each fund's IRR. True pooled
  IRR needs dated underlying cash flows (not stored here); NAV-weighting is the
  standard LP-dashboard proxy. See `src/utils/calculations.ts`.

## Extending

- Add a field: update `Position` in `src/types`, the form in
  `src/components/PositionForm.tsx`, and (optionally) the export helpers.
- Swap charts: chart logic lives in `PortfolioScreen` (pie) and `MetricsScreen`
  (bar), both using `react-native-chart-kit`.
- Reset to sample data: `usePortfolio().resetToSample()`.
