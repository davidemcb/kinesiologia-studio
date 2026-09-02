#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

// Try to use chalk for colors, fallback to basic colors if not available
let chalk;
try {
  chalk = require('chalk');
} catch {
  // Fallback simple color implementation
  chalk = {
    bold: (text) => `\x1b[1m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
  };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ANSI codes for colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function print(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function printHeader(text) {
  console.log('\n' + colors.cyan + colors.bright + '=' .repeat(60) + colors.reset);
  console.log(colors.cyan + colors.bright + text.padStart(text.length + (60 - text.length) / 2) + colors.reset);
  console.log(colors.cyan + colors.bright + '=' .repeat(60) + colors.reset + '\n');
}

function printSection(text) {
  console.log('\n' + colors.blue + colors.bright + '> ' + text + colors.reset);
}

function printSuccess(text) {
  console.log(colors.green + '✓ ' + text + colors.reset);
}

function printError(text) {
  console.log(colors.red + '✗ ' + text + colors.reset);
}

function printWarning(text) {
  console.log(colors.yellow + '⚠ ' + text + colors.reset);
}

function printInfo(text) {
  console.log(colors.cyan + 'ℹ ' + text + colors.reset);
}

// Validation functions
function isValidCustomerId(customerId) {
  // Google Ads Customer ID format: typically 10 digits, sometimes with hyphens (xxx-xxx-xxxx)
  const cleanId = customerId.replace(/-/g, '');
  return /^\d{10}$/.test(cleanId) && customerId.length >= 10;
}

function isValidDeveloperToken(token) {
  // Developer token is typically an alphanumeric string
  return token.length >= 20 && /^[a-zA-Z0-9-_]+$/.test(token);
}

function isValidClientId(clientId) {
  // OAuth Client ID typically ends with .apps.googleusercontent.com
  return clientId.includes('.apps.googleusercontent.com') || (clientId.length > 20 && /^[a-zA-Z0-9._-]+$/.test(clientId));
}

function isValidClientSecret(secret) {
  // OAuth Client Secret is a base64-like string
  return secret.length >= 20 && /^[a-zA-Z0-9._-]+$/.test(secret);
}

function isValidRefreshToken(token) {
  // Refresh token is a long string
  return token.length >= 50;
}

// Question helper with validation
function askQuestion(question, validator = null, validateMessage = 'Invalid input') {
  return new Promise((resolve) => {
    const askRecursive = () => {
      rl.question(colors.bright + question + colors.reset, (answer) => {
        if (validator && !validator(answer)) {
          printError(validateMessage);
          askRecursive();
        } else {
          resolve(answer.trim());
        }
      });
    };
    askRecursive();
  });
}

// Check if .env already exists
function envFileExists() {
  const envPath = path.join(__dirname, '.env');
  return fs.existsSync(envPath);
}

// Read existing .env
function readExistingEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    return fs.readFileSync(envPath, 'utf-8');
  }
  return '';
}

// Save credentials to .env
function saveEnvFile(credentials) {
  const envPath = path.join(__dirname, '.env');
  const envContent = `# Google Ads API Configuration
GOOGLE_ADS_CUSTOMER_ID=${credentials.customerId}
GOOGLE_ADS_DEVELOPER_TOKEN=${credentials.developerToken}
GOOGLE_ADS_CLIENT_ID=${credentials.clientId}
GOOGLE_ADS_CLIENT_SECRET=${credentials.clientSecret}
GOOGLE_ADS_REFRESH_TOKEN=${credentials.refreshToken}

# Server Configuration
PORT=3000
NODE_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  printSuccess('Saved credentials to .env');
}

// Add .env to .gitignore
function updateGitignore() {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  let gitignoreContent = '';

  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  }

  if (!gitignoreContent.includes('.env')) {
    gitignoreContent += (gitignoreContent.endsWith('\n') ? '' : '\n') + '.env\n.env.local\n';
    fs.writeFileSync(gitignorePath, gitignoreContent);
    printSuccess('Added .env to .gitignore');
  } else {
    printInfo('.env is already in .gitignore');
  }
}

// Install npm dependencies
function installDependencies() {
  return new Promise((resolve, reject) => {
    printSection('Installing npm dependencies...');

    const npm = spawn('npm', ['install'], {
      cwd: __dirname,
      stdio: 'inherit',
    });

    npm.on('close', (code) => {
      if (code === 0) {
        printSuccess('Dependencies installed successfully');
        resolve();
      } else {
        printError('Failed to install dependencies');
        reject(new Error('npm install failed'));
      }
    });
  });
}

// Start the server
function startServer() {
  return new Promise((resolve) => {
    printSection('Starting Google Ads API server...');
    printInfo('Server will run on http://localhost:3000');
    printInfo('Press Ctrl+C to stop the server\n');

    const server = spawn('npm', ['start'], {
      cwd: __dirname,
      stdio: 'inherit',
    });

    // Handle server shutdown
    process.on('SIGINT', () => {
      print('\nShutting down server...', 'yellow');
      server.kill();
      process.exit(0);
    });

    resolve();
  });
}

// Main setup wizard
async function runSetup() {
  try {
    printHeader('Google Ads Dashboard Setup Wizard');

    printInfo('This wizard will help you set up the Google Ads API integration.');
    printWarning('Make sure you have:');
    console.log('  1. A Google Ads account with API access enabled');
    console.log('  2. OAuth 2.0 credentials from Google Cloud Console');
    console.log('  3. A valid Developer Token');
    console.log('  4. A valid Refresh Token\n');

    // Check if .env already exists
    if (envFileExists()) {
      print('\nAn existing .env file was found.', 'yellow');
      const overwrite = await askQuestion('Do you want to overwrite it? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
        print('\nSetup cancelled. Using existing .env file.', 'blue');
        rl.close();
        return;
      }
    }

    // Collect credentials
    printSection('Enter your Google Ads credentials:');

    print('\n1. Customer ID (format: 123-456-7890 or 1234567890):', 'cyan');
    const customerId = await askQuestion('   Google Ads Customer ID: ',
      isValidCustomerId,
      '   Invalid Customer ID. Please use format: 123-456-7890 (10 digits)');

    print('\n2. Developer Token (from Google Cloud Console):', 'cyan');
    const developerToken = await askQuestion('   Developer Token: ',
      isValidDeveloperToken,
      '   Invalid Developer Token. Must be at least 20 characters.');

    print('\n3. OAuth Client ID (from Google Cloud Console):', 'cyan');
    const clientId = await askQuestion('   OAuth Client ID: ',
      isValidClientId,
      '   Invalid Client ID. Should be a long string or end with .apps.googleusercontent.com');

    print('\n4. OAuth Client Secret (from Google Cloud Console):', 'cyan');
    const clientSecret = await askQuestion('   OAuth Client Secret: ',
      isValidClientSecret,
      '   Invalid Client Secret. Must be at least 20 characters.');

    print('\n5. Refresh Token (obtained during OAuth flow):', 'cyan');
    const refreshToken = await askQuestion('   Refresh Token: ',
      isValidRefreshToken,
      '   Invalid Refresh Token. Must be at least 50 characters.');

    // Display summary
    printSection('Summary of your configuration:');
    print(`Customer ID: ${customerId}`, 'green');
    print(`Developer Token: ${developerToken.substring(0, 10)}...`, 'green');
    print(`Client ID: ${clientId.substring(0, 20)}...`, 'green');
    print(`Client Secret: ${clientSecret.substring(0, 10)}...`, 'green');
    print(`Refresh Token: ${refreshToken.substring(0, 20)}...`, 'green');

    const confirm = await askQuestion('\nDoes this look correct? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      print('\nSetup cancelled.', 'yellow');
      rl.close();
      return;
    }

    // Close readline before spawning child processes
    rl.close();

    // Save configuration
    saveEnvFile({
      customerId,
      developerToken,
      clientId,
      clientSecret,
      refreshToken,
    });

    // Update .gitignore
    updateGitignore();

    // Install dependencies
    try {
      await installDependencies();
    } catch (error) {
      printError('Failed to install dependencies. Please run "npm install" manually.');
      printInfo('After installing, run "npm start" to start the server.');
      process.exit(1);
    }

    // Ask if user wants to start server
    console.log('');
    const startServerResponse = await new Promise((resolve) => {
      const newRl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      newRl.question(colors.bright + 'Would you like to start the server now? (yes/no): ' + colors.reset, (answer) => {
        newRl.close();
        resolve(answer);
      });
    });

    if (startServerResponse.toLowerCase() === 'yes' || startServerResponse.toLowerCase() === 'y') {
      await startServer();
    } else {
      printSuccess('\nSetup completed successfully!');
      printInfo('To start the server later, run:');
      print('  npm start', 'cyan');
      process.exit(0);
    }
  } catch (error) {
    printError(`Setup failed: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// Run the setup
runSetup().catch((error) => {
  printError(`Setup error: ${error.message}`);
  process.exit(1);
});
