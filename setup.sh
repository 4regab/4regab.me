#!/usr/bin/env bash

# 🚀 4regab.me Setup Script for Render Backend
# This script helps you set up the project for local development and Render deployment

set -e

echo "🚀 Setting up 4regab.me with Render Backend..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d 'v' -f2 | cut -d '.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. You have version $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "npm $(npm --version) detected"

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status "Please edit .env file and add your GEMINI_API_KEY"
        print_status "Get your API key from: https://makersuite.google.com/app/apikey"
    else
        print_status "Creating basic .env file..."
        echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
        print_warning "Please edit .env file and add your actual GEMINI_API_KEY"
    fi
fi

# Check if GEMINI_API_KEY is set
if grep -q "your_gemini_api_key_here" .env 2>/dev/null; then
    print_warning "GEMINI_API_KEY not configured. Please set it in .env file"
fi

# Build the project
print_status "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Failed to build frontend"
    exit 1
fi

print_status "Building backend..."
npm run server:build

if [ $? -eq 0 ]; then
    print_success "Backend built successfully"
else
    print_error "Failed to build backend"
    exit 1
fi

# Test backend health
print_status "Testing backend configuration..."
if [ -f "dist/server/index.js" ]; then
    print_success "Backend build artifacts found"
else
    print_error "Backend build artifacts not found"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 🔑 Configure your Gemini API key:"
echo "   - Edit .env file"
echo "   - Add GEMINI_API_KEY=your_actual_api_key"
echo "   - Get API key from: https://makersuite.google.com/app/apikey"
echo ""
echo "2. 🏃 Run locally:"
echo "   - Backend: npm run server:dev"
echo "   - Frontend: npm run dev (in another terminal)"
echo "   - Both: npm run dev:server"
echo ""
echo "3. 🚀 Deploy to Render:"
echo "   - Push code to GitHub"
echo "   - Create web service on Render"
echo "   - Set environment variables in Render dashboard"
echo "   - Use render.yaml for configuration"
echo ""
echo "4. 🌐 Deploy frontend to Vercel:"
echo "   - Connect your GitHub repo to Vercel"
echo "   - Update src/lib/api-config.ts with your Render URL"
echo "   - Deploy"
echo ""
echo "📖 Read RENDER_BACKEND_DEPLOYMENT.md for detailed instructions"
echo ""
echo "🔗 Architecture:"
echo "   Frontend (Vercel) → Backend (Render) → Gemini API"
echo ""
print_success "You're all set! Happy coding! 🚀"
