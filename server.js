import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ===== Gemini Init =====
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest"
});

// ===== Root Route =====
app.get("/", (req, res) => {
  res.send("CatMind AI Server Running (Gemini)");
});

// ===== Analyze Endpoint =====
app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    const result = await model.generateContent(`
אתה מומחה להתנהגות חתולים.
ענה בעברית בצורה מקצועית וברורה.

שאלה:
${text}
    `);

    const response = result.response.text();

    res.json({
      result: response
    });

  } catch (error) {
    console.error("Gemini ERROR:", error);
    res.status(500).json({
      error: error.message || "AI failure"
    });
  }
});

// ===== PORT =====
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
