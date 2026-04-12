const config = require('../../config/index.js')

let accessToken = null
let tokenExpiry = null

async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) return accessToken

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(config.spotify.clientId + ':' + config.spotify.clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  })

  const data = await response.json()
  accessToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in * 1000)
  return accessToken
}

async function searchTracks(query) {
  const token = await getAccessToken()
  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10&market=US`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  return data.tracks.items
}

module.exports = { searchTracks }