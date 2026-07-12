@echo off
echo Starting AI Companion (backend + frontend)...

start "AI Companion - BACKEND" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0"

timeout /t 3 /nobreak >nul

start "AI Companion - FRONTEND" cmd /k "cd /d %~dp0frontend && npx expo start -c"

echo Both started in separate windows. You can close this one.
