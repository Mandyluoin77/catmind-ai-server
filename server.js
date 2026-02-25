import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 CATMIND STABLE MODE");

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing!");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("CATMIND STABLE ACTIVE 🐱");
});

app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });

    const prompt = `
אתה וטרינר קליני מומחה לחתולים בלבד.

השב בפורמט הבא בלבד:

כותרת:
גורמים אפשריים:
רמת דחיפות:
מה מומלץ לעשות:

השב בצורה תמציתית וברורה (עד 6–8 שורות לכל סעיף).

שאלה: ${text}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: prompt }] }
          ],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.3
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Gemini Error:", data);
      return res.status(500).json(data);
    }

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "לא התקבלה תשובה.";

    res.json({ result: output });

  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("🐱 GEMINI STABLE ACTIVE - MODEL:", MODEL);
});
