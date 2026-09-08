@echo off
chcp 65001 >nul
cd /d "%~dp0tools\cutpost"
if not exist "start.bat" (
  echo 找不到 tools\cutpost\start.bat
  pause
  exit /b 1
)
call start.bat
