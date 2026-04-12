const playlistController = require('./PlaylistController.js')
const { requireAuth } = require('../../services/utilitis.js')

module.exports.connectPlaylistRoutes = (app) => {
    const endPoint = 'api/playlists'
    app.get(`/${endPoint}`, requireAuth, playlistController.getPlaylists)
    app.post(`/${endPoint}`, requireAuth, playlistController.createPlaylist)
    app.delete(`/${endPoint}/:playlistId`, requireAuth, playlistController.deletePlaylist)
    app.post(`/${endPoint}/:playlistId/songs`, requireAuth, playlistController.addSong)
    app.delete(`/${endPoint}/:playlistId/songs/:trackId`, requireAuth, playlistController.removeSong)
    app.put(`/${endPoint}/:playlistId`, requireAuth, playlistController.renamePlaylist)
}