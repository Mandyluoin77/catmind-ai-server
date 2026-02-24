import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

console.log("🔥 NEW GEMINI SDK ACTIVE");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.send("CatMind AI Server is running");
});

app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `נתח סימפטום של חתול בעברית ותן תשובה מקצועית וברורה: ${text}`
    });

    res.json({ result: response.text });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server live on port ${PORT}`);
});
