@echo off
echo ========================================================
echo   Launching Satosphere Bitcoin Terminal (Backend + Frontend)
echo ========================================================
echo.
echo Starting Backend Flask API Server on http://127.0.0.1:5000...
start "Satosphere Backend" cmd /k "cd backend && python app.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend Vite Server on http://127.0.0.1:5173...
start "Satosphere Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Both services are starting!
echo   Frontend: http://127.0.0.1:5173
echo   Backend:  http://127.0.0.1:5000
echo ========================================================
pause
