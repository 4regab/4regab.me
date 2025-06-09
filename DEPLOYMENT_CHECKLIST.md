# 🚀 Deployment Checklist for 4regab.me

## Pre-Deployment

- [ ] ✅ Project builds successfully (`npm run build`)
- [ ] ✅ Backend builds successfully (`npm run server:build`)
- [ ] ✅ Environment variables configured (`.env` file)
- [ ] ✅ Gemini API key is valid and working
- [ ] ✅ All tools tested locally (Translator, Helper, TTS)
- [ ] ✅ Code committed and pushed to GitHub

## Backend Deployment (Render)

### 1. Create Render Service
- [ ] Go to [Render Dashboard](https://dashboard.render.com)
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select the correct repository and branch

### 2. Configure Service
- [ ] **Name**: `4regab-ai-backend`
- [ ] **Environment**: `Node`
- [ ] **Region**: `Oregon` (or closest to users)
- [ ] **Branch**: `main`
- [ ] **Build Command**: `npm install && npm run server:build`
- [ ] **Start Command**: `npm run server:start`

### 3. Environment Variables
- [ ] **NODE_ENV**: `production`
- [ ] **GEMINI_API_KEY**: `your_actual_api_key_here`
- [ ] **PORT**: `10000`

### 4. Deploy & Test
- [ ] Click "Create Web Service"
- [ ] Wait for build completion (5-10 minutes)
- [ ] Test health endpoint: `https://your-service.onrender.com/api/health`
- [ ] Copy the deployed URL for frontend configuration

## Frontend Deployment (Vercel)

### 1. Update API Configuration
- [ ] Edit `src/lib/api-config.ts`
- [ ] Update production URL to your Render backend URL:
  ```typescript
  production: 'https://your-actual-render-url.onrender.com'
  ```

### 2. Deploy to Vercel
- [ ] Connect repository to Vercel
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`
- [ ] **Root Directory**: `.` (leave empty)
- [ ] Deploy and wait for completion

### 3. Test Integration
- [ ] Test translator tool
- [ ] Test chat/helper tool
- [ ] Test TTS tool (client-side)
- [ ] Verify API calls go to Render backend

## Post-Deployment Verification

### Backend Health Checks
- [ ] Health endpoint responds: `GET /api/health`
- [ ] Translation endpoint works: `POST /api/translate`
- [ ] Chat endpoint works: `POST /api/chat`
- [ ] TTS endpoint works: `POST /api/tts`
- [ ] Rate limiting is active
- [ ] CORS headers are present

### Frontend Functionality
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Tools communicate with backend
- [ ] Error handling works
- [ ] Responsive design on mobile
- [ ] Performance is acceptable

### Security & Performance
- [ ] HTTPS is enabled (automatic on Render/Vercel)
- [ ] API keys are not exposed in frontend
- [ ] Rate limiting prevents abuse
- [ ] Error messages don't leak sensitive info
- [ ] CSP headers are present

## Monitoring Setup

### Render Backend
- [ ] Check deployment logs
- [ ] Set up monitoring alerts
- [ ] Monitor API response times
- [ ] Watch for error patterns

### Vercel Frontend
- [ ] Check build logs
- [ ] Monitor Core Web Vitals
- [ ] Set up error tracking
- [ ] Monitor user analytics

## Domain & DNS (Optional)

### Custom Domain Setup
- [ ] Purchase domain (if needed)
- [ ] Configure DNS for frontend (Vercel)
- [ ] Configure DNS for backend (Render)
- [ ] Update API configuration with custom domains
- [ ] Test SSL certificates

## Backup & Recovery

- [ ] Code is version controlled (Git)
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Database backup (if applicable)
- [ ] Recovery procedures tested

## Final Testing

### End-to-End Tests
- [ ] User can translate text successfully
- [ ] User can chat with AI assistant
- [ ] User can use text-to-speech
- [ ] All error scenarios handle gracefully
- [ ] Mobile experience is smooth

### Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API response times < 5 seconds
- [ ] Large text translation works
- [ ] Multiple concurrent users supported

## Launch Preparation

- [ ] Update README with deployment URLs
- [ ] Create user documentation
- [ ] Prepare social media announcements
- [ ] Set up analytics tracking
- [ ] Plan monitoring and maintenance

## Post-Launch

- [ ] Monitor error rates
- [ ] Check user feedback
- [ ] Monitor API usage and costs
- [ ] Plan feature updates
- [ ] Regular security updates

---

## 📞 Emergency Contacts

- **Render Support**: https://help.render.com
- **Vercel Support**: https://vercel.com/help
- **Google AI Support**: https://ai.google.dev/support

## 🔗 Important URLs

After deployment, update these:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Health Check**: `https://your-backend.onrender.com/api/health`

---

✅ **All checks complete? You're ready to launch!** 🚀
