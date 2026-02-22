import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

// טעינת משתני סביבה (רלוונטי להרצה מקומית)
dotenv.config();

const app = express();

// הגדרות Middleware
app.use(cors());
app.use(express.json());

// בדיקת תקינות מפתח ה-API
// תיקון: הוספת ! כדי לבדוק אם המפתח חסר
if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing from environment variables!");
    process.exit(1);
}

// אתחול Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

// נקודת קצה לבדיקה שהשרת עובד
app.get("/", (req, res) => {
    res.send("CatMind AI Server Running (Gemini 1.5 Flash)");
});

// נקודת הקצה המרכזית לניתוח טקסט
app.post("/analyze", async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Missing text in request body" });
    }

    try {
        // שליחת הפרומפט ל-Gemini
        const result = await model.generateContent(`
            אתה מומחה לניתוח התנהגות חתולים. 
            נתח את הטקסט הבא והסבר את התנהגות החתול בצורה מקצועית וברורה:
            
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
            error: error.message || "AI failure",
            details: "Please check if the API key is valid and has credits."
        });
    }
});

// הגדרת פורט - Render מספק את הפורט באופן אוטומטי
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
