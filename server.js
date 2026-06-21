import express from "express";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Allow your frontend to call this backend
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
  methods: ["GET", "POST", "OPTIONS"]
}));

// Health check route
app.get("/", (_req, res) => {
  res.json({ ok: true });
});

// AI route — handles POST requests
app.post("/api/ai", async (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "A valid prompt string is required." });
  }

  // Example response (replace with your Gemini logic)
  res.json({ text: `Generated itinerary for: ${prompt}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
