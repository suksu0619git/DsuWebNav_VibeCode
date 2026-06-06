@echo off
title AI Course Scheduler Run Script
echo ==========================================
echo Starting FastAPI Backend...
echo ==========================================
start "Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && uvicorn main:app --reload"

echo ==========================================
echo Starting React Frontend (Vite)...
echo ==========================================
start "Frontend (React)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo ==========================================
echo Both servers are launching in separate windows!
echo Opening browser in a moment...
echo ==========================================
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo You can close this window now.
pause
