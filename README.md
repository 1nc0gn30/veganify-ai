<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5e63e895-e090-4df2-be9a-1c9d6392d28f

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Open Settings in the app and add your own BYOK API key (Gemini or OpenAI).
3. Run the app:
   `npm run dev`

## Netlify AI Endpoints and Env Vars
- No server-side Netlify AI function is configured; this app runs in BYOK mode only.
- Required env vars: none for AI runtime (user supplies API key in Settings).
- Key handling: user settings (provider, key, model, vibe, prompt add-ons) are kept in browser `localStorage`, with optional passphrase encryption, and are never sent to app-owned servers.
