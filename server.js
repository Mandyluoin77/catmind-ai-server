import express from "express";

const app = express();

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Server is alive");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Listening on port", PORT);
});
