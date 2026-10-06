@echo off
title HELPHUB - Push to GitHub
echo ===================================================
echo   Pushing HELPHUB to GitHub Repository
echo   Target: https://github.com/mohandasj390-dotcom/HELPHUB.git
echo   Branch: main
echo ===================================================
echo.

"C:\Users\HP\AppData\Local\GitHubDesktop\app-3.6.5\resources\app\git\cmd\git.exe" push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ===================================================
    echo   [SUCCESS] Code pushed successfully to GitHub!
    echo   You can now go back to Vercel and click Deploy!
    echo ===================================================
) else (
    echo ===================================================
    echo   [INFO] If prompted, please complete the GitHub
    echo   sign-in popup to authorize the push.
    echo ===================================================
)
echo.
pause
