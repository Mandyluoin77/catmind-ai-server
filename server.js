import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // ודא שזה מותקן ב-package.json

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// הגדרת פורט שמתאימה ל-Render
const PORT = process.env.PORT || 10000;

// בדיקה אם המפתח קיים
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing from Environment Variables");
} else {
    console.log("✅ GEMINI_API_KEY detected");
}

// נתיב בדיקה בסיסי
app.get("/", (req, res) => {
    res.status(200).send("CatMind AI server is running and ready!");
});

// הנתיב המרכזי שבו ה-Frontend משתמש
app.post("/generate", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        console.log("📩 Received request for text:", text.substring(0, 50) + "...");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: text }]
                        }
                    ]
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Gemini API Error:", data);
            return res.status(response.status).json({
                error: "Gemini API error",
                details: data
            });
        }

        // חילוץ התשובה מהמבנה של גוגל
        const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
        
        console.log("✅ Response generated successfully");
        return res.json({ result: output });

    } catch (err) {
        console.error("💥 Server Error:", err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        });
    }
});

// הפעלת השרת על 0.0.0.0 כדי ש-Render יוכל להתחבר
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});
