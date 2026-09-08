@echo off
chcp 65001 >nul
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo 没有检测到 Python。请先安装 Python 3.10 或更高，并勾选 Add python.exe to PATH。
  pause
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo 正在创建虚拟环境...
  python -m venv .venv
)

call .venv\Scripts\activate.bat
.\.venv\Scripts\python.exe -c "import fastapi,uvicorn,requests,websockets" >nul 2>nul
if errorlevel 1 (
  echo 第一次使用，正在安装依赖，请稍等...
  python -m pip install -r requirements.txt
  if errorlevel 1 (
    echo 依赖安装失败。
    pause
    exit /b 1
  )
)

echo.
echo 即将打开 http://127.0.0.1:1780
echo 请不要关闭这个黑窗口。弹出的 Chrome 也不要关。
echo.
python -m cutpost web
if errorlevel 1 pause
