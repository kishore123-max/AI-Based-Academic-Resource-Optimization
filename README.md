# CampusFlow

CampusFlow is an academic resource planning starter project. It contains a responsive web dashboard, a FastAPI optimization service, a PostgreSQL schema, and an Expo Android client.

## Project layout

- `frontend/` - React, TypeScript, and Vite web dashboard
- `backend/` - FastAPI API and weighted-priority resource optimizer
- `database/` - PostgreSQL schema and database notes
- `apk/` - Expo / React Native mobile app and APK build profile

## Learning library and roles

The web dashboard includes Student, Staff, and Academic role selection, searchable resources, and these library categories: notes / study materials, educational videos, previous year question papers, e-books, lab materials, faculty materials, and assignments. Staff and Academic roles can add a material title, course, description, and HTTPS/HTTP link; students can browse, open linked resources, and save items for the current browser session.

Sign-in is a UI prototype, not authentication. Library examples and newly added entries are held in browser memory and are not persisted or uploaded. The database schema includes `learning_materials`, but the API does not yet connect to PostgreSQL. Connect institutional identity, authorization, file storage, and database persistence before using real accounts or private course materials.

## Run locally

1. Start the API from `backend/`:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. In a second terminal, start the dashboard from `frontend/`:

   ```powershell
   npm install
   npm run dev
   ```

   The dashboard defaults to `http://localhost:8000`. Set `VITE_API_URL` in `frontend/.env.local` to override it.

3. Run the API tests from `backend/` with `python -m pytest`.

## Database

The initial schema is in `database/schema.sql`. The optimizer currently runs in memory; database persistence and migrations are the next integration step. A PostgreSQL container is available with `docker compose up -d database`.

## Android APK

Install dependencies in `apk/`, then use an Expo account with EAS Build:

```powershell
npm install
npx eas-cli build --platform android --profile preview
```

The `preview` profile is configured to output an APK. Set `EXPO_PUBLIC_API_URL` to an address reachable from the device; Android emulators can use `http://10.0.2.2:8000`, while physical devices need the computer's LAN address. An APK binary is not included in this source scaffold.