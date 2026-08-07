@echo off
:: APK 签名脚本（用 Android 默认 debug keystore）
setlocal
cd /d "%~dp0"
set APK_DIR=android\app\build\outputs\apk\debug
set UNSIGNED=app-debug-unsigned.apk
set SIGNED=pets3-app.apk

if not exist "%APK_DIR%\%UNSIGNED%" (
    echo APK not found: %APK_DIR%\%UNSIGNED%
    echo Please run gradlew assembleDebug first.
    exit /b 1
)

echo Signing APK with debug keystore...
call "%ANDROID_HOME%\build-tools\34.0.0\apksigner.bat" sign --ks "%USERPROFILE%\.android\debug.keystore" --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android "%APK_DIR%\%UNSIGNED%" --out "%SIGNED%"

if exist "%SIGNED%" (
    echo Signed APK: %SIGNED%
    echo Size:
    dir "%SIGNED%" | findstr "%SIGNED%"
) else (
    echo Failed to sign APK.
    exit /b 1
)