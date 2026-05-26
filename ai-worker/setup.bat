@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0"
set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "VENV_DIR=%ROOT_DIR%\.venv"

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "PYTHON_BIN=py -3"
) else (
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set "PYTHON_BIN=python"
    ) else (
        echo Python 3 was not found. Install Python 3.11+ and run this script again.
        exit /b 1
    )
)

echo Setting up AI worker in %ROOT_DIR%

if not exist "%VENV_DIR%" (
    %PYTHON_BIN% -m venv "%VENV_DIR%"
    if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%
    echo Created virtual environment at %VENV_DIR%
) else (
    echo Virtual environment already exists at %VENV_DIR%
)

set "VENV_PYTHON=%VENV_DIR%\Scripts\python.exe"
if not exist "%VENV_PYTHON%" (
    echo Could not find %VENV_PYTHON%.
    exit /b 1
)

"%VENV_PYTHON%" -m pip install --upgrade pip
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

"%VENV_PYTHON%" -m pip install -r "%ROOT_DIR%\requirements.txt"
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

if not exist "%ROOT_DIR%\temp" mkdir "%ROOT_DIR%\temp"
if not exist "%ROOT_DIR%\logs" mkdir "%ROOT_DIR%\logs"

if not exist "%ROOT_DIR%\.env" (
    copy "%ROOT_DIR%\.env.example" "%ROOT_DIR%\.env" >nul
    echo Created ai-worker\.env from .env.example
) else (
    echo ai-worker\.env already exists
)

echo.
echo AI worker setup complete.
echo.
echo Next steps:
echo 1. Add OPENAI_API_KEY to ai-worker\.env and to the Laravel .env used by queue workers.
echo 2. Set AI_WORKER_PYTHON in Laravel .env to:
echo    %VENV_PYTHON%
echo 3. From the Laravel project root, run your queue worker:
echo    php artisan queue:work
echo 4. Manually test the worker with:
echo    "%VENV_PYTHON%" "%ROOT_DIR%\worker.py" --task transcribe --audio-path C:\path\to\audio.webm
echo.

endlocal
