@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ============================================================
REM  QAMind — Start local LLM stack (double-click this file)
REM  Starts: Ollama + QAMindWorker (FastAPI on port 8000)
REM ============================================================

REM --- Edit these paths if your folders differ ---
set "QAMIND_WORKER_DIR=C:\Users\Admin\OneDrive\Attachments\Desktop\QAMindWorker"
set "OLLAMA_APP=%LOCALAPPDATA%\Programs\Ollama\Ollama.exe"
set "OLLAMA_MODEL=qwen2.5:14b-instruct-q4_K_M"
set "WORKER_PORT=8000"

REM When double-clicked, reopen in a window that STAYS OPEN on errors
if /I not "%~1"=="RUN" (
  start "QAMind LLM Launcher" cmd /k ""%~f0" RUN"
  exit /b 0
)

title QAMind Local LLM Launcher
color 0A
echo.
echo  ============================================
echo   QAMind Local LLM Launcher
echo  ============================================
echo.

call :CheckTailscale
call :CheckOllama
if errorlevel 1 goto :Failed

call :CheckModel
call :CheckWorker
if errorlevel 1 goto :Failed

echo.
echo  ============================================
echo   Ready for gpt.qamind.ai and QAMind recordings
echo   - Ollama:  http://127.0.0.1:11434
echo   - Worker:  http://127.0.0.1:%WORKER_PORT%
echo   - Tailscale IP should be: 100.118.124.47
echo  ============================================
echo.
echo  Leave the "QAMind Worker" window open while using the app.
echo.
goto :Done

:Failed
echo.
echo  ============================================
echo   Something failed. Read the messages above.
echo  ============================================
echo.
goto :Done

:Done
echo Press any key to close this window...
pause >nul
exit /b 0

REM ---------- Subroutines (no labels inside IF blocks) ----------

:CheckTailscale
echo [1/4] Checking Tailscale...
where tailscale >nul 2>&1
if errorlevel 1 (
  echo       Tailscale CLI not found - skip if already running in tray.
  exit /b 0
)
tailscale status >nul 2>&1
if errorlevel 1 (
  echo       Starting Tailscale...
  start "" tailscale up
  timeout /t 3 /nobreak >nul
) else (
  echo       Tailscale is connected.
)
exit /b 0

:CheckOllama
echo [2/4] Checking Ollama on port 11434...
call :OllamaPing
if not errorlevel 1 (
  echo       Ollama is already running.
  exit /b 0
)

echo       Starting Ollama...
if exist "%OLLAMA_APP%" (
  start "" "%OLLAMA_APP%"
) else (
  where ollama >nul 2>&1
  if errorlevel 1 (
    echo ERROR: Ollama not found. Install from https://ollama.com/download
    exit /b 1
  )
  start "Ollama Server" /MIN cmd /c "ollama serve"
)

echo       Waiting for Ollama to start (up to 60 seconds)...
set "TRIES=0"
:WaitOllama
timeout /t 2 /nobreak >nul
call :OllamaPing
if not errorlevel 1 (
  echo       Ollama is up.
  exit /b 0
)
set /a TRIES+=1
if !TRIES! LSS 30 goto WaitOllama

echo ERROR: Ollama did not start within 60 seconds.
exit /b 1

:OllamaPing
curl.exe -s -m 3 http://127.0.0.1:11434/api/tags >nul 2>&1
exit /b %ERRORLEVEL%

:CheckModel
echo [3/4] Checking model %OLLAMA_MODEL%...
where ollama >nul 2>&1
if errorlevel 1 (
  echo ERROR: ollama command not in PATH.
  exit /b 1
)
ollama list | findstr /I /C:"%OLLAMA_MODEL%" >nul 2>&1
if not errorlevel 1 (
  echo       Model found.
  exit /b 0
)
echo       Pulling model (first time may take several minutes)...
ollama pull %OLLAMA_MODEL%
if errorlevel 1 (
  echo ERROR: Failed to pull model %OLLAMA_MODEL%
  exit /b 1
)
exit /b 0

:CheckWorker
echo [4/4] Starting QAMindWorker on port %WORKER_PORT%...
if not exist "%QAMIND_WORKER_DIR%\venv\Scripts\python.exe" (
  echo ERROR: Worker venv not found at:
  echo   %QAMIND_WORKER_DIR%\venv\Scripts\python.exe
  echo Edit QAMIND_WORKER_DIR at the top of this batch file.
  exit /b 1
)

curl.exe -s -m 2 http://127.0.0.1:%WORKER_PORT%/docs >nul 2>&1
if not errorlevel 1 (
  echo       Worker already running on port %WORKER_PORT%.
  exit /b 0
)

start "QAMind Worker" /D "%QAMIND_WORKER_DIR%" cmd /k "%QAMIND_WORKER_DIR%\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port %WORKER_PORT%"
echo       Worker window opened - keep it open.
exit /b 0
