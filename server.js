import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

console.log("🔥 GEMINI OFFICIAL SDK ACTIVE");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("✅ CatMind AI Server is running");
});

app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-pro"
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
