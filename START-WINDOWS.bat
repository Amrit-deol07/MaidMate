@echo off
echo ========================================
echo MaidMate MERN Website
echo ========================================
echo.
echo Make sure MongoDB is running.
echo.
echo Starting backend in a new window...
start "MaidMate Backend" cmd /k "cd server && npm install && if not exist .env copy .env.example .env && npm run seed && npm run dev"
timeout /t 3 >nul
echo Starting frontend in a new window...
start "MaidMate Frontend" cmd /k "cd client && npm install && npm run dev"
echo.
echo Open http://localhost:5173 after the frontend starts.
pause
