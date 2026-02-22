import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Root route (בדיקה שהשרת חי)
app.get("/", (req, res) => {
  res.send("CatMind AI Server Running");
});

// ===== AI Endpoint =====
app.post("/analyze", async (req, res) => {

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "אתה וטרינר מנוסה. תן אבחון ראשוני קצר וברור. אם יש סימני חירום ציין זאת מיד."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.4
    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (error) {

    console.error("FULL ERROR:", error);

    res.status(500).json({
      error: error.message || "AI failure"
    });
  }
});

// ===== PORT =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
