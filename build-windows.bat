@echo off
REM Build the Tauri desktop installer for Windows.
REM
REM MSVC lives on E:\VSBuildTools; the Windows SDK is always installed under
REM C:\Program Files (x86)\Windows Kits (Microsoft gives no choice there).
REM LIB/INCLUDE are set by hand instead of via vcvarsall.bat, because the
REM sandbox blocks reg.exe which vcvarsall needs.

set "VC=E:\VSBuildTools\VC\Tools\MSVC\14.44.35207"
set "SDK=C:\Program Files (x86)\Windows Kits\10"
set "SDKVER=10.0.26100.0"

if not exist "%VC%\bin\Hostx64\x64\link.exe" (
  echo [!] MSVC not found at %VC% - fix the VC variable.
  exit /b 1
)

set "PATH=%VC%\bin\Hostx64\x64;%SDK%\bin\%SDKVER%\x64;C:\Users\20226\.rustup\toolchains\stable-x86_64-pc-windows-msvc\bin;%PATH%"
set "LIB=%VC%\lib\x64;%SDK%\Lib\%SDKVER%\ucrt\x64;%SDK%\Lib\%SDKVER%\um\x64"
set "INCLUDE=%VC%\include;%SDK%\Include\%SDKVER%\ucrt;%SDK%\Include\%SDKVER%\um;%SDK%\Include\%SDKVER%\shared;%SDK%\Include\%SDKVER%\winrt;%SDK%\Include\%SDKVER%\cppwinrt"

cd /d "%~dp0client"
REM Pass extra flags through, e.g. build-windows.bat --debug
npm run tauri:build -- %*
