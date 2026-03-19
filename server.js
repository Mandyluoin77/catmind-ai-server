import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 👇 זה כבר אצלך וזה מצוין
app.use((req, res, next) => {
  console.log("👉", req.method, req.url);
  next();
});

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile"; // שדרוג מ-8b ל-70b — הרבה יותר מדויק

if (!GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("CATMIND AI ONLINE");
});

app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });

    // ping — wake-up call, no need to call Groq
    if (text === "ping") return res.json({ result: "pong" });

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: "You are a veterinary AI specialized ONLY in cats. Always respond in Hebrew.",
            },
            {
              role: "user",
              content: text, // הפרומפט המלא מגיע מה-client
            },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      return res.status(502).json({ error: "Groq API error", detail: data });
    }

    const output = data?.choices?.[0]?.message?.content || "לא נמצאה תשובה";
    res.json({ result: output });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("CATMIND SERVER RUNNING");
});
