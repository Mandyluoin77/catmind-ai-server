import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

console.log("🔥 CatMind AI SDK VERSION ACTIVE");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

/* בדיקת חיים */
app.get("/", (req, res) => {
  res.send("CatMind AI Server is running");
});

/* Route עיקרי */
app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment variables" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(
      `נתח סימפטום של חתול בעברית ותן תשובה מקצועית וברורה: ${text}`
    );

    const response = await result.response;
    const output = response.text();

    res.json({ result: output });

  } catch (err) {
    console.error("💥 Server Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server live on port ${PORT}`);
});
