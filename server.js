import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// בדיקת מפתח API
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing");
} else {
    console.log("✅ GEMINI_API_KEY detected");
}

app.get("/", (req, res) => {
    res.status(200).send("CatMind AI server is running!");
});

app.post("/generate", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        console.log(`🔍 Analyzing: ${text}`);

        // הכתובת המדויקת עבור מודל ה-Flash בגרסה v1beta
        // שים לב: המודל חייב להיקרא gemini-1.5-flash-latest או gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `אתה וטרינר מומחה. נתח את הבעיה הבאה בחתול ותן המלצות ורמת דחיפות בעברית: ${text}` }] 
                }]
            }),
        });

        const data = await response.json();

        // אם גוגל מחזירה שגיאה
        if (data.error) {
            console.error("💥 Google API Error:", data.error);
            return res.status(data.error.code || 500).json({ error: data.error.message });
        }

        const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";
        res.json({ result: output });

    } catch (err) {
        console.error("💥 Server Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server live on port ${PORT}`);
});
