const config = {
    mongo: {
        dbUrl: process.env.MONGO_URL
    },
    jwt: {
        secret : process.env.JWT_SECRET
    },
    client: {
        url: process.env.CLIENT_URL
    },
    node: {
        env: process.env.NODE_ENV
    },
    n8n: {
        webhookUrl: process.env.N8N_WEBHOOK_URL
    },
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    },
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY
    },
    cohere: {
        apiKey: process.env.COHERE_API_KEY
    }
}
module.exports = config;