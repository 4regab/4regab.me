# 4regab.me

## Live Sites
- **Main Site**: [4regab.me](https://4regab.me)
- **Tools**: [tools.4regab.me](https://tools.4regab.me)
- **Translator**: [translator.4regab.me](https://translator.4regab.me)
- **Text-to-Speech**: [tts.4regab.me](https://tts.4regab.me)

## Deployment

This project is configured for Vercel deployment with subdomain routing.

### Build Scripts
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview build locally

### Environment Variables
Required for deployment:
- No specific environment variables needed for basic functionality
- API keys are managed client-side for security

## Domain & Subdomain Configuration Guide

### Step 1: Deploy to Vercel
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Deploy the project (this will give you a `.vercel.app` URL)

### Step 2: Configure Main Domain in Vercel
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter your main domain: `4regab.me`
5. Vercel will show nameservers (copy these for Step 3)

### Step 3: Configure Nameservers in Namecheap
1. Log in to your Namecheap account
2. Go to **Domain List** and click **Manage** next to `4regab.me`
3. Navigate to **Nameservers** section
4. Select **Custom DNS**
5. Replace the default nameservers with Vercel's nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
6. Save changes

### Step 4: Add Subdomains in Vercel
1. In your Vercel project dashboard, go to **Settings** → **Domains**
2. Click **Add Domain** for each subdomain:
   - `tools.4regab.me`
   - `translator.4regab.me`
   - `tts.4regab.me`
3. Vercel will automatically configure these since you're using Vercel nameservers

### Step 5: Alternative - Manual DNS Configuration (if not using Vercel nameservers)
If you prefer to keep your existing nameservers, add these DNS records in Namecheap:

```
Type    Host               Value                        TTL
A       @                  76.76.19.61                 Automatic
CNAME   tools              cname.vercel-dns.com         Automatic
CNAME   translator         cname.vercel-dns.com         Automatic
CNAME   tts                cname.vercel-dns.com         Automatic
```

### Step 6: Verify Configuration
1. Wait 24-48 hours for DNS propagation
2. Check each domain/subdomain in your browser
3. Verify SSL certificates are automatically provisioned by Vercel

## Development

```bash
npm install
npm run dev
```

## Architecture Notes

- **Main App** (`4regab.me`): Homepage and portfolio
- **Tools App** (`tools.4regab.me`): Tools directory/listing
- **Translator App** (`translator.4regab.me`): Dedicated AI translator
- **TTS App** (`tts.4regab.me`): Dedicated text-to-speech tool

Each subdomain loads a different React app based on hostname detection, providing optimal performance and SEO benefits.
