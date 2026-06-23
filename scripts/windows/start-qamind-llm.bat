@echo off
setlocal EnableExtensions

REM ============================================================
REM  QAMind — Start local LLM stack (double-click this file)
REM  Starts: Ollama + QAMindWorker (FastAPI on port 8000)
REM ============================================================

REM --- Edit these paths if your folders differ ---
set "QAMIND_WORKER_DIR=C:\Users\Admin\OneDrive\Attachments\Desktop\QAMindWorker"
set "OLLAMA_APP=%LOCALAPPDATA%\Programs\Ollama\Ollama.exe"
set "OLLAMA_MODEL=qwen2.5:14b-instruct-q4_K_M"
set "WORKER_PORT=8000"

title QAMind Local LLM Launcher
color 0A
echo.
echo  ============================================
echo   QAMind Local LLM Launcher
echo  ============================================
echo.

REM --- 1) Tailscale (optional but recommended) ---
where tailscale >nul 2>&1
if %ERRORLEVEL%==0 (
  echo [1/4] Checking Tailscale...
  tailscale status >nul 2>&1
  if errorlevel 1 (
    echo       Starting Tailscale...
    start "" tailscale up
    timeout /t 3 /nobreak >nul
  ) else (
    echo       Tailscale is connected.
  )
) else (
  echo [1/4] Tailscale CLI not found - skip if already running in tray.
)

REM --- 2) Ollama ---
echo [2/4] Checking Ollama on port 11434...
curl.exe -s -m 3 http://127.0.0.1:11434/api/tags >nul 2>&1
if %ERRORLEVEL%==0 (
  echo       Ollama is already running.
) else (
  echo       Starting Ollama...
  if exist "%OLLAMA_APP%" (
    start "" "%OLLAMA_APP%"
  ) else (
    where ollama >nul 2>&1
    if %ERRORLEVEL%==0 (
      start "Ollama Server" /MIN cmd /c "ollama serve"
    ) else (
      echo ERROR: Ollama not found. Install from https://ollama.com/download
      pause
      exit /b 1
    )
  )
  echo       Waiting for Ollama to start...
  set /a WAIT=0
  :wait_ollama
  timeout /t 2 /nobreak >nul
  curl.exe -s -m 3 http://127.0.0.1:11434/api/tags >nul 2>&1
  if %ERRORLEVEL%==0 goto ollama_ready
  set /a WAIT+=1
  if %WAIT% LSS 30 goto wait_ollama
  echo ERROR: Ollama did not start within 60 seconds.
  pause
  exit /b 1
  :ollama_ready
  echo       Ollama is up.
)

REM --- 3) Ensure model is available ---
echo [3/4] Checking model %OLLAMA_MODEL%...
ollama list | findstr /I /C:"%OLLAMA_MODEL%" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo       Model found.
) else (
  echo       Pulling model (first time may take several minutes)...
  ollama pull %OLLAMA_MODEL%
)

REM --- 4) QAMindWorker (FastAPI) ---
echo [4/4] Starting QAMindWorker on port %WORKER_PORT%...
if not exist "%QAMIND_WORKER_DIR%\venv\Scripts\python.exe" (
  echo ERROR: Worker venv not found at:
  echo   %QAMIND_WORKER_DIR%\venv\Scripts\python.exe
  echo Edit QAMIND_WORKER_DIR at the top of this batch file.
  pause
  exit /b 1
)

curl.exe -s -m 2 http://127.0.0.1:%WORKER_PORT%/docs >nul 2>&1
if %ERRORLEVEL%==0 (
  echo       Worker already running on port %WORKER_PORT%.
) else (
  start "QAMind Worker" cmd /k "cd /d \"%QAMIND_WORKER_DIR%\" && .\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port %WORKER_PORT%"
  echo       Worker window opened - keep it open.
)

echo.
echo  ============================================
echo   Ready for gpt.qamind.ai and QAMind recordings
echo   - Ollama:  http://127.0.0.1:11434
echo   - Worker:  http://127.0.0.1:%WORKER_PORT%
echo   - Tailscale IP should be: 100.118.124.47
echo  ============================================
echo.
echo  Leave the "QAMind Worker" window open while using the app.
echo  You can close this launcher window.
echo.
pause
