# 🚀 Render Backend Deployment Guide

This guide will help you deploy the 4regab.me AI Tools backend to Render and configure the frontend to use it.

## 📋 Prerequisites

- Git repository with your project
- Render account (free tier available)
- Gemini API key from Google AI Studio

## 🔧 Backend Deployment on Render

### Step 1: Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `4regab.me` repository

### Step 2: Configure Build Settings

```yaml
Name: 4regab-ai-backend
Environment: Node
Region: Oregon (or closest to your users)
Branch: main
Build Command: npm install && npm run server:build
Start Command: npm run server:start
```

### Step 3: Set Environment Variables

In your Render service settings, add these environment variables:

```env
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
PORT=10000
```

**Important**: 
- Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Keep your API key secure and never commit it to your repository

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for the deployment to complete (5-10 minutes)
3. Your backend will be available at: `https://your-service-name.onrender.com`

## 🌐 Frontend Configuration

### Update API Base URL

Your frontend is already configured to automatically detect the environment:

- **Development**: Uses `http://localhost:3000`
- **Production**: Uses your Render backend URL

To update the production URL, edit `src/lib/api-config.ts`:

```typescript
const BACKEND_URLS = {
  development: 'http://localhost:3000',
  production: 'https://your-actual-render-url.onrender.com', // Update this
} as const;
```

### Deploy Frontend to Vercel

1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

## 📡 API Endpoints

Your Render backend provides these endpoints:

- **Health Check**: `GET /api/health`
- **Translation**: `POST /api/translate`
- **Chat/Helper**: `POST /api/chat`
- **Text-to-Speech**: `POST /api/tts`

## 🧪 Testing the Deployment

### 1. Test Backend Health

```bash
curl https://your-render-url.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Translation API is running",
  "timestamp": "2024-01-XX..."
}
```

### 2. Test Translation

```bash
curl -X POST https://your-render-url.onrender.com/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```

### 3. Test Chat

```bash
curl -X POST https://your-render-url.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello! How can you help me?"}'
```

## 🔒 Security Features

Your backend includes:

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Sanitizes all inputs
- **Error Handling**: Graceful error responses
- **Security Headers**: Helmet.js security middleware

## 📊 Monitoring & Logs

1. Access logs in your Render dashboard
2. Monitor health endpoint for uptime
3. Check API response times
4. Monitor rate limit hits

## 🐛 Troubleshooting

### Backend Issues

1. **500 Errors**: Check environment variables, especially `GEMINI_API_KEY`
2. **CORS Errors**: Verify your frontend domain is in the allowed origins
3. **Rate Limits**: Wait for rate limit reset or contact support

### Frontend Issues

1. **API Connection**: Check if backend URL is correct in `api-config.ts`
2. **Network Errors**: Verify CORS configuration
3. **Build Errors**: Ensure all dependencies are installed

### Common Fixes

```bash
# Check environment variables
echo $GEMINI_API_KEY

# Test local backend
npm run server:dev

# Test production build locally
npm run build && npm run server:start
```

## 🔄 Deployment Workflow

### For Development

```bash
# Start backend locally
npm run server:dev

# Start frontend locally (in another terminal)
npm run dev
```

### For Production

1. Push changes to your GitHub repository
2. Render automatically deploys backend changes
3. Vercel automatically deploys frontend changes
4. Test the integration

## 🌟 Architecture Overview

```
Frontend (Vercel)     →     Backend (Render)     →     Gemini API
├── React/TypeScript         ├── Express.js              ├── Translation
├── Vite Build               ├── Rate Limiting           ├── Chat/Helper
├── Tailwind CSS             ├── CORS Protection         └── Text-to-Speech
└── API Client               └── Error Handling
```

## 📝 Environment Files

### Development (.env)
```env
GEMINI_API_KEY=your_api_key_here
```

### Production (Render Dashboard)
```env
NODE_ENV=production
GEMINI_API_KEY=your_api_key_here
PORT=10000
```

## 🚀 Performance Tips

1. **Backend**:
   - Uses connection pooling
   - Implements rate limiting
   - Optimized Gemini API calls

2. **Frontend**:
   - Code splitting enabled
   - Optimized bundle size
   - Efficient API calls

## 📞 Support

If you encounter issues:

1. Check the logs in Render dashboard
2. Verify all environment variables are set
3. Test API endpoints individually
4. Review CORS configuration

Your backend is now fully configured to handle all Gemini API interactions through Render! 🎉
