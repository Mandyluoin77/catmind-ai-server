import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 CATMIND STRICT CAT MODE");

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
  res.send("CATMIND AI – ONLINE 🐱");
});

app.post("/generate", async (req, res) => {

  try {

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const prompt = `
אתה וטרינר מומחה לחתולים בלבד.

נתח רק את הסימפטום הבא.

סימפטום:
${text}

ענה בדיוק בפורמט:

כותרת:
גורמים אפשריים:
רמת דחיפות:
מה מומלץ לעשות:
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
                "You are a veterinary AI specialized ONLY in cat health. Answer only about the symptom given."
            },
            {
              role: "user",
              content: prompt
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

    const output =
      data?.choices?.[0]?.message?.content || "לא נמצאה תשובה";

    res.json({ result: output });

  } catch (err) {

    console.error("🔥 Server error:", err);

    res.status(500).json({
      error: "Server error",
      details: err.message
    });

  }

});

app.listen(process.env.PORT || 10000, () => {
  console.log("🐱 CATMIND AI ACTIVE - MODEL:", MODEL);
});
