#!/bin/bash

echo "Starting Tailors Platform locally..."

# Check if .env file exists in backend, if not create it
if [ ! -f "./sewing-platform-backend/.env" ]; then
  echo "Creating .env file for backend..."
  echo "MONGODB_URI=mongodb://localhost:27017/tailors-platform" > ./sewing-platform-backend/.env
  echo "PORT=5000" >> ./sewing-platform-backend/.env
  echo "JWT_SECRET=local-development-secret-key" >> ./sewing-platform-backend/.env
  echo "FRONTEND_URL=http://localhost:3000" >> ./sewing-platform-backend/.env
fi

# Make sure MongoDB is installed and running
if command -v mongod &> /dev/null; then
  echo "Make sure MongoDB is running on your system"
else
  echo "MongoDB does not appear to be installed. Please install MongoDB to run the backend."
  echo "Visit: https://www.mongodb.com/docs/manual/installation/"
fi

# Start backend in a new terminal
echo "Starting backend server..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/sewing-platform-backend\" && npm install && npm run dev"'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux with xterm
  xterm -e "cd \"$(pwd)/sewing-platform-backend\" && npm install && npm run dev" &
else
  # Generic - just print instructions
  echo "Please open a new terminal and run:"
  echo "cd \"$(pwd)/sewing-platform-backend\" && npm install && npm run dev"
fi

# Start frontend in a new terminal
echo "Starting frontend client..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/Tailors-Client\" && npm install && npm run dev"'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux with xterm
  xterm -e "cd \"$(pwd)/Tailors-Client\" && npm install && npm run dev" &
else
  # Generic - just print instructions
  echo "Please open a new terminal and run:"
  echo "cd \"$(pwd)/Tailors-Client\" && npm install && npm run dev"
fi

# Start admin app in a new terminal
echo "Starting admin app..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/app\" && npm install && npm run dev"'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux with xterm
  xterm -e "cd \"$(pwd)/app\" && npm install && npm run dev" &
else
  # Generic - just print instructions
  echo "Please open a new terminal and run:"
  echo "cd \"$(pwd)/app\" && npm install && npm run dev"
fi

echo "Local environment setup complete!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000 (or the URL shown in the Vite terminal)"
echo "Admin: http://localhost:3001 (or the URL shown in the Next.js terminal)" 