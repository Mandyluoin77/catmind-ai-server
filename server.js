import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 CATMIND STRICT CAT MODE - CLEAN STREAM");

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
  res.send("CATMIND AI – STREAMING ACTIVE 🐱");
});

app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).end("Missing text");

    const strictPrompt = `
אתה וטרינר קליני מומחה לחתולים בלבד.

חוקי חובה:
- אסור להתייחס לבני אדם.
- אם המונח רפואי כללי – התייחס אליו בהקשר של חתול בלבד.

פורמט חובה:
כותרת:
גורמים אפשריים:
רמת דחיפות:
מה מומלץ לעשות:

השב בצורה תמציתית וברורה.

שאלה: ${text}
`;

    // Headers ל-Streaming תקין
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: strictPrompt }] }
          ],
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.4
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Gemini error:", errorText);
      return res.status(500).end("Gemini error");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop(); // שומר שורה חלקית

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const parsed = JSON.parse(line);

          const textChunk =
            parsed.candidates?.[0]?.content?.parts?.[0]?.text;

          if (textChunk) {
            res.write(textChunk);
          }
        } catch {
          // מתעלם משורות JSON לא שלמות
        }
      }
    }

    res.end();

  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).end("Server error");
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("🐱 GEMINI STREAM CLEAN ACTIVE - MODEL:", MODEL);
});
