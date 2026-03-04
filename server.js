import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 CATMIND STRICT CAT MODE (GROQ)");

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.1-8b-instant";

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

חוקים:
- התייחס רק לחתולים.
- אם המידע לא מספיק ציין זאת.
- אל תדבר על בני אדם.

החזר תשובה בפורמט JSON בלבד:

{
"title": "שם הבעיה אצל חתולים",
"possible_causes": ["גורם 1","גורם 2","גורם 3"],
"urgency_level": "Low | Medium | High | Emergency",
"recommended_action": "מה בעל החתול צריך לעשות"
}

סימפטומים:
${text}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a veterinary AI specialized only in cat health and symptoms."
            },
            {
              role: "user",
              content: strictPrompt
            }
          ],
          temperature: 0.2
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Groq Error:", data);
      return res.status(500).json(data);
    }

    const raw = data?.choices?.[0]?.message?.content || "";

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        title: "אבחון חתולים",
        possible_causes: [],
        urgency_level: "Low",
        recommended_action: raw
      };
    }

    // מחזיר גם JSON מובנה וגם result טקסטואלי לתאימות לאתר הישן
    res.json({
      result: raw,
      title: parsed.title,
      possible_causes: parsed.possible_causes,
      urgency_level: parsed.urgency_level,
      recommended_action: parsed.recommended_action
    });
  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("🐱 CATMIND AI ACTIVE - MODEL:", MODEL);
});
