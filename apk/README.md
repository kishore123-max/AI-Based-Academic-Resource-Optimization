# CampusFlow Android app

This Expo / React Native app provides a compact campus dashboard and checks connectivity to the shared FastAPI service.

## Local run

```powershell
npm install
npx expo start
```

The Android emulator can reach a locally running API at `http://10.0.2.2:8000`. For a physical device, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the development computer's LAN IP.

## Build an APK

Install and configure EAS CLI, sign in to an Expo account, then run `npm run build:apk`. The `preview` EAS profile requests an installable APK. A local `npx expo run:android` build also requires Android Studio and the Android SDK.