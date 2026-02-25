import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 CATMIND SSE STREAM FIX");

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
  res.send("CATMIND STREAM FIX ACTIVE 🐱");
});

app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).end("Missing text");

    const strictPrompt = `
אתה וטרינר קליני מומחה לחתולים בלבד.

פורמט חובה:
כותרת:
גורמים אפשריים:
רמת דחיפות:
מה מומלץ לעשות:

השב בצורה תמציתית וברורה.

שאלה: ${text}
`;

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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // Gemini שולח SSE: data: {json}
      const lines = chunk.split("\n");

      for (let line of lines) {
        line = line.trim();

        if (!line.startsWith("data:")) continue;

        const jsonString = line.replace("data:", "").trim();

        if (jsonString === "[DONE]") continue;

        try {
          const parsed = JSON.parse(jsonString);
          const textChunk =
            parsed.candidates?.[0]?.content?.parts?.[0]?.text;

          if (textChunk) {
            res.write(textChunk);
          }
        } catch (err) {
          // מתעלמים מ-chunks חלקיים
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
  console.log("🐱 GEMINI SSE STREAM ACTIVE - MODEL:", MODEL);
});
