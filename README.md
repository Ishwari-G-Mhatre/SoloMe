# Secure AI Backend (proxy for the travel app)

This hides your Gemini API key. The frontend (`index.html` on GitHub Pages)
calls `POST /api/ai`; this server injects the key from an env var and forwards
the request to Gemini, returning only `{ text }`.

## 1. Run locally
```bash
cd secure-ai-backend
npm install
cp .env.example .env        # then edit .env and paste your key
npm start                   # http://localhost:3000
```

Test it:
```bash
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say hello in one word"}'
```

## 2. Deploy (Render / Railway / Fly / Vercel)
- Push this folder to a repo (the `.gitignore` keeps `.env` out — never commit secrets).
- In the host dashboard, add environment variables:
  - `GEMINI_API_KEY` = your key
  - `ALLOWED_ORIGIN` = `https://yourusername.github.io`
- Deploy. You'll get a URL like `https://your-backend.onrender.com`.

## 3. Point the frontend at it
In `index.html`, update one line:
```js
const AI_BACKEND = 'https://your-backend.onrender.com';
```
(Leave it `''` only if the frontend is served from the same host as this backend.)

## 4. Rotate the leaked key (IMPORTANT)
The old key `AIzaSy...yphVU` was public in your HTML, so it's compromised.
In Google AI Studio / Google Cloud Console: **delete that key**, create a new
one, and put the new one in `GEMINI_API_KEY`. Also add an
**HTTP referrer / API restriction** on the new key for defense in depth.

## Security checklist
- ✅ Key only in env vars (host dashboard), never in frontend JS.
- ✅ `.env` is gitignored.
- ✅ Backend validates input and restricts origin via `ALLOWED_ORIGIN`.
- ✅ Keyless calls (Nominatim, Google Maps embed, Unsplash) still go direct — they need no proxy.
