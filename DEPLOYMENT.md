# Deployment Guide for 4regab.me

## Quick Setup Checklist

### 1. ✅ Code Preparation (COMPLETED)
- [x] Subdomain routing configured in App.tsx
- [x] Separate apps created for each subdomain
- [x] Vercel.json configuration file created
- [x] Build scripts updated in package.json

### 2. 🚀 Vercel Deployment
1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub account
   - Select the `4regab-main` repository

2. **Deploy Project**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click "Deploy"

### 3. 🌐 Domain Configuration

#### Option A: Using Vercel Nameservers (RECOMMENDED)

**Step 1: Add Main Domain in Vercel**
1. Go to Project Settings → Domains
2. Add domain: `4regab.me`
3. Copy the provided nameservers

**Step 2: Update Namecheap Nameservers**
1. Login to Namecheap
2. Manage `4regab.me` domain
3. Change nameservers to Vercel's:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

**Step 3: Add Subdomains in Vercel**
Add each subdomain in Vercel:
- `tools.4regab.me`
- `translator.4regab.me`
- `tts.4regab.me`

#### Option B: Manual DNS Records
If keeping existing nameservers, add these DNS records in Namecheap:

```
Type    Host               Value                        TTL
A       @                  76.76.19.61                 Automatic
CNAME   tools              cname.vercel-dns.com         Automatic
CNAME   translator         cname.vercel-dns.com         Automatic
CNAME   tts                cname.vercel-dns.com         Automatic
```

### 4. ⏱️ DNS Propagation
- Wait 24-48 hours for full DNS propagation
- Use [whatsmydns.net](https://www.whatsmydns.net/) to check propagation status

### 5. ✅ Verification
Test each domain:
- [4regab.me](https://4regab.me) → Main homepage
- [tools.4regab.me](https://tools.4regab.me) → Tools listing
- [translator.4regab.me](https://translator.4regab.me) → AI Translator
- [tts.4regab.me](https://tts.4regab.me) → Text-to-Speech

## Architecture Overview

```
4regab.me (Main)
├── MainApp.tsx → Homepage & Portfolio
├── tools.4regab.me → ToolsApp.tsx → Tools Directory
├── translator.4regab.me → TranslatorApp.tsx → AI Translator
└── tts.4regab.me → TTSApp.tsx → Text-to-Speech
```

## Environment Variables
No server-side environment variables required. All API keys are managed client-side.

## Support
If you encounter issues:
1. Check Vercel deployment logs
2. Verify DNS settings with `nslookup`
3. Check browser console for JavaScript errors
4. Ensure API keys are properly configured in localStorage
