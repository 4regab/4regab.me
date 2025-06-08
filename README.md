# 🚀 4regab.me - AI-Powered Tools Platform

Modern suite of AI tools built with React, TypeScript, and Google Gemini AI.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-4regab.me-blue?style=flat-square)](https://4regab.me)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

## ✨ Features

- **🤖 AI Chat Assistant** - 8 specialized agents with conversation history
- **🌐 AI Translator** - English ↔ Tagalog with cultural sensitivity  
- **🔊 Text-to-Speech** - 30+ voices with advanced controls
- **🎨 Modern UI** - Responsive design with dark/light themes

## 🛠️ Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + Radix UI
- Express.js backend + Google Gemini AI
- Deployed on Render (backend) + Vercel (frontend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation
```bash
# Clone and install
git clone https://github.com/yourusername/4regab.git
cd 4regab
npm install

# Set up environment
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Start development
npm run dev        # Frontend (http://localhost:5173)
npm run server:dev # Backend (http://localhost:3000)
```

## 🚀 Deployment

**Production Setup:**
- Frontend: Vercel (static hosting)
- Backend: Render (Express server)
- Environment: Set `GEMINI_API_KEY` in Render dashboard

**Build Commands:**
```bash
npm run build         # Frontend build
npm run build:server  # Backend build
npm run render-build  # Full production build
```

## 📁 Project Structure
```
src/
├── components/tools/     # AI tools (Helper, Translator, TTS)
├── lib/                 # Services and utilities
├── pages/               # Page components
└── types/               # TypeScript definitions

server/
└── index.ts             # Express backend with API endpoints

API Endpoints:
- POST /api/chat         # AI chat
- POST /api/translate    # Translation
- POST /api/tts          # Text-to-speech
- GET /api/health        # Health check
```

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

⭐ **Star this repo if you find it helpful!**
