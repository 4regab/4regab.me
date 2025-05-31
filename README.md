# 🚀 My Projects and AI-powered tools

> A comprehensive suite of AI-powered tools built with React, TypeScript, and Google's Gemini AI. Features include an intelligent chat assistant, AI translator, text-to-speech converter, and more productivity tools.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-4regab.me-blue?style=for-the-badge&logo=vercel)](https://4regab.me)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

## 🌟 Features

### 🤖 AI Chat Assistant
- **8 Specialized AI Agents**: Academic Writer, Code Assistant, Creative Writer, Data Analyst, Language Translator, Research Assistant, Content Creator, and General Helper
- **Advanced Conversation System**: Multi-turn conversations with context awareness
- **File Upload Support**: Analyze documents, images, and various file formats
- **Export Capabilities**: Export conversations to PDF or DOCX
- **Thinking Mode**: Toggle AI reasoning display for transparency
- **Code Block Handling**: Professional syntax highlighting with copy functionality
- **Multiple AI Models**: Support for Gemini 2.5 Flash, OpenRouter models, and more

### 🌐 AI Translator (English ↔ Tagalog)
- **Contextually Accurate**: Specialized for natural Filipino language translations
- **Academic Quality**: Based on professional translation principles
- **CAN Model Implementation**: Clear, Accurate, and Natural translations
- **Cultural Sensitivity**: Appropriate for Filipino context and audience

### 🔊 Text-to-Speech Converter
- **30+ Voice Options**: Choose from diverse voice characters with unique personalities
- **Advanced Voice Controls**: Speed, stability, similarity, and style exaggeration settings
- **Multiple AI Models**: Gemini 2.5 Flash TTS and native audio models
- **High-Quality Output**: Professional audio generation with download support
- **Format Detection**: Automatic audio format detection and conversion

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Themes**: Beautiful theme switching with smooth transitions
- **Neon Aesthetics**: Custom neon border effects and animations
- **Professional Components**: Built with Radix UI and shadcn/ui
- **Accessibility**: ARIA-compliant and keyboard navigation support

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
- **State Management**: React hooks and context
- **AI Integration**: Google Gemini API, OpenRouter API
- **Routing**: React Router for SPA navigation
- **Deployment**: Vercel with subdomain routing
- **Code Quality**: ESLint, TypeScript strict mode

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** (or **yarn**/bun)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- **OpenRouter API Key** (optional, for additional models)

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

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### API Configuration

The platform uses client-side API key management for security:

1. **Get Gemini API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Configure in App**: Click "API Settings" in any tool and enter your key
3. **Local Storage**: Keys are stored locally and never sent to external servers

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
└── hooks/               # Custom React hooks
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview production build
npm run lint           # Run ESLint

# Deployment
npm run build:dev      # Development build
npm run vercel-build   # Vercel deployment build
```

### Key Features Implementation

#### Multi-App Architecture
The platform uses hostname detection to serve different apps:
- `4regab.me` → Main portfolio
- `tools.4regab.me` → Tools directory  
- `translator.4regab.me` → AI Translator
- `tts.4regab.me` → Text-to-Speech tool

#### AI Chat System
- **Message Parsing**: Advanced content parsing with code block detection
- **File Handling**: Support for images, documents, and various formats
- **Export System**: PDF/DOCX generation with proper formatting
- **Agent System**: Specialized prompts for different use cases

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

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Configure Domains**
   - Add your domain in Vercel dashboard
   - Configure subdomains (tools, translator, tts)
   - Set up DNS records

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy `dist/` folder** to your hosting provider

### Environment Setup

The platform doesn't require server-side environment variables. All API keys are managed client-side for security.

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Bundle Size**: Optimized with code splitting
- **Load Time**: < 2s for initial page load
- **SEO Optimized**: Meta tags and structured data

## 🔒 Security

- **API Keys**: Stored locally in browser, never transmitted to servers
- **Client-Side**: No sensitive data on backend
- **HTTPS**: SSL certificates via Vercel
- **CSP**: Content Security Policy implemented

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI**: For powerful AI capabilities
- **Vercel**: For seamless deployment platform
- **Radix UI**: For accessible UI primitives
- **Tailwind CSS**: For utility-first styling
- **React Community**: For amazing ecosystem

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via [GitHub Issues](https://github.com/4regab/4regab/issues)
---

<div align="center">

**⭐ Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/4regab/4regab?style=social)](https://github.com/4regab/4regab/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/4regab/4regab?style=social)](https://github.com/4regab/4regab/network/members)

</div>
