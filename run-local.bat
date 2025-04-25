@echo off
echo Starting Tailors Platform locally...

:: Check if .env file exists in backend, if not create it
if not exist "./sewing-platform-backend/.env" (
  echo Creating .env file for backend...
  echo MONGODB_URI=mongodb://localhost:27017/tailors-platform > ./sewing-platform-backend/.env
  echo PORT=5000 >> ./sewing-platform-backend/.env
  echo JWT_SECRET=local-development-secret-key >> ./sewing-platform-backend/.env
  echo FRONTEND_URL=http://localhost:3000 >> ./sewing-platform-backend/.env
)

:: Start backend server in one terminal
start cmd /k "cd sewing-platform-backend && echo Installing backend dependencies... && npm install && echo Starting backend server... && npm run dev"

:: Start frontend client in another terminal
start cmd /k "cd Tailors-Client && echo Installing frontend dependencies... && npm install && echo Starting frontend client... && npm run dev"

:: Start Next.js admin app in another terminal
start cmd /k "cd app && echo Installing admin app dependencies... && npm install && echo Starting admin app... && npm run dev"

echo Local environment setup complete!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000 (or the URL shown in the Vite terminal)
echo Admin: http://localhost:3001 (or the URL shown in the Next.js terminal)
echo.
echo Press any key to exit this window...
pause > nul 