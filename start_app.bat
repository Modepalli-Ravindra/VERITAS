@echo off
title Launch VERITAS Research Intelligence & Integrity Studio
cd /d "%~dp0"

echo ======================================================================
echo          VERITAS // Academic Research & Integrity Ecosystem
echo          Turnitin, DrillBit, SciSpace & QuillBot Alternative
echo ======================================================================
echo.
echo [1/3] Launching FastAPI Backend (Port 8000)...
start "VERITAS Backend" cmd /c "call run_backend.bat"

echo [2/3] Launching Next.js Studio UI (Port 3000)...
start "VERITAS Frontend" cmd /c "call run_frontend.bat"

echo [3/3] Waiting 4 seconds for services to initialize...
timeout /t 4 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo VERITAS Ecosystem is active!
echo Both backend and frontend servers are running in separate windows.
echo To stop, simply close the respective terminal windows.
echo.
pause

