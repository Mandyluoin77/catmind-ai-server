import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 CATMIND STRICT CAT MODE (GROQ)");

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama3-70b-8192"; // Llama 3 70B on Groq

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing!");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("CATMIND AI – STRICT CAT MODE 🐱 (GROQ)");
});

app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const strictPrompt = `
אתה וטרינר קליני מומחה לחתולים בלבד.

חוקי חובה:
- אסור להתייחס לבני אדם.
- אם המונח רפואי כללי – התייחס אליו בהקשר של חתול בלבד.
- אם אינך בטוח – ציין שמדובר בהקשר וטרינרי של חתולים.

פורמט חובה:
כותרת: <שם הסימפטום אצל חתולים>
גורמים אפשריים:
רמת דחיפות:
מה מומלץ לעשות:

שאלה: ${text}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: "You are a veterinary expert that analyzes cat symptoms only."
            },
            {
              role: "user",
              content: strictPrompt
            }
          ],
          temperature: 0.3
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Groq Error:", data);
      return res.status(500).json(data);
    }

    const output =
      data.choices?.[0]?.message?.content ||
      "No response";

    res.json({ result: output });

  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("🐱 STRICT CAT AI ACTIVE - MODEL:", MODEL);
});
