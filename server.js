import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 RUNNING FILE VERSION 2.5 FLASH");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing!");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("SERVER VERSION 2.5 FLASH ACTIVE");
});

app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text field" });
    }

    console.log("📤 Sending request to model:", MODEL);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Gemini API Error:", data);
      return res.status(500).json({ error: data });
    }

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from model.";

    res.json({ result: output });

  } catch (err) {
    console.error("🔥 Server Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("🔥 GEMINI REST ACTIVE - MODEL:", MODEL);
});
