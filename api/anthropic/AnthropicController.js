const anthropicService = require('./AnthropicService.js');

module.exports = { aiSearch, chatMusic }

async function aiSearch(req, res) {
    try {
        const { query } = req.body
        const searchTerm = await anthropicService.getSearchTerm(query)
        res.status(200).json({ searchTerm })
    } catch (error) {
        const status = error.status || 500
        res.status(status).json({ message: error.message || 'AI search failed' })
    }
}

async function chatMusic(req, res) {
    try {
        const { messages } = req.body
        const { reply, modified } = await anthropicService.chat(messages, req.user.id)
        res.status(200).json({ reply, modified })
    } catch (error) {
        const status = error.status || 500
        res.status(status).json({ message: error.message || 'Chat failed' })
    }
}