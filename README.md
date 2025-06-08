# 🚀 My Projects and AI-powered tools

> A comprehensive suite of AI-powered tools built with React, TypeScript, and Google's Gemini AI. Features include an intelligent chat assistant, AI translator, text-to-speech converter, and more productivity tools with a secure Express.js backend.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-4regab.me-blue?style=for-the-badge&logo=render)](https://4regab.me)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

## 🌟 Features

### 🤖 AI Chat Assistant
- **8 Specialized AI Agents**: Academic Writer, Code Assistant, Creative Writer, Data Analyst, Language Translator, Research Assistant, Content Creator, and General Helper
- **Advanced Conversation System**: Multi-turn conversations with context awareness and seamless interaction flow
- **Dynamic UI Controls**: Integrated send/stop button that transforms during AI generation, similar to modern chatbots like ChatGPT and Claude
- **Enhanced Visual Feedback**: Professional loading indicators with spinning animations and gradient backgrounds for clear generation status
- **Intelligent Stop Generation**: Real-time ability to halt AI responses and switch prompts, models, or agents without waiting
- **File Upload Support**: Analyze documents, images, and various file formats with drag-and-drop functionality
- **Export Capabilities**: Export conversations to PDF or DOCX with proper formatting
- **Thinking Mode**: Toggle AI reasoning display for transparency in decision-making process
- **Code Block Handling**: Professional syntax highlighting with copy functionality and smart detection
- **Multiple AI Models**: Support for Gemini 2.5 Flash, OpenRouter models, and specialized reasoning models

### 🌐 AI Translator (English ↔ Tagalog)
- **Server-side Processing**: Secure backend handles API calls, no user API keys required
- **Contextually Accurate**: Specialized for natural Filipino language translations
- **Academic Quality**: Based on professional translation principles
- **CAN Model Implementation**: Clear, Accurate, and Natural translations
- **Cultural Sensitivity**: Appropriate for Filipino context and audience
- **Rate Limiting**: Built-in protection with 20 requests/minute per IP

### 🔊 Text-to-Speech Converter
- **30+ Voice Options**: Choose from diverse voice characters with unique personalities
- **Advanced Voice Controls**: Speed, stability, similarity, and style exaggeration settings
- **Multiple AI Models**: Gemini 2.5 Flash TTS and native audio models
- **High-Quality Output**: Professional audio generation with download support
- **Format Detection**: Automatic audio format detection and conversion

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS and optimized layouts
- **Dark/Light Themes**: Beautiful theme switching with smooth transitions
- **Dynamic Visual Indicators**: Context-aware loading states with animated icons and gradient effects
- **Intuitive Controls**: Unified send/stop button functionality that adapts based on generation state
- **Neon Aesthetics**: Custom neon border effects and animations for enhanced visual appeal
- **Professional Components**: Built with Radix UI and shadcn/ui for consistent design language
- **Accessibility**: ARIA-compliant and keyboard navigation support with focus management
- **Seamless Interactions**: Smooth transitions and micro-animations for enhanced user experience

## 🔴 Live Deployment

- **🏠 Main Portfolio**: [4regab.me](https://4regab.me)
- **💬 Chat**: [chat.4regab.me](https://chat.4regab.me)
- **🛠️ Tools Hub**: [tools.4regab.me](https://tools.4regab.me)
- **🌐 AI Translator**: [translator.4regab.me](https://translator.4regab.me)
- **🔊 Text-to-Speech**: [tts.4regab.me](https://tts.4regab.me)

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom neon themes
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React hooks and context with optimized abort controller management
- **AI Integration**: Google Gemini API, OpenRouter API with real-time generation control
- **Routing**: React Router for SPA navigation
- **Backend**: Express.js server with secure API endpoints
- **Deployment**: Render with automatic scaling and health monitoring
- **Code Quality**: ESLint, TypeScript strict mode

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** (or **yarn**/bun)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey)) - for backend/server functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/4regab.git
   cd 4regab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables (for backend development)**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY for local backend testing
   ```

4. **Start development servers**
   ```bash
   # Run both frontend and backend together
   npm run dev:server
   
   # Or run separately (in different terminals)
   npm run dev        # Frontend at http://localhost:5173
   npm run server:dev # Backend at http://localhost:3000
   ```

5. **Open your browser** and navigate to `http://localhost:5173`

### Backend Architecture

The translation service uses a secure Express.js backend deployed on Render:

- **Server-side API Keys**: No user API keys required for translation
- **Rate Limiting**: Built-in protection (20 requests/minute per IP)
- **CORS Support**: Configured for cross-origin requests
- **Health Monitoring**: `/api/health` endpoint for status checks
- **Production Ready**: Deployed on Render with automatic scaling
- **Static File Serving**: Serves the React frontend in production

### API Endpoints

#### Translation API
- **Endpoint**: `POST /api/translate`
- **Purpose**: Translates English text to Filipino (Tagalog)
- **Request**: `{ "text": "Hello, how are you?" }`
- **Response**: `{ "success": true, "translation": "Kamusta ka?", "originalLength": 18, "translatedLength": 12 }`

#### Health Check
- **Endpoint**: `GET /api/health`
- **Purpose**: Server health monitoring
- **Response**: `{ "status": "OK", "timestamp": "2024-01-01T00:00:00.000Z" }`

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── tools/           # Tool-specific components
│   │   ├── Helper.tsx   # AI Chat Assistant
│   │   ├── Translator.tsx # AI Translator
│   │   └── TextToSpeech.tsx # TTS Tool
│   ├── ui/              # Base UI components (shadcn/ui)
│   └── ...              # Navigation, layout components
├── lib/                 # Utility libraries
│   ├── gemini-service.ts # Gemini API integration
│   ├── gemini-models.ts # Model configurations
│   ├── helper-agents.ts # AI agent definitions
│   └── utils.ts         # Common utilities
├── pages/               # Page components
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── ...
server/                  # Express.js backend
└── index.ts             # Main server file with API endpoints
dist/                    # Built files (frontend + server)
render.yaml              # Render deployment configuration
tsconfig.server.json     # TypeScript config for server
.env.example            # Environment variables template
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start frontend dev server (port 5173)
npm run server:dev       # Start backend dev server (port 3000)
npm run dev:server       # Start both frontend and backend together

# Building
npm run build           # Build frontend for production
npm run build:server    # Build backend for production
npm run render-build    # Build for Render deployment (both frontend and backend)

# Production
npm run start           # Start production server
npm run render-start    # Start server for Render deployment

# Utilities
npm run lint           # Run ESLint
npm run type-check     # TypeScript type checking
npm run preview        # Preview production build locally
```

### Testing the Translation API

You can test the translation API locally:

1. **Start the backend server:**
   ```bash
   npm run server:dev
   ```

2. **Test with curl:**
   ```bash
   curl -X POST http://localhost:3000/api/translate \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello, how are you today?"}'
   ```

3. **Or use the test page:**
   Open `http://localhost:5173/test-translation-api.html` in your browser
### Key Features Implementation

#### Multi-App Architecture
The platform uses hostname detection to serve different apps:
- `4regab.me` → Main portfolio
- `tools.4regab.me` → Tools directory  
- `translator.4regab.me` → AI Translator
- `tts.4regab.me` → Text-to-Speech tool

#### AI Chat System
- **Message Parsing**: Advanced content parsing with code block detection and smart formatting
- **Dynamic Control System**: Integrated send/stop functionality with real-time abort controller management
- **File Handling**: Support for images, documents, and various formats with seamless upload experience
- **Export System**: PDF/DOCX generation with proper formatting and conversation preservation
- **Agent System**: Specialized prompts for different use cases with context-aware switching
- **Visual Feedback**: Enhanced loading states with spinning icons, gradient backgrounds, and clear generation indicators
- **Abort Management**: Comprehensive abort controller system supporting both new messages and regenerated responses

#### Translation Backend
- **Express.js Server**: Secure backend handling all translation requests
- **API Key Management**: Server-side storage and management of Gemini API keys
- **Rate Limiting**: IP-based request limiting to prevent abuse
- **Error Handling**: Comprehensive error responses with proper HTTP status codes
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Health Monitoring**: Endpoint for deployment health checks

#### Code Block Enhancement
- **Smart Detection**: Automatic detection of code patterns (C/C++, Python, etc.)
- **Deduplication**: Prevents duplicate code block rendering
- **Syntax Highlighting**: Professional dark theme with copy functionality
- **Format Preservation**: Maintains `#include` directives, operators, and brackets

## 🎨 Customization

### Themes
- Modify `tailwind.config.ts` for custom colors
- Update CSS variables in `src/index.css`
- Customize neon effects in component styles

### AI Agents
Add new agents in `src/lib/helper-agents.ts`:
```typescript
{
  id: 'new-agent',
  name: 'Agent Name',
  prompt: 'System prompt here...',
  icon: 'agent-icon',
  description: 'Agent description'
}
```

### Models
Configure models in `src/lib/gemini-models.ts`:
```typescript
{
  id: 'model-id',
  name: 'Model Name',
  modelName: 'api-model-name',
  provider: 'google',
  capabilities: ['text', 'files']
}
```

## 🚀 Deployment

### Render (Production)

This project is configured for deployment on Render with automatic build and deployment.

#### Option 1: Using render.yaml (Recommended)
1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Render**: 
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
3. **Auto-deployment**: Render will use the `render.yaml` configuration automatically
4. **Set Environment Variables**: Add `GEMINI_API_KEY` in the Render dashboard

#### Option 2: Manual Configuration
1. **Create Web Service** on Render
2. **Configure Build Settings**:
   - Build Command: `npm run render-build`
   - Start Command: `npm run render-start`
   - Health Check Path: `/api/health`
3. **Environment Variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `NODE_ENV`: `production`

#### Render Configuration Details
- **Runtime**: Node.js 18+
- **Build**: Compiles both frontend and backend
- **Static Files**: Backend serves React build files
- **Auto-scaling**: Render handles traffic scaling automatically
- **Health Checks**: `/api/health` endpoint monitors server status

### Local Production Testing

Test the production build locally:

```bash
# Build for production
npm run build
npm run build:server

# Start production server
npm run start
```

### Environment Variables

Required environment variables for production:

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=production
```

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Bundle Size**: Optimized with code splitting and tree shaking
- **Load Time**: < 2s for initial page load
- **API Response**: < 500ms average for translation requests
- **SEO Optimized**: Meta tags and structured data
- **Server**: Express.js with production optimizations

## 🔒 Security

- **API Keys**: Stored securely on server-side, never exposed to client
- **Rate Limiting**: IP-based request limiting to prevent abuse
- **CORS Policy**: Configured to allow only necessary origins
- **Input Validation**: Server-side validation of all API requests
- **HTTPS**: SSL certificates via Render
- **Environment Variables**: Secure server-side storage
- **No Client API Keys**: Users don't need to provide their own API keys

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Write responsive, accessible components
- Test backend changes locally before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI**: For powerful AI capabilities
- **Render**: For reliable deployment platform with automatic scaling
- **Radix UI**: For accessible UI primitives
- **Tailwind CSS**: For utility-first styling
- **React Community**: For amazing ecosystem
- **Express.js**: For robust backend framework

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via [GitHub Issues](https://github.com/4regab/4regab/issues)
- **API Testing**: Use `/test-translation-api.html` for backend testing

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/4regab/4regab?style=social)](https://github.com/4regab/4regab/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/4regab/4regab?style=social)](https://github.com/4regab/4regab/network/members)

</div>
