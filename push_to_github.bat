@echo off
echo ===================================================
echo Pushing ECTO // MEDEVAC to GitHub:
echo https://github.com/saipavangeddamuri/Techpulse_project.git
echo ===================================================
echo.
"%~dp0.tools\git\cmd\git.exe" push -u origin main
echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Code pushed successfully to GitHub!
) else (
    echo.
    echo [NOTE] GitHub requires a Personal Access Token (PAT) for HTTPS pushes.
    echo 1. Generate token: https://github.com/settings/tokens (check 'repo' scope)
    echo 2. When prompted:
    echo    Username: saipavangeddamuri
    echo    Password: <your_personal_access_token>
)
pause
