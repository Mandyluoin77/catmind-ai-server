import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 CATMIND STRICT CAT MODE");

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
  res.send("CATMIND AI – STRICT CAT MODE 🐱");
});

app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const strictPrompt = `
אתה וטרינר קליני מומחה לחתולים בלבד.

חוקים:
- לעולם אל תתייחס לבני אדם.
- תמיד התייחס לחתולים בלבד.
- אם יש ספק רפואי – ציין זאת.
- כתוב בעברית מקצועית וברורה.

החזר תשובה בפורמט Markdown תקני בלבד:

## <שם הבעיה>

### גורמים אפשריים:
- סעיף 1
- סעיף 2

### רמת דחיפות:
טקסט ברור

### מה מומלץ לעשות:
טקסט ברור ומעשי

שאלה: ${text}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: strictPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
            topP: 0.9
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
      "לא התקבלה תשובה מהמודל.";

    res.json({ result: output });

  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("🐱 STRICT CAT GEMINI ACTIVE - MODEL:", MODEL);
});
