@echo off
title VERITAS Research Intelligence - Backend
cd /d "%~dp0backend"
echo [VERITAS Engine] Starting FastAPI Backend on http://127.0.0.1:8000...
set PYTHONPATH=.
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause

