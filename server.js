import express from "express";
import cors from "cors";
import dotenv from "dotenv";

console.log("🔥 VERSION 5 ACTIVE");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

/* בדיקת חיים */
app.get("/", (req, res) => {
    res.send("✅ CatMind AI Server is running");
});

/* Route עיקרי */
app.post("/generate", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        console.log("🔍 Analyzing:", text);

        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `נתח סימפטום של חתול בעברית ותן תשובה מקצועית וברורה: ${text}`
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("💥 Google API Error:", data);
            return res.status(response.status).json({
                error: data.error?.message || "Google API error"
            });
        }

        const output =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "לא התקבלה תשובה.";

        res.json({ result: output });

    } catch (err) {
        console.error("💥 Server Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server live on port ${PORT}`);
});
