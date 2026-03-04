import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 CATMIND PRO MODE");

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
  res.send("CATMIND AI PRO 🐱");
});

app.post("/generate", async (req, res) => {

  try {

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const strictPrompt = `
אתה וטרינר מומחה לחתולים בלבד.

נתח את הסימפטומים.

החזר JSON בלבד:

{
"title": "",
"possible_causes": [],
"urgency_level": "Low | Medium | High | Emergency",
"recommended_action": ""
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
              content: "You are a veterinary AI that diagnoses cat symptoms."
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

    let output = data?.choices?.[0]?.message?.content || "{}";

    try {
      output = JSON.parse(output);
    } catch {
      output = { raw: output };
    }

    res.json(output);

  } catch (err) {

    console.error("🔥 Server error:", err);

    res.status(500).json({
      error: err.message
    });

  }

});

app.listen(process.env.PORT || 10000, () => {
  console.log("🐱 CATMIND PRO AI ACTIVE - MODEL:", MODEL);
});
