const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const API_TOKEN = "e3c6897336e1867a9f28744754de9f51";

app.use(bodyParser.json());

app.post('/fetch-article', async (req, res) => {
    try {
        if (!req.body.url || !isValidUrl(req.body.url)) {
            return res.status(400).json({ error: "Missing or invalid 'url' parameter." });
        }

        const newsUrl = encodeURIComponent(req.body.url);
        const apiUrl = `https://api.diffbot.com/v3/article?url=${newsUrl}&token=${API_TOKEN}`;

        console.log("Generated URL:", apiUrl);

        const response = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' }
        });

        if (response.status !== 200) {
            return res.status(response.status).json({ error: `HTTP Error: ${response.status}` });
        }

        const data = response.data;
        if (!data.objects || !data.objects[0]) {
            return res.status(500).json({ error: "Failed to extract article content." });
        }

        const article = data.objects[0];
        res.json({
            title: article.title || "No title found",
            author: article.author || "Unknown",
            date: article.date || "No date available",
            content: article.text || "No content available"
        });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
