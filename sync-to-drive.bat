@echo off
REM ============================================================
REM  Sao luu source code tu folder local len Google Drive
REM  (KHONG copy node_modules / dist - chi copy ma nguon)
REM ============================================================
set "DRIVE=G:\My Drive\TL BAN HANG\TL BAN HANG PSVHOME\00 CLAUDE LYNK\DATA CLAUDE\CRM PSV"
cd /d "%~dp0"
echo Dang dong bo ma nguon len Google Drive...
robocopy "%~dp0." "%DRIVE%" /XD node_modules dist .vite .git /XF *.log /NFL /NDL /NJH /NJS
echo.
echo Da dong bo xong.
pause
