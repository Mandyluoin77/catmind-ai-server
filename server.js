import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 CATMIND STRICT CAT MODE");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.1-8b-instant";

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing!");
  process.exit(1);
}

/* -----------------------------
   SIMPLE MEMORY CACHE
----------------------------- */

const cache = new Map();
const CACHE_TIME = 1000 * 60 * 10;

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expire) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function setCache(key, value) {
  cache.set(key, {
    value,
    expire: Date.now() + CACHE_TIME
  });
}

/* -----------------------------
   ROUTES
----------------------------- */

app.get("/", (req, res) => {
  res.send("CATMIND AI – ONLINE 🐱");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    model: MODEL,
    time: new Date()
  });
});

/* -----------------------------
   MAIN AI ENDPOINT
----------------------------- */

app.post("/generate", async (req, res) => {
  try {
    let { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Missing text"
      });
    }

    text = text.slice(0, 600);

    const cached = getCache(text);
    if (cached) {
      return res.json({
        result: cached,
        cached: true
      });
    }

    const prompt = `
אתה וטרינר מומחה לחתולים בלבד.

ענה בעברית בפורמט הבא בלבד:

כותרת:
גורמים אפשריים:
רמת דחיפות: נמוכה / בינונית / גבוהה
מה מומלץ לעשות:

אם הסימפטומים מסוכנים ציין שיש לפנות לוטרינר.

סימפטומים:
${text}
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
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
                "You are a professional veterinary AI that specializes only in cats."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      }
    );

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Groq Error:", data);
      return res.status(500).json({
        error: "AI service error"
      });
    }

    const output =
      data?.choices?.[0]?.message?.content ||
      "לא נמצאה תשובה.";

    setCache(text, output);

    res.json({
      result: output,
      model: MODEL
    });

  } catch (err) {

    console.error("🔥 Server error:", err);

    if (err.name === "AbortError") {
      return res.status(504).json({
        error: "AI timeout"
      });
    }

    res.status(500).json({
      error: "Server error"
    });
  }
});

/* -----------------------------
   SERVER START
----------------------------- */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🐱 CATMIND AI ACTIVE");
  console.log("MODEL:", MODEL);
  console.log("PORT:", PORT);
});
