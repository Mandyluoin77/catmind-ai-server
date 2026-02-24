import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.post("/generate", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        // התיקון הקריטי: הוספת הקידומת 'publishers/google/models/' 
        // זה מה שגוגל דורשת עכשיו עבור גרסת ה-Flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `נתח סימפטום של חתול בעברית: ${text}` }] }]
            }),
        });

        const data = await response.json();

        if (data.error) {
            console.error("Google API Error:", data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";
        res.json({ result: output });

    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});
