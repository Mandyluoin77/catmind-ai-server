import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });

    const prompt = `
אתה וטרינר קליני מומחה לחתולים בלבד.

ענה בעברית בלבד בצורה מפורטת וברורה.

מבנה התשובה חייב להיות כך:

## כותרת הבעיה

### גורמים אפשריים
הסבר מפורט.

### רמת דחיפות
האם זה מצב חירום או לא ולמה.

### מה מומלץ לעשות
הנחיות ברורות לבעל החתול.

שאלה: ${text}
`;

    const response = await fetch(
      \`https://generativelanguage.googleapis.com/v1beta/models/\${MODEL}:generateContent?key=\${GEMINI_API_KEY}\`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: prompt }] }
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1200
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: "Model error" });
    }

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "לא התקבלה תשובה.";

    res.json({ result: output });

  } catch (err) {
    res.status(500).json({ error: "Server failure" });
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("CatMind server running");
});
