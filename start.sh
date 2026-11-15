#!/usr/bin/env bash
# One-command local start: installs deps on first run, then runs API (:8000) and web app (:5173).
set -e
cd "$(dirname "$0")"

if [ ! -d backend/.venv ]; then
  echo "Setting up backend virtualenv..."
  python3 -m venv backend/.venv
  backend/.venv/bin/pip install -q -r backend/requirements.txt
fi
if [ ! -d frontend/node_modules ]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install --no-audit --no-fund)
fi

(cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000) &
API_PID=$!
trap 'kill $API_PID 2>/dev/null' EXIT INT TERM

echo
echo "  App: http://localhost:5173   API: http://localhost:8000/health"
echo "  Login: admin@campus.edu / Demo@1234   |   student@campus.edu / User@1234"
echo
cd frontend && npm run dev
