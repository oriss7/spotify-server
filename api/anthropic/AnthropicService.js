const { CohereClientV2 } = require('cohere-ai')
const config = require('../../config/index.js')
const { tools, handleToolCall } = require('./McpServer.js')

const cohere = new CohereClientV2({ token: config.cohere.apiKey })

const SYSTEM_PROMPT = 'You are a music expert assistant integrated into a Spotify clone app. You have access to the user\'s real playlists and liked songs through tools — always use these tools when the user asks about their playlists or liked songs. You can add and remove songs, create and delete playlists using tools. You cannot create or delete the Liked Songs playlist. Only answer questions related to music topics. If asked about anything unrelated to music, politely decline.'

async function getSearchTerm(query) {
    const response = await fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.cohere.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'command-a-03-2025',
            messages: [
                {
                    role: 'system',
                    content: `You are a Spotify search term generator. 
Your ONLY job is to output a Spotify search term based on the user's music request.
If the request is NOT about music, songs, artists, albums, or genres, output exactly: NOT_MUSIC
Never explain yourself. Never add extra text. Output only the search term or NOT_MUSIC.
Think semantically — "happy songs" should become "feel good upbeat pop", "1960s songs" should become "classic hits 1960s rock pop", "sad songs" should become "melancholic sad ballads".`
                },
                { role: 'user', content: query }
            ]
        })
    })
    const data = await response.json()
    const result = data.message.content[0].text.trim()
    if (result === 'NOT_MUSIC') {
        const error = new Error('Please search for something music related')
        error.status = 400
        throw error
    }
    return result
}

async function chat(messages, userId) {
    let response
    try {
        response = await cohere.chat({
            model: 'command-r-plus-08-2024',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages
            ],
            tools
        })
    } catch(e) {
        console.log('Full error:', JSON.stringify(e))
        throw e
    }

    if (response.message.toolCalls && response.message.toolCalls.length > 0) {
        const toolResults = await Promise.all(
            response.message.toolCalls.map(async (toolCall) => {
                const result = await handleToolCall(toolCall.function.name, userId, toolCall.function.arguments)
                return { role: 'tool', toolCallId: toolCall.id, content: result }
            })
        )

        const finalResponse = await cohere.chat({
            model: 'command-r-plus-08-2024',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages,
                response.message,
                ...toolResults
            ],
            tools
        })

        const finalContent = finalResponse.message.content
        return { reply: finalContent?.[0]?.text.trim() || 'Done!', modified: true }
    }

    return { reply: response.message.content[0].text.trim(), modified: false }
}

module.exports = { getSearchTerm, chat }