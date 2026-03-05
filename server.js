const button = document.getElementById("generateBtn");
const input = document.getElementById("symptomsInput");
const resultBox = document.getElementById("resultBox");

button.addEventListener("click", async () => {

    const text = input.value.trim();

    if (!text) {
        resultBox.innerHTML = "אנא הכנס סימפטומים.";
        return;
    }

    resultBox.innerHTML = "🔎 CatMind מנתח את הסימפטומים...";

    try {

        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!data.result) {
            resultBox.innerHTML = "לא התקבלה תשובה.";
            return;
        }

        /* אם השרת מחזיר JSON */

        if (typeof data.result === "object") {

            const r = data.result;

            resultBox.innerHTML = `
            <h3>${r.title || ""}</h3>

            <b>רמת דחיפות:</b> ${r.urgency || ""}<br><br>

            <b>גורמים אפשריים:</b>
            <ul>
            ${(r.possible_causes || []).map(c => `<li>${c}</li>`).join("")}
            </ul>

            <b>מה מומלץ לעשות:</b>
            <ul>
            ${(r.recommended_actions || []).map(a => `<li>${a}</li>`).join("")}
            </ul>

            <b>מתי לפנות לוטרינר:</b><br>
            ${r.when_to_see_vet || ""}
            `;

        } else {

            /* אם השרת מחזיר טקסט רגיל */

            resultBox.innerHTML =
                data.result.replace(/\n/g, "<br>");

        }

    } catch (err) {

        console.error(err);

        resultBox.innerHTML =
            "❌ שגיאה בחיבור לשרת.";

    }

});
