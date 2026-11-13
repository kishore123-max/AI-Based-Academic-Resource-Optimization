# CampusFlow

CampusFlow is an academic resource planning starter project. It contains a responsive web dashboard, a FastAPI optimization service, SQLite/MySQL/PostgreSQL persistence for basic records, and an Expo Android client.

## Project layout

- `frontend/` - React, TypeScript, and Vite web dashboard
- `backend/` - FastAPI API and weighted-priority resource optimizer
- `database/` - database schema and notes
- `apk/` - Expo / React Native mobile app and APK build profile

## Learning library and roles

The web dashboard includes Student, Staff, and Academic role selection, searchable resources, and these library categories: notes / study materials, educational videos, previous year question papers, e-books, lab materials, faculty materials, and assignments. Staff and Academic roles can add a material title, course, description, and HTTPS/HTTP link; students can browse, open linked resources, and save items for the current browser session.

Sign-in is a UI prototype, not authentication. The dashboard's sample and newly added library entries remain in browser memory; the frontend does not yet call the API's persistence endpoints. The API can store records in SQLite, MySQL, or PostgreSQL, but authentication, authorization, and file storage are not implemented. Do not use real accounts or private course materials until those protections are added.

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

The backend defaults to SQLite for local development. Set `DATABASE_URL` to use PostgreSQL, or configure `DB_ENGINE=mysql` and the `DB_*` environment variables to use MySQL. The backend creates its basic record tables at startup. The broader schema in `database/schema.sql` includes additional inventory and request tables that the API does not currently use. A MySQL development container is available with `docker compose up -d database`.

## Deploy the backend to Render

The root `render.yaml` defines the FastAPI web service and its PostgreSQL database. In Render, create a new Blueprint from this repository and choose the PostgreSQL plan before provisioning. Set `CORS_ORIGINS` to the deployed frontend's exact origin(s); the Blueprint asks for this value because the frontend URL is deployment-specific. The API health check is available at `/health`.

To deploy the frontend separately, build `frontend/` with `npm run build` and publish `frontend/dist`. Set its `VITE_API_URL` to the deployed API's `https://...onrender.com` URL, and add that frontend origin to the API's `CORS_ORIGINS`.

## Android APK

Install dependencies in `apk/`, then use an Expo account with EAS Build:

```powershell
npm install
npx eas-cli build --platform android --profile preview
```

The `preview` profile is configured to output an APK. Set `EXPO_PUBLIC_API_URL` to an address reachable from the device; Android emulators can use `http://10.0.2.2:8000`, while physical devices need the computer's LAN address. An APK binary is not included in this source scaffold.