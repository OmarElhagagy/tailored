const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create necessary directories
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, 'sewing-platform-backend', 'uploads'),
    path.join(__dirname, 'sewing-platform-backend', 'utils'),
    path.join(__dirname, 'sewing-platform-backend', 'middleware')
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};

// Create .env file for backend
const createEnvFile = () => {
  const envPath = path.join(__dirname, 'sewing-platform-backend', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('Creating .env file for backend');
    const envContent = `MONGODB_URI=mongodb://localhost:27017/tailors-platform
PORT=5000
JWT_SECRET=local-development-secret-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development`;
    
    fs.writeFileSync(envPath, envContent);
  } else {
    console.log('Backend .env file already exists');
  }
};

// Install dependencies
const installDependencies = () => {
  try {
    console.log('Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('Installing backend dependencies...');
    execSync('npm install --prefix sewing-platform-backend', { stdio: 'inherit' });
    
    console.log('Installing frontend dependencies...');
    execSync('npm install --prefix Tailors-Client', { stdio: 'inherit' });
    
    console.log('Installing admin dependencies...');
    execSync('npm install --prefix app', { stdio: 'inherit' });
    
    console.log('All dependencies installed successfully!');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
  }
};

// Run setup
const runSetup = async () => {
  console.log('Setting up Tailors Platform...');
  
  createDirectories();
  createEnvFile();
  installDependencies();
  
  console.log('\nSetup complete! You can now run the application with:');
  console.log('npm start');
};

runSetup(); 