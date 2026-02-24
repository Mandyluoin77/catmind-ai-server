import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// בדיקת מפתח
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing from environment variables");
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

        // שימוש בכתובת v1 היציבה - זה הפתרון לשגיאת ה-404 שראינו בלוגים
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `נתח סימפטום של חתול בעברית: ${text}` }] }]
            }),
        });

        const data = await response.json();

        // בדיקה אם גוגל החזירה שגיאה
        if (data.error) {
            console.error("💥 Gemini API Error:", data.error);
            return res.status(500).json({ error: "AI Service Error", details: data.error.message });
        }

        const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה מה-AI.";
        res.json({ result: output });

    } catch (err) {
        console.error("💥 Server Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});
