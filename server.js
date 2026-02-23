import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// הגדרת פורט קריטית עבור Render
const PORT = process.env.PORT || 10000;

// בדיקת מפתח
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing!");
} else {
    console.log("✅ GEMINI_API_KEY detected");
}

app.get("/", (req, res) => {
    res.status(200).send("CatMind AI server is running");
});

// שינוי הנתיב ל-generate כדי שיתאים ל-Frontend שלך
app.post("/generate", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }]
                }),
            }
        );

        const data = await response.json();
        const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        
        res.json({ result: output });
    } catch (err) {
        console.error("💥 Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// האזנה לכתובת 0.0.0.0 חובה ב-Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
