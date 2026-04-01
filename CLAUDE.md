# ChainTrace Farmer App

## Project Overview
Mobile app for farmers to manage batches, view IoT data, and receive alerts.
Part of the ChainTrace blockchain food traceability platform.

## Tech Stack
- **Framework:** React Native + Expo SDK 54
- **Routing:** Expo Router (file-based)
- **Styling:** NativeWind v4 (Tailwind for RN)
- **State:** Zustand v5
- **Auth:** Firebase Auth (email/password)
- **Backend:** ChainTrace Express API (Railway)
- **Charts:** Victory Native (for IoT data)
- **Firebase project:** chaintrace-mvp-v2

## Project Structure
```
app/                    # Expo Router pages
  _layout.tsx           # Root layout (auth listener, fonts, nav guard)
  index.tsx             # Login screen
  register.tsx          # Registration screen
  pending.tsx           # Awaiting approval screen
  (app)/                # Authenticated group (bottom tabs)
    _layout.tsx         # Tab bar layout
    dashboard.tsx       # Home screen
    batches.tsx         # Batch list
    batch/[id].tsx      # Batch detail
    iot.tsx             # IoT overview
    iot/[batchId].tsx   # IoT detail
    profile.tsx         # Farmer profile
    register-batch.tsx  # Register new batch
    irrigation.tsx      # Irrigation schedules
    notifications.tsx   # Alert center
src/
  lib/                  # Firebase + API client
  store/                # Zustand stores (auth, batch)
  components/           # Reusable components
  types/                # TypeScript types
  constants/            # Config, colors
```

## Commands
- `npx expo start` — Start dev server
- `npx eas build -p android --profile production --non-interactive` — Build APK
- `npx expo start --android` — Run on Android

## API
Backend: https://chaintrace-mvp-production.up.railway.app/api
Dev: http://10.0.2.2:3000/api (Android emulator)

## Design
- Dark theme: surface #0d1117, brand #00c896
- Inter font family
- Portrait orientation
- Package: com.chaintrace.farmer
