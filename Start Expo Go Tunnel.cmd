@echo off
set "PROJECT_DIR=%~dp0"

start "GameTracker Expo Go Tunnel" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%PROJECT_DIR%'; Write-Host 'Starting Expo Go through tunnel...' -ForegroundColor Green; Write-Host 'Keep this window open while using the app.'; npx expo start --tunnel --clear"
