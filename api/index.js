const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();

app.use(express.json());

app.get("/api/generate-key", (req, res) => {
    const apiKey = crypto.randomBytes(16).toString('hex');
    res.json({ apiKey: apiKey });
});

app.get("/api/weather", async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ error: "City parameter is required" });
        }
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: process.env.OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });
        res.json(weatherResponse.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

app.get("/api/random-quote", async (req, res) => {
    try {
        const response = await axios.get('https://api.quotable.io/random');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch quote" });
    }
});

app.get("/api/github-user", async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: "GitHub username is required" });
    }
    try {
        const userResponse = await axios.get(`https://api.github.com/users/${username}`);
        res.json(userResponse.data);
    } catch (error) {
        res.status(404).json({ error: "User not found" });
    }
});

app.get("/api/currency-convert", async (req, res) => {
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
        return res.status(400).json({ error: "From, to, and amount parameters are required" });
    }
    try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const rate = response.data.rates[to];
        const convertedAmount = (parseFloat(amount) * rate).toFixed(2);
        res.json({ 
            from, 
            to, 
            amount: parseFloat(amount), 
            convertedAmount: parseFloat(convertedAmount), 
            rate 
        });
    } catch (error) {
        res.status(500).json({ error: "Currency conversion failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});