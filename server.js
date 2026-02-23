import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   🔐 בדיקת API KEY
================================= */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
  process.exit(1);
}

/* ===============================
   🤖 Initialize Gemini
================================= */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

/* ===============================
   🏠 Health Route
================================= */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Server running",
  });
});

/* ===============================
   ✨ Generate Route
================================= */
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      output: text,
    });

  } catch (error) {
    console.error("🔥 Gemini Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* ===============================
   🚀 Start Server
================================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
