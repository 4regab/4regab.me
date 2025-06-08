# Quick Deployment Script for Windows PowerShell
# Run this script before deploying to Render

Write-Host "🚀 4regab.me Translation API Deployment Helper (Render)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating from template..." -ForegroundColor Gray
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env - Please edit it to add your GEMINI_API_KEY" -ForegroundColor Green
    Write-Host "📝 Open .env and replace 'your_gemini_api_key_here' with your actual API key" -ForegroundColor Yellow
    Write-Host ""
    pause
}

# Check if GEMINI_API_KEY is set in .env
$envContent = Get-Content ".env" -Raw
if ($envContent -match "GEMINI_API_KEY=your_gemini_api_key_here") {
    Write-Host "❌ Please set your GEMINI_API_KEY in .env first!" -ForegroundColor Red
    Write-Host "📝 Edit .env and replace 'your_gemini_api_key_here' with your actual API key" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Environment configuration looks good!" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "❌ Dependency installation failed!" -ForegroundColor Red
    pause
    exit 1
}

# Build the project for Render
Write-Host "🔨 Building project for Render..." -ForegroundColor Yellow
npm run render-build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    pause
    exit 1
}

# Test the server locally
Write-Host ""
Write-Host "🧪 Testing server locally..." -ForegroundColor Yellow
Write-Host "Starting server (press Ctrl+C to stop)..." -ForegroundColor Gray

Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "npm run render-start" -WindowStyle Normal

Write-Host ""
Write-Host "🎯 Ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps for Render deployment:" -ForegroundColor Cyan
Write-Host "  1. Push your code to GitHub" -ForegroundColor White
Write-Host "  2. Connect your GitHub repository to Render" -ForegroundColor White
Write-Host "  3. Create a new Web Service in Render with:" -ForegroundColor White
Write-Host "     - Build Command: npm run render-build" -ForegroundColor Gray
Write-Host "     - Start Command: npm run render-start" -ForegroundColor Gray
Write-Host "     - Or use the render.yaml file for automatic configuration" -ForegroundColor Gray
Write-Host "  4. Set environment variables in Render dashboard:" -ForegroundColor White
Write-Host "     - GEMINI_API_KEY=your_api_key_here" -ForegroundColor Gray
Write-Host "     - NODE_ENV=production" -ForegroundColor Gray
Write-Host "  5. Deploy and test at your-app.onrender.com/api/health" -ForegroundColor White
Write-Host ""
Write-Host "📝 For detailed instructions, see README.md" -ForegroundColor Yellow
Write-Host ""
pause
Write-Host "💡 Local testing:" -ForegroundColor Cyan
Write-Host "  - Start dev server: npm run dev" -ForegroundColor White
Write-Host "  - Test API at: http://localhost:5173/test-translation-api.html" -ForegroundColor White
Write-Host ""

# Ask if user wants to start dev server
$response = Read-Host "🚀 Start development server now? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "Starting development server..." -ForegroundColor Green
    npm run dev
}
