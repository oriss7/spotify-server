const spotifyService = require('./SpotifyService.js')

module.exports = { search }

async function search(req, res) {
  try {
    const { q } = req.query
    if (!q) return res.status(400).json({ message: 'Query is required' })
    const tracks = await spotifyService.searchTracks(q)
    res.json({ tracks })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search tracks' })
  }
}