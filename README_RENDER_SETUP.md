# 🚀 4regab.me AI Tools - Render Backend Setup

A modern, scalable AI tools platform with React frontend and Express backend powered by Google Gemini AI.

## 🏗️ Architecture

```
Frontend (Vercel)    →    Backend (Render)    →    Gemini API
├── React + TypeScript    ├── Express.js           ├── Translation
├── Vite Build            ├── Rate Limiting        ├── Chat Assistant  
├── Tailwind CSS          ├── CORS Protection      └── Text-to-Speech
└── Modern UI/UX          └── Security Headers
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Git repository connected to GitHub

### 1. Setup Project

```bash
# Clone or download the project
git clone <your-repo-url>
cd 4regab.me

# Run setup script (Unix/Mac)
chmod +x setup.sh
./setup.sh

# Or run setup script (Windows PowerShell)
.\setup.ps1
```

### 2. Configure Environment

```bash
# Edit .env file
cp .env.example .env
nano .env  # or use any text editor
```

Add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Local Development

```bash
# Start both frontend and backend
npm run dev:server

# Or start separately:
# Terminal 1: Backend
npm run server:dev

# Terminal 2: Frontend  
npm run dev
```

Your app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health Check: http://localhost:3000/api/health

## 🌐 Deployment

### Backend Deployment (Render)

1. **Create Render Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Create new "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   Name: 4regab-ai-backend
   Environment: Node
   Build Command: npm install && npm run server:build
   Start Command: npm run server:start
   ```

3. **Set Environment Variables**
   ```env
   NODE_ENV=production
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=10000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your backend will be at: `https://your-service-name.onrender.com`

### Frontend Deployment (Vercel)

1. **Update API Configuration**
   
   Edit `src/lib/api-config.ts`:
   ```typescript
   const BACKEND_URLS = {
     development: 'http://localhost:3000',
     production: 'https://your-actual-render-url.onrender.com', // Update this
   } as const;
   ```

2. **Deploy to Vercel**
   - Connect repository to Vercel
   - Build command: `npm run build`
   - Output directory: `dist`
   - Deploy

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start frontend development server
npm run server:dev       # Start backend development server  
npm run dev:server      # Start both frontend and backend

# Building
npm run build           # Build frontend for production
npm run server:build    # Build backend for production
npm run type-check      # Run TypeScript type checking

# Production
npm run server:start    # Start production backend server
npm run start          # Build and start production server

# Linting
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues automatically
```

## 📡 API Endpoints

Your backend provides these RESTful endpoints:

| Endpoint | Method | Description | Rate Limit |
|----------|--------|-------------|------------|
| `/api/health` | GET | Health check | None |
| `/api/translate` | POST | English to Filipino translation | 20/min |
| `/api/chat` | POST | AI chat assistant | 30/min |
| `/api/tts` | POST | Text-to-speech | 10/min |

### Example Usage

**Translation:**
```bash
curl -X POST https://your-backend.onrender.com/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```

**Chat:**
```bash
curl -X POST https://your-backend.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Help me learn Filipino"}'
```

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Sanitizes all user inputs
- **Security Headers**: Helmet.js middleware
- **Error Handling**: Graceful error responses
- **Environment Isolation**: Separate configs for dev/prod

## 🏗️ Project Structure

```
4regab.me/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── tools/         # Tool-specific components
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utility libraries
│   │   ├── api-config.ts  # API configuration
│   │   ├── backend-service.ts # Backend API client
│   │   └── gemini-service.ts  # Gemini AI integration
│   ├── pages/             # Page components
│   └── types/             # TypeScript type definitions
├── server/                # Backend source code
│   └── index.ts           # Express server
├── api/                   # Legacy API handlers (for reference)
├── dist/                  # Build output
├── public/                # Static assets
├── render.yaml           # Render deployment config
├── vercel.json           # Vercel deployment config
└── setup.ps1             # Windows setup script
```

## 🧪 Testing

### Backend Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test translation (requires API key)
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello"}'
```

### Frontend Testing

```bash
# Start development server
npm run dev

# Open browser and test:
# - http://localhost:5173/tools/translator
# - http://localhost:5173/tools/helper  
# - http://localhost:5173/tools/tts
```

## 🐛 Troubleshooting

### Common Issues

**1. Backend 500 Errors**
- Check if `GEMINI_API_KEY` is set correctly
- Verify API key is valid at Google AI Studio
- Check server logs in Render dashboard

**2. CORS Errors**
- Verify frontend domain is in allowed origins
- Check `src/lib/api-config.ts` configuration
- Ensure backend URL is correct

**3. Build Errors**
- Run `npm install` to ensure dependencies
- Check Node.js version (18+ required)
- Verify TypeScript configuration

**4. Rate Limiting**
- Wait for rate limit reset (1 minute)
- Reduce request frequency
- Check rate limit headers in response

### Environment Variables

Make sure these are set correctly:

**Development (.env):**
```env
GEMINI_API_KEY=your_api_key_here
```

**Production (Render Dashboard):**
```env
NODE_ENV=production
GEMINI_API_KEY=your_api_key_here
PORT=10000
```

### Performance Optimization

**Backend:**
- Uses connection pooling for Gemini API
- Implements exponential backoff for retries
- Rate limiting prevents overload

**Frontend:**
- Code splitting and lazy loading
- Optimized bundle size with Vite
- Efficient API request handling

## 📖 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

## 🎉 Success!

Your AI tools platform is now configured for:
- ✅ Local development with hot reload
- ✅ Production backend on Render
- ✅ Static frontend on Vercel
- ✅ Secure API communication
- ✅ Modern UI/UX with Tailwind CSS
- ✅ Full TypeScript support

Happy coding! 🚀
