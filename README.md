<!-- xonettn -->
<div align="center">

# 🤖 Run and deploy your AI Studio app

This contains everything you need to run your app locally.


![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white)

![Deploy](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify&logoColor=white)

</div>

---

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>


This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5e63e895-e090-4df2-be9a-1c9d6392d28f

## 🚀 Run Locally

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

---

<div align="center">

**[xonettn]** · Built by [Neal Frazier](https://github.com/1nc0gn30) · [@AshAmplifies](https://twitter.com/AshAmplifies)

</div>
