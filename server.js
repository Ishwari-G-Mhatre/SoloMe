import dotenv from "dotenv";
dotenv.config();


// Secure AI proxy for the travel app frontend.
// The Gemini key lives ONLY here, in an environment variable.
// The browser calls POST /api/ai and never sees the key.

import express from "express";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Restrict who can call this backend. In production set ALLOWED_ORIGIN to
// your GitHub Pages origin, e.g. https://yourusername.github.io
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["POST", "OPTIONS"],
  })
);

// Health check
app.get("/", (_req, res) => res.json({ ok: true }));

// Equivalent of your /weather example — a proxy that hides the key.
app.post("/api/ai", async (req, res) => {
  const { prompt, isJson } = req.body || {};

  // Basic input validation
  if (typeof prompt !== "string" || prompt.length === 0 || prompt.length > 20000) {
    return res.status(400).json({ error: "A valid 'prompt' string is required." });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "Server is missing GEMINI_API_KEY." });

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: isJson ? "application/json" : "text/plain",
          },
        }),
      }
    );

    if (!upstream.ok) {
      const e = await upstream.json().catch(() => ({}));
      // Don't leak the raw upstream key/URL — just a clean message.
      return res.status(upstream.status).json({
        error: e?.error?.message || `Upstream error ${upstream.status}`,
      });
    }

    const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(502).json({ error: "Empty AI response." });

    // Return ONLY the data the frontend needs.
    return res.json({ text });
  } catch (err) {
    console.error("AI proxy failed:", err);
    return res.status(502).json({ error: "AI request failed." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI proxy listening on :${port}`));
