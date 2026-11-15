# CampusFlow — AI-Based Academic Resource Optimization

A campus workspace for students, faculty, department heads, and administrators: academic records, a learning library, resource planning with a weighted-priority optimizer, and a new **Campus Staff Locator**.

> ## 🔑 Demo login credentials
>
> | Role | Email | Password |
> |---|---|---|
> | **Admin / Staff** | `admin@campus.edu` | `Demo@1234` |
> | **User / Student** | `student@campus.edu` | `User@1234` |
>
> Extra accounts to explore every module: Faculty `staff@campus.edu` / `Staff@1234` · HOD `hod@campus.edu` / `Hod@1234`.
> On the login screen, click any account under **Demo accounts** to auto-fill it.
>
> ⚠️ This is **prototype sign-in**: credentials are checked in the browser (`frontend/src/auth.ts`) and the session lives in `sessionStorage`. It is not real authentication — don't use real accounts or private data.

---

## Features

| Area | What you get |
|---|---|
| **Student hub** (student) | Semester results, attendance, question-paper index, downloadable demo hall-ticket PDF, assignment upload |
| **Learning library** (all roles) | 7 categories, search across everything (press `/` to focus), add materials (staff/admin/HOD) with PDF or link, save & download |
| **AI optimization / overview** (staff, admin) | Resource availability, priority request queue, and a **Run optimization** button that calls the FastAPI optimizer |
| **Administration** (admin) | People & departments, facilities & equipment, accounts & permissions (session-only demo data) |
| **Department workspace** (HOD) | Shortage alerts, booking approvals, faculty schedules |
| **Staff Locator** *(new, all roles)* | See below |

### Campus Staff Locator (UI only)

Open **Staff Locator** in the sidebar. It uses realistic mock data (14 staff) — there is **no backend tracking or GPS**.

- **Search by email ID** with instant filtering (case-insensitive, partial match, matched text highlighted), plus **Department** and **Block** filters (including *Off campus*).
- **Staff profile & status card:** name, email, department, designation, phone, status badge (*In Cabin, In Lecture Hall, In Lab, In Meeting, Available, Off Campus*) and last-updated time.
- **Campus map view:** an SVG campus plan highlighting the staff member's block with a pulsing pin, plus a **floor indicator** (e.g. *CSE Block – 2nd Floor, Cabin 204*).
- **Quick actions** (UI-only, show toast notifications): *View Schedule*, *Send Quick Ping*, *Get Directions* (shows the route text; disabled when off campus), *Copy email*.
- Mock data lives in `frontend/src/staffData.ts`; the UI is `StaffLocator.tsx` + `locator.css`.

### UI/UX
Consistent design system (tokens in `index.css`), readable type scale, responsive layout with a mobile slide-out menu, keyboard focus styles, `Esc` closes dialogs/menus, and `prefers-reduced-motion` support.

---

## Tech stack

- **Frontend:** React 19, TypeScript, Vite 8, GSAP (login animation), jsPDF (PDF downloads)
- **Backend:** Python, FastAPI, Uvicorn, Pydantic
- **Database:** SQLite by default (auto-created); optional MySQL or PostgreSQL
- **Mobile:** Expo / React Native app in `apk/` (separate, unchanged)
- **Tests:** pytest (backend optimizer)

---

## Run locally (step by step)

**Prerequisites:** [Node.js 20+](https://nodejs.org) and [Python 3.10+](https://www.python.org/downloads/).
No `.env` file is needed — every setting has a working local default.

### Option A — one command

- **macOS / Linux:** `./start.sh`
- **Windows:** double-click `start.bat` (or run it in a terminal)

It installs dependencies on first run, then starts the API on **:8000** and the app on **:5173**.

### Option B — manual

**1. Backend** (terminal 1)

```bash
cd backend
python -m venv .venv

# macOS / Linux
source .venv/bin/activate
# Windows PowerShell
#   .\.venv\Scripts\Activate.ps1
# Windows cmd
#   .venv\Scripts\activate.bat

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**2. Frontend** (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

**3. Open** <http://localhost:5173> and sign in with a demo account above.

Check the API at <http://localhost:8000/health> (interactive docs: <http://localhost:8000/docs>).

> The frontend works on its own; only **Run optimization** needs the backend. If it's not running, you'll see a friendly "Could not reach the API" message.

### Configuration (optional)

| File | Purpose |
|---|---|
| `frontend/.env.example` → `frontend/.env.local` | `VITE_API_URL` (default `http://localhost:8000`) |
| `backend/.env.example` | `CORS_ORIGINS`, and optional database settings |

The API accepts requests from the Vite dev server on **any** `localhost` / `127.0.0.1` port, so it keeps working if 5173 is busy.

### Troubleshooting

| Problem | Fix |
|---|---|
| `Port 8000 / 5173 is already in use` | Stop the other process, or use `--port 8001` and set `VITE_API_URL=http://localhost:8001` in `frontend/.env.local` |
| `python` not found on Windows | Use `py -m venv .venv` |
| PowerShell blocks `Activate.ps1` | Run `Set-ExecutionPolicy -Scope Process Bypass` first |
| "Could not reach the API" | Start the backend (step 1) and check <http://localhost:8000/health> |
| Blank page after login | Hard refresh; sign-out clears the session (`sessionStorage`) |

### Tests & checks

```bash
cd backend  && python -m pytest        # optimizer tests
cd frontend && npm run lint && npm run build
```

---

## Project layout

```
backend/    FastAPI app (app/main.py, optimizer.py, database.py) + tests
frontend/   React app (src/Dashboard.tsx shell, Login.tsx, StaffLocator.tsx, *Workspace.tsx, auth.ts)
database/   Full SQL schema and notes
apk/        Expo / React Native client
```

## Database

SQLite is used by default (`campusflow.db` is created in the project root on first start). Set `DATABASE_URL` for PostgreSQL, or `DB_ENGINE=mysql` plus the `DB_*` variables for MySQL. A MySQL dev container is available with `docker compose up -d database` (override the default dev passwords with `MYSQL_ROOT_PASSWORD` / `MYSQL_PASSWORD`).

## Known limitations

Authentication is a prototype; library entries and admin/HOD edits are kept in browser memory (the frontend does not yet call the persistence endpoints); the Staff Locator is UI-only with mock data; no file storage.

## Deploy

`render.yaml` defines the FastAPI service + PostgreSQL on Render (set `CORS_ORIGINS` to your frontend origin). Build the frontend with `npm run build` and publish `frontend/dist`, setting `VITE_API_URL` to the API URL.

## Android APK

See `apk/README.md`. In short: `cd apk && npm install && npx eas-cli build --platform android --profile preview`.