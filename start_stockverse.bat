@echo off
title Stockverse - Virtual Stock Trading Simulator (Apache HTTP Server + C CGI)
echo ====================================================================
echo  Stockverse - Virtual Stock Trading Simulator
echo  Apache HTTP Server + C CGI Backend Deployment
echo ====================================================================
echo.

:: 1. Check if Apache is already running on port 80
powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue) | Measure-Object | Select-Object -ExpandProperty Count" > "%temp%\port80_check.txt"
set /p PORT80_COUNT=<"%temp%\port80_check.txt"

if "%PORT80_COUNT%"=="0" (
    echo Starting Apache HTTP Server from C:\xampp\apache\bin\httpd.exe ...
    if exist "C:\xampp\apache\bin\httpd.exe" (
        start "" "C:\xampp\apache\bin\httpd.exe"
        timeout /t 2 /nobreak >nul
    ) else (
        echo Warning: C:\xampp\apache\bin\httpd.exe not found. Falling back to python server.
        start "" http://localhost:8000
        python -m http.server 8000
        exit /b
    )
) else (
    echo Apache HTTP Server is already running on port 80!
)

echo.
echo ====================================================================
echo  Opening Stockverse at: http://localhost/stockverse/
echo  CGI Endpoint active at: http://localhost/cgi-bin/stockverse.cgi
echo ====================================================================
echo.

start "" "http://localhost/stockverse/"
