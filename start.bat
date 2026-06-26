@echo off
REM ============================================================
REM  PSV HOME CRM - Khoi dong moi truong phat trien (dev server)
REM ============================================================
cd /d "%~dp0"
echo.
echo   PSV HOME CRM - dang khoi dong dev server...
echo   Mo trinh duyet tai: http://localhost:5173
echo   Nhan Ctrl+C de dung.
echo.
call npm run dev
pause
