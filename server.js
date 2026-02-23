import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// בדיקת משתנה סביבה (לא מפיל שרת)
console.log("ENV CHECK:", process.env.GEMINI_API_KEY ? "FOUND" : "MISSING");

let genAI = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

app.get("/", (req, res) => {
  res.send("CatMind AI server is running");
});

app.post("/analyze", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(text);
    const response = await result.response;
    const output = response.text();

    res.json({ result: output });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
