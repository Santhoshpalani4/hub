@echo off
echo =========================================================
echo  🚀 STARTING HELPHUB FULL-STACK PLATFORM
echo =========================================================
echo.
echo Compiling Java Backend Server...
if not exist bin mkdir bin
javac -d bin src\main\java\com\helphub\HelpHubServer.java
if %errorlevel% neq 0 (
    echo ❌ Compilation failed! Please ensure JDK 21+ is installed.
    pause
    exit /b %errorlevel%
)

echo Starting Java Backend & Web Server on http://localhost:8081...
java -cp bin com.helphub.HelpHubServer
pause
