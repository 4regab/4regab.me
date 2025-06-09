# 🚀 4regab.me Setup Script for Render Backend (PowerShell)
# This script helps you set up the project for local development and Render deployment

param(
    [switch]$SkipInstall = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up 4regab.me with Render Backend..." -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    $nodeVersionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeVersionNumber -lt 18) {
        Write-Error "Node.js version 18+ is required. You have version $nodeVersion"
        exit 1
    }
    
    Write-Success "Node.js $nodeVersion detected"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Success "npm $npmVersion detected"
} catch {
    Write-Error "npm is not installed. Please install npm and try again."
    exit 1
}

# Install dependencies
if (-not $SkipInstall) {
    Write-Info "Installing dependencies..."
    try {
        npm install
        Write-Success "Dependencies installed successfully"
    } catch {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Warning ".env file not found. Creating from .env.example..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Info "Please edit .env file and add your GEMINI_API_KEY"
        Write-Info "Get your API key from: https://makersuite.google.com/app/apikey"
    } else {
        Write-Info "Creating basic .env file..."
        "GEMINI_API_KEY=your_gemini_api_key_here" | Out-File -FilePath ".env" -Encoding UTF8
        Write-Warning "Please edit .env file and add your actual GEMINI_API_KEY"
    }
}

# Check if GEMINI_API_KEY is set
try {
    $envContent = Get-Content ".env" -ErrorAction SilentlyContinue
    if ($envContent -and ($envContent -match "your_gemini_api_key_here")) {
        Write-Warning "GEMINI_API_KEY not configured. Please set it in .env file"
    }
} catch {
    # File doesn't exist or can't be read
}

# Build the project
Write-Info "Building frontend..."
try {
    npm run build
    Write-Success "Frontend built successfully"
} catch {
    Write-Error "Failed to build frontend"
    exit 1
}

Write-Info "Building backend..."
try {
    npm run server:build
    Write-Success "Backend built successfully"
} catch {
    Write-Error "Failed to build backend"
    exit 1
}

# Test backend health
Write-Info "Testing backend configuration..."
if (Test-Path "dist/server/index.js") {
    Write-Success "Backend build artifacts found"
} else {
    Write-Error "Backend build artifacts not found"
    exit 1
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🔑 Configure your Gemini API key:" -ForegroundColor White
Write-Host "   - Edit .env file" -ForegroundColor Gray
Write-Host "   - Add GEMINI_API_KEY=your_actual_api_key" -ForegroundColor Gray
Write-Host "   - Get API key from: https://makersuite.google.com/app/apikey" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🏃 Run locally:" -ForegroundColor White
Write-Host "   - Backend: npm run server:dev" -ForegroundColor Gray
Write-Host "   - Frontend: npm run dev (in another terminal)" -ForegroundColor Gray
Write-Host "   - Both: npm run dev:server" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🚀 Deploy to Render:" -ForegroundColor White
Write-Host "   - Push code to GitHub" -ForegroundColor Gray
Write-Host "   - Create web service on Render" -ForegroundColor Gray
Write-Host "   - Set environment variables in Render dashboard" -ForegroundColor Gray
Write-Host "   - Use render.yaml for configuration" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🌐 Deploy frontend to Vercel:" -ForegroundColor White
Write-Host "   - Connect your GitHub repo to Vercel" -ForegroundColor Gray
Write-Host "   - Update src/lib/api-config.ts with your Render URL" -ForegroundColor Gray
Write-Host "   - Deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Read RENDER_BACKEND_DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Architecture:" -ForegroundColor White
Write-Host "   Frontend (Vercel) → Backend (Render) → Gemini API" -ForegroundColor Gray
Write-Host ""
Write-Success "You're all set! Happy coding! 🚀"
