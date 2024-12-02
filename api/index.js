const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// In-memory storage for API keys
const validApiKeys = new Set();

function validateApiKey(req, res, next) {
    const apiKey = req.query.key;
    
    if (!apiKey) {
        return res.status(401).json({ error: "Please provide a key." });
    }
    
    if (!validApiKeys.has(apiKey)) {
        return res.status(403).json({ error: "Invalid key." });
    }
    
    next();
}

app.get("/api/generate-key", (req, res) => {
    const apiKey = crypto.randomBytes(64).toString('hex');
    validApiKeys.add(apiKey);
    res.json({ apiKey: apiKey });
});
app.get("/api/weather", validateApiKey, async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ error: "City parameter is required" });
        }

        const weatherResponse = await axios.get(`https://wttr.in/${city}?format=j1`);
        res.json(weatherResponse.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

app.get('/api/chatapi', async (req, res) => {
    try {
        const response = await axios.post('https://huggingface.co/chat/completions', {
            inputs: "Hello, how are you today?",
            parameters: {
                max_new_tokens: 250
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CHATAPI}`
            }
        });

        res.json({ generated_text: response.data.generated_text });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'An error occurred while fetching the chat response.' });
    }
});

app.get("/api/random-quote", validateApiKey, async (req, res) => {
    try {
        const response = await axios.get('https://api.quotable.io/random');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch quote" });
    }
});

app.get("/api/github-user", validateApiKey, async (req, res) => {
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

app.get("/api/currency-convert", validateApiKey, async (req, res) => {
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