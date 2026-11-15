@echo off
rem One-command local start (Windows): installs deps on first run, then runs API (:8000) and web app (:5173).
cd /d "%~dp0"

if not exist backend\.venv (
  echo Setting up backend virtualenv...
  py -m venv backend\.venv || python -m venv backend\.venv
  backend\.venv\Scripts\python.exe -m pip install -q -r backend\requirements.txt
)
if not exist frontend\node_modules (
  echo Installing frontend dependencies...
  pushd frontend
  call npm install --no-audit --no-fund
  popd
)

start "CampusFlow API" /d backend cmd /k ".venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo.
echo   App: http://localhost:5173    API: http://localhost:8000/health
echo   Login: admin@campus.edu / Demo@1234   or   student@campus.edu / User@1234
echo.
cd frontend
call npm run dev
