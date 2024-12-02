const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/", async (req, res) => {
	res.status(400).send("test");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
