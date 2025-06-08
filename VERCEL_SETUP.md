# Vercel Serverless Functions Setup

This project now uses Vercel serverless functions for all AI-powered tools. This means users no longer need to provide their own API keys - the functions use the deployed site's API keys for a seamless experience.

## Environment Variables

For deployment, set the following environment variables in your Vercel dashboard:

### Required Variables

- `GEMINI_API_KEY`: Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Optional Variables

- `OPENROUTER_API_KEY`: Your OpenRouter API key from [OpenRouter](https://openrouter.ai/keys) (for additional model support)

## Local Development

1. Copy `.env.local` and add your API keys:
   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   OPENROUTER_API_KEY=your_openrouter_key_here
   ```

2. Run the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

## API Endpoints

The following serverless functions are available:

- `/api/chat` - AI Chat Assistant with thinking mode support
- `/api/translate` - Language translation service  
- `/api/tts` - Text-to-speech conversion

## Benefits

✅ **No API Key Required**: Users can use all tools immediately without setup
✅ **Secure**: API keys are stored server-side, not exposed to clients
✅ **Scalable**: Vercel's serverless infrastructure handles traffic automatically
✅ **Fast**: Edge functions provide low-latency responses globally

## Migration Notes

- Removed client-side API key management
- All AI tools now use serverless endpoints
- Maintained feature parity with previous implementation
- Enhanced security and user experience
