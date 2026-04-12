const { PlaylistModel } = require('./PlaylistModel.js')

module.exports = { getPlaylists, createPlaylist, deletePlaylist, renamePlaylist, addSong, removeSong }

async function getPlaylists(userId) {
    return await PlaylistModel.find({ userId })
}

async function createPlaylist(userId, name, isDefault = false) {
    const existing = await PlaylistModel.findOne({ userId, isDefault: true })
    if (isDefault && existing) return getPlaylists(userId)
    await PlaylistModel.create({ userId, name, isDefault, songs: [] })
    return getPlaylists(userId)
}

async function deletePlaylist(userId, playlistId) {
    const playlist = await PlaylistModel.findOne({ _id: playlistId, userId })
    if (!playlist) throw Object.assign(new Error('Playlist not found'), { status: 404 })
    if (playlist.isDefault) throw Object.assign(new Error('Cannot delete liked songs playlist'), { status: 400 })
    await PlaylistModel.deleteOne({ _id: playlistId, userId })
    return getPlaylists(userId)
}

async function addSong(userId, playlistId, song) {
    const playlist = await PlaylistModel.findOne({ _id: playlistId, userId })
    if (!playlist) throw Object.assign(new Error('Playlist not found'), { status: 404 })
    const alreadyExists = playlist.songs.some(s => s.trackId === song.trackId)
    if (alreadyExists) return getPlaylists(userId)
    playlist.songs.push(song)
    await playlist.save()
    return getPlaylists(userId)
}

async function removeSong(userId, playlistId, trackId) {
    const playlist = await PlaylistModel.findOne({ _id: playlistId, userId })
    if (!playlist) throw Object.assign(new Error('Playlist not found'), { status: 404 })
    playlist.songs = playlist.songs.filter(s => s.trackId !== trackId)
    await playlist.save()
    return getPlaylists(userId)
}

async function renamePlaylist(userId, playlistId, name) {
    const playlist = await PlaylistModel.findOne({ _id: playlistId, userId })
    if (!playlist) throw Object.assign(new Error('Playlist not found'), { status: 404 })
    if (playlist.isDefault) throw Object.assign(new Error('Cannot rename liked songs playlist'), { status: 400 })
    playlist.name = name
    await playlist.save()
    return getPlaylists(userId)
}