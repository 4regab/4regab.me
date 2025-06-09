# 🚀 Render + Vercel Deployment Guide

## 📋 Overview

This guide shows you how to deploy your 4regab.me application using:
- **Render**: Backend Express server (handles all Gemini AI API calls)
- **Vercel**: Frontend React app (static site)

## 🎯 **Part 1: Deploy Backend to Render**

### 1. **Create Render Account**
- Go to [render.com](https://render.com) and sign up
- Connect your GitHub account

### 2. **Create New Web Service**
- Click "New" → "Web Service"
- Connect your GitHub repository
- Choose the repository: `4regab/4regab`

### 3. **Configure Render Service**
Use these exact settings:

```yaml
Name: 4regab-ai-backend
Environment: Node
Region: Oregon (US West)
Branch: main
Build Command: npm install && npm run server:build
Start Command: npm run server:start
```

### 4. **Set Environment Variables**
In Render dashboard, add these environment variables:

| Key | Value | Notes |
|-----|--------|-------|
| `NODE_ENV` | `production` | Required |
| `GEMINI_API_KEY` | `your_actual_api_key` | **Get from Google AI Studio** |
| `PORT` | `10000` | Render default |

### 5. **Deploy**
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Note your backend URL: `https://4regab-ai-backend.onrender.com`

### 6. **Test Backend**
Once deployed, test these endpoints:
```bash
# Health check
curl https://4regab-ai-backend.onrender.com/api/health

# Translation test
curl -X POST https://4regab-ai-backend.onrender.com/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "targetLanguage": "Filipino"}'
```

## 🎯 **Part 2: Update Frontend Configuration**

### 1. **Update Backend URL**
Edit `src/lib/api-config.ts` and update the production URL:

```typescript
const BACKEND_URLS = {
  development: 'http://localhost:3000',
  production: 'https://4regab-ai-backend.onrender.com', // ← Your actual Render URL
} as const;
```

### 2. **Test Locally**
```powershell
# Build and test
npm run build
npm run preview

# Verify it connects to your Render backend
```

## 🎯 **Part 3: Deploy Frontend to Vercel**

### 1. **Install Vercel CLI**
```powershell
npm install -g vercel
vercel login
```

### 2. **Deploy**
```powershell
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Follow the prompts:
# Project name: 4regab-ai-tools
# Deploy to production: Yes
```

### 3. **Configure Domain (Optional)**
- In Vercel dashboard, go to your project
- Add custom domain: `4regab.me`
- Update DNS records as instructed

## 🧪 **Part 4: Verification & Testing**

### 1. **Test Complete Setup**
Once both are deployed:

```bash
# Frontend
curl https://4regab.vercel.app

# Backend APIs through frontend
# Open browser and test:
# - Translation tool
# - Chat assistant  
# - TTS functionality
```

### 2. **Monitor Logs**
```bash
# Render logs
# Go to Render dashboard → Your service → Logs

# Vercel logs  
vercel logs --follow
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **500 Errors on Render**
   ```bash
   # Check logs in Render dashboard
   # Verify GEMINI_API_KEY is set correctly
   # Test API key: https://aistudio.google.com/app/apikey
   ```

2. **CORS Errors**
   ```bash
   # Update server/index.ts CORS configuration
   # Add your Vercel URL to allowedOrigins array
   ```

3. **Build Failures**
   ```bash
   # Check Node.js version (use 18.x)
   # Verify all dependencies are in package.json
   # Check build logs in Render dashboard
   ```

### **Performance Optimization**

1. **Render Free Tier Considerations**
   - Cold starts (first request may be slow)
   - 750 free hours/month
   - Auto-sleep after 15 minutes of inactivity

2. **Keep Backend Warm**
   - Set up a simple cron job to ping `/api/health` every 10 minutes
   - Use services like UptimeRobot (free)

## 📊 **Production URLs**

After successful deployment:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://4regab.vercel.app` | Main website |
| **Backend** | `https://4regab-ai-backend.onrender.com` | API server |
| **Health Check** | `https://4regab-ai-backend.onrender.com/api/health` | Status |

## 🎉 **Success!**

Your 4regab.me application is now running on:
- ✅ **Render**: Secure backend with Gemini AI integration
- ✅ **Vercel**: Fast, global frontend deployment
- ✅ **Full HTTPS**: Secure communication
- ✅ **Auto-scaling**: Handles traffic spikes
- ✅ **Global CDN**: Fast worldwide access

## 💡 **Next Steps**

1. **Custom Domain**: Set up `4regab.me` domain
2. **Analytics**: Add Google Analytics or Vercel Analytics
3. **Monitoring**: Set up error tracking (Sentry)
4. **Performance**: Optimize Core Web Vitals
5. **SEO**: Add meta tags and sitemap

---

**Need Help?** 
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- GitHub issues: Create an issue in your repository
