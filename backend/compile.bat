@echo off
echo =======================================================
echo Compiling Stockverse C CGI Backend...
echo =======================================================

gcc -Wall -O2 stockverse.c cgi_handler.c -o stockverse.cgi.exe
if %ERRORLEVEL% equ 0 (
    copy /Y stockverse.cgi.exe stockverse.cgi >nul
    echo.
    echo [SUCCESS] Compilation successful!
    echo Binary created: stockverse.cgi.exe and stockverse.cgi
    echo.
    echo To deploy to XAMPP:
    echo Copy stockverse.cgi to C:\xampp\cgi-bin\
    echo Copy frontend files to C:\xampp\htdocs\stockverse\
) else (
    echo.
    echo [ERROR] Compilation failed. Please check gcc installation.
)
pause
