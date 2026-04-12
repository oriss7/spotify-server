const express = require('express')
const { search } = require('./SpotifyController.js')

function connectSpotifyRoutes(app) {
  const router = express.Router()
  router.get('/search', search)
  app.use('/api/spotify', router)
}

module.exports = { connectSpotifyRoutes }