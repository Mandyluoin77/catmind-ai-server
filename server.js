import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// מאפשר לאתר שלך (צד לקוח) לגשת לשרת ללא חסימות CORS
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// בדיקת תקינות מפתח ה-API בעת עליית השרת
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ שגיאה: GEMINI_API_KEY חסר בהגדרות הסביבה (Environment Variables)");
} else {
    console.log("✅ מפתח GEMINI_API_KEY זוהה בהצלחה");
}

// נתיב בדיקה בסיסי
app.get("/", (req, res) => {
    res.status(200).send("CatMind AI Server is Running!");
});

// הנתיב המרכזי לאבחון הסימפטומים
app.post("/generate", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        console.log(`🔍 מנתח סימפטום: ${text}`);

        // הגדרת הנחיה (Prompt) כדי שהתשובה תהיה בעברית ומקצועית
        const prompt = `אתה עוזר וטרינרי מקצועי. נתח את הסימפטום הבא של חתול: "${text}". 
        ספק תשובה בעברית הכוללת: סיבות אפשריות, רמת דחיפות, והמלצה לצעד הבא. 
        חשוב להוסיף דיסקליימר שזהו אינו תחליף לייעוץ וטרינרי מקצועי.`;

        // שימוש ב-API היציב (v1) כדי למנוע שגיאת 404
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                }),
            }
        );

        const data = await response.json();

        // טיפול בשגיאות שחוזרות מה-API של Google
        if (data.error) {
            console.error("💥 שגיאה מה-API של Gemini:", data.error);
            return res.status(data.error.code || 500).json({ 
                error: "השירות של Google נתקל בבעיה", 
                details: data.error.message 
            });
        }

        // חילוץ התשובה מהמבנה של Gemini
        const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה מה-AI.";
        
        res.json({ result: output });

    } catch (err) {
        console.error("💥 שגיאה פנימית בשרת:", err);
        res.status(500).json({ error: "שגיאה בשרת ה-AI" });
    }
});

// האזנה לכל הכתובות בפורט ש-Render מקצה
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 השרת באוויר ופועל בפורט: ${PORT}`);
});
