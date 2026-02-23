import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/*
  Render מספק PORT דינמי.
  אסור להשתמש בפורט קשיח.
*/
const PORT = process.env.PORT;

if (!PORT) {
  console.error("❌ PORT not provided by Render");
  process.exit(1);
}

console.log("🔎 PORT from Render:", PORT);
console.log("🔎 GEMINI KEY:", process.env.GEMINI_API_KEY ? "FOUND" : "MISSING");

let genAI = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/* ===== Health Check ===== */
app.get("/", (req, res) => {
  res.status(200).send("CatMind AI server is running");
});

/* ===== Analyze Endpoint ===== */
app.post("/analyze", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        error: "GEMINI_API_KEY not configured"
      });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "No text provided"
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(text);
    const response = await result.response;
    const output = response.text();

    res.json({ result: output });

  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "AI error" });
  }
});

/* ===== Start Server ===== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
