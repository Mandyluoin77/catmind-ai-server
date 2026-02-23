import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
  process.exit(1);
}

console.log("✅ GEMINI_API_KEY detected");

app.get("/", (req, res) => {
  res.status(200).send("CatMind AI server is running");
});

app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "No text provided"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("🔥 Gemini API Error:", data);
      return res.status(500).json({
        error: "AI error",
        details: data
      });
    }

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return res.json({ result: output });

  } catch (err) {
    console.error("🔥 Server Error:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
