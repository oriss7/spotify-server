const playlistService = require('./PlaylistService.js')

module.exports = { getPlaylists, createPlaylist, deletePlaylist, renamePlaylist, addSong, removeSong }

async function getPlaylists(req, res) {
    try {
        const playlists = await playlistService.getPlaylists(req.user.id)
        res.status(200).json({ playlists })
    } catch (error) {
        const status = error.status || 500
        res.status(status).json({ message: error.message || 'Failed to get playlists' })
    }
}

async function createPlaylist(req, res) {
    try {
        const { name, isDefault } = req.body
        const playlists = await playlistService.createPlaylist(req.user.id, name, isDefault)
        res.status(201).json({ playlists })
    } catch (error) {
        const status = error.status || 500
        res.status(status).json({ message: error.message || 'Failed to create playlist' })
    }
}

async function deletePlaylist(req, res) {
    try {
        const { playlistId } = req.params
        const playlists = await playlistService.deletePlaylist(req.user.id, playlistId)
        res.status(200).json({ playlists })
    } catch (error) {
        const status = error.status || 500
        res.status(status).json({ message: error.message || 'Failed to delete playlist' })
    }
}

async function addSong(req, res) {
    try {
        const { playlistId } = req.params
        const { trackId, name, artist, albumImage, duration_ms } = req.body
        const playlists = await playlistService.addSong(req.user.id, playlistId, { trackId, name, artist, albumImage, duration_ms })
        res.status(200).json({ playlists })
    } catch (error) {
        const status = error.status || 500
        res.status(status).json({ message: error.message || 'Failed to add song' })
    }
}

async function removeSong(req, res) {
    try {
        const { playlistId, trackId } = req.params
        const playlists = await playlistService.removeSong(req.user.id, playlistId, trackId)
        res.status(200).json({ playlists })
    } catch (error) {
        const status = error.status || 500
        res.status(status).json({ message: error.message || 'Failed to remove song' })
    }
}

async function renamePlaylist(req, res) {
    try {
        const { playlistId } = req.params
        const { name } = req.body
        const playlists = await playlistService.renamePlaylist(req.user.id, playlistId, name)
        res.status(200).json({ playlists })
    } catch (error) {
        const status = error.status || 500
        res.status(status).json({ message: error.message || 'Failed to rename playlist' })
    }
}