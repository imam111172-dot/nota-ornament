@echo off
title Nota Toko - Server Lokal
cd /d "%~dp0"

set PY=python
where python >nul 2>nul || set PY=py
where %PY% >nul 2>nul || (
  echo.
  echo Python tidak ditemukan di komputer ini.
  echo Anda tetap bisa memakai aplikasi dengan klik dua kali "index.html".
  echo.
  pause
  exit /b 1
)

echo ============================================
echo    NOTA TOKO - SERVER LOKAL
echo ============================================
echo.
echo Di LAPTOP ini:
echo    http://localhost:8931
echo    (browser akan terbuka sendiri sebentar lagi)
echo.
echo Di HP - harus satu WiFi dengan laptop ini:
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=* delims= " %%B in ("%%A") do echo    http://%%B:8931
)
echo.
echo Agar jadi aplikasi berikon sendiri:
echo    Chrome  -^> menu titik tiga -^> Cast, Save and Share -^> Install page as app
echo    Edge    -^> menu titik tiga -^> Apps -^> Install this site as an app
echo    Di HP   -^> menu titik tiga -^> Add to Home screen
echo.
echo Biarkan jendela ini terbuka selama aplikasi dipakai.
echo Tekan Ctrl+C lalu tutup jendela untuk berhenti.
echo ============================================
echo.

start "" /min powershell -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:8931/index.html'"
%PY% -m http.server 8931
pause
