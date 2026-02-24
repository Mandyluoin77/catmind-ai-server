import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

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

        // הוספת הנחיה ל-AI כדי שתיתן תשובה וטרינרית אחראית בעברית
        const prompt = `You are a professional veterinary assistant. 
        The user is reporting the following cat symptom: "${text}". 
        Please provide a concise analysis in Hebrew. 
        Include: 1. Possible reasons. 2. Level of urgency. 
        3. A clear disclaimer that this is not a substitute for a real vet.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                }),
            }
        );

        const data = await response.json();
        
        // בדיקה אם ה-API החזיר שגיאה (למשל מפתח לא תקין או מכסה שנגמרה)
        if (data.error) {
            console.error("Gemini Error:", data.error);
            return res.status(500).json({ error: "AI Service Error" });
        }

        const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה מהשרת.";
        
        res.json({ result: output });
    } catch (err) {
        console.error("💥 Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});
