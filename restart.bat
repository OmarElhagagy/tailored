@echo off
echo Killing all Node.js processes...
taskkill /F /IM node.exe
timeout /t 2

echo Starting application...
cd /d C:\Users\Omar\Desktop\tailored\Tailors
npm start 