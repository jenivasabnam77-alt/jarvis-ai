const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());
app.use(express.static("."));

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {

    try {

        const message = req.body.message;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const response = await client.responses.create({

            model: "gpt-6-luna",

            instructions: `
You are JARVIS, a futuristic personal AI assistant.

Be intelligent, friendly and concise.

Answer naturally like a real conversational assistant.

Do not repeatedly say that you are a basic command system.

If the user asks a normal question, actually answer it.
`,

            input: message
        });

        res.json({
            reply: response.output_text
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "AI request failed"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`JARVIS running on port ${PORT}`);
});