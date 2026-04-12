const { PlaylistModel } = require('../playlist/PlaylistModel.js')
const { searchTracks } = require('../spotify/SpotifyService.js')

async function handleToolCall(toolName, userId, toolInput = {}) {
    if (typeof toolInput === 'string') toolInput = JSON.parse(toolInput)
    if (toolName === 'get_playlists') {
        const playlists = await PlaylistModel.find({ userId })
        return JSON.stringify(playlists.map(p => ({
            name: p.isDefault ? 'Liked Songs' : p.name,
            songCount: p.songs.length,
            songs: p.songs.map(s => ({ name: s.name, artist: s.artist }))
        })))
    }
    if (toolName === 'get_liked_songs') {
        const liked = await PlaylistModel.findOne({ userId, isDefault: true })
        if (!liked) return 'No liked songs found'
        return JSON.stringify(liked.songs.map(s => ({ name: s.name, artist: s.artist })))
    }
    if (toolName === 'remove_songs_by_artist') {
        const { artist, playlistName } = toolInput
        const isDefault = playlistName.toLowerCase() === 'liked songs'
        const playlist = isDefault
            ? await PlaylistModel.findOne({ userId, isDefault: true })
            : await PlaylistModel.findOne({ userId, name: playlistName })
        if (!playlist) return `Playlist "${playlistName}" not found`
        const before = playlist.songs.length
        playlist.songs = playlist.songs.filter(s => s.artist.toLowerCase() !== artist.toLowerCase())
        const removed = before - playlist.songs.length
        if (removed === 0) return `No songs by ${artist} found in ${playlistName}`
        await playlist.save()
        return `Removed ${removed} song(s) by ${artist} from ${playlistName}`
    }
    if (toolName === 'search_and_add_song') {
        const { songQuery, playlistName } = toolInput
        const tracks = await searchTracks(songQuery)
        if (!tracks || tracks.length === 0) return `Could not find "${songQuery}" on Spotify`
        const track = tracks[0]
        const isDefault = playlistName.toLowerCase() === 'liked songs'
        const playlist = isDefault
            ? await PlaylistModel.findOne({ userId, isDefault: true })
            : await PlaylistModel.findOne({ userId, name: playlistName })
        if (!playlist) return `Playlist "${playlistName}" not found`
        const alreadyExists = playlist.songs.some(s => s.trackId === track.id)
        if (alreadyExists) return `"${track.name}" is already in ${playlistName}`
        playlist.songs.push({
            trackId: track.id,
            name: track.name,
            artist: track.artists[0].name,
            albumImage: track.album.images[0]?.url,
            duration_ms: track.duration_ms
        })
        await playlist.save()
        return `Added "${track.name}" by ${track.artists[0].name} to ${playlistName}`
    }
    if (toolName === 'remove_specific_song') {
        const { songName, playlistName } = toolInput
        const isDefault = playlistName.toLowerCase() === 'liked songs'
        const playlist = isDefault
            ? await PlaylistModel.findOne({ userId, isDefault: true })
            : await PlaylistModel.findOne({ userId, name: playlistName })
        if (!playlist) return `Playlist "${playlistName}" not found`
        const before = playlist.songs.length
        playlist.songs = playlist.songs.filter(s => s.name.toLowerCase() !== songName.toLowerCase())
        const removed = before - playlist.songs.length
        if (removed === 0) return `"${songName}" not found in ${playlistName}`
        await playlist.save()
        return `Removed "${songName}" from ${playlistName}`
    }
    if (toolName === 'create_playlist') {
        const { name } = toolInput
        if (name.toLowerCase() === 'liked songs') return 'Cannot create a playlist named Liked Songs'
        const existing = await PlaylistModel.findOne({ userId, name })
        if (existing) return `Playlist "${name}" already exists`
        await PlaylistModel.create({ userId, name, isDefault: false, songs: [] })
        return `Created playlist "${name}"`
    }
    if (toolName === 'delete_playlist') {
        const { playlistName } = toolInput
        if (playlistName.toLowerCase() === 'liked songs') return 'Cannot delete Liked Songs playlist'
        const playlist = await PlaylistModel.findOne({ userId, name: playlistName, isDefault: false })
        if (!playlist) return `Playlist "${playlistName}" not found`
        await PlaylistModel.deleteOne({ _id: playlist._id })
        return `Deleted playlist "${playlistName}"`
    }
    if (toolName === 'move_songs_by_artist') {
        const { artist, fromPlaylist, toPlaylist } = toolInput
        const isFromDefault = fromPlaylist.toLowerCase() === 'liked songs'
        const isToDefault = toPlaylist.toLowerCase() === 'liked songs'

        const from = isFromDefault
            ? await PlaylistModel.findOne({ userId, isDefault: true })
            : await PlaylistModel.findOne({ userId, name: fromPlaylist })

        if (!from) return `Playlist "${fromPlaylist}" not found`

        let to = isToDefault
            ? await PlaylistModel.findOne({ userId, isDefault: true })
            : await PlaylistModel.findOne({ userId, name: toPlaylist })

        if (!to) {
            await PlaylistModel.create({ userId, name: toPlaylist, isDefault: false, songs: [] })
            to = await PlaylistModel.findOne({ userId, name: toPlaylist })
        }

        const songsToMove = from.songs.filter(s => s.artist.toLowerCase() === artist.toLowerCase())
        if (songsToMove.length === 0) return `No songs by ${artist} found in ${fromPlaylist}`

        from.songs = from.songs.filter(s => s.artist.toLowerCase() !== artist.toLowerCase())
        await from.save()

        const existingTrackIds = to.songs.map(s => s.trackId)
        const newSongs = songsToMove.filter(s => !existingTrackIds.includes(s.trackId))

        await PlaylistModel.updateOne(
            { _id: to._id },
            { $push: { songs: { $each: newSongs } } }
        )

        return `Moved ${newSongs.length} song(s) by ${artist} from ${fromPlaylist} to ${toPlaylist}`
    }
}

const tools = [
    {
        type: 'function',
        function: {
            name: 'get_playlists',
            description: 'Get all playlists for the current user. ALWAYS use this tool when the user asks about their playlists.',
            parameters: {
                type: 'object',
                properties: {
                    user_request: { type: 'string', description: 'The user request' }
                },
                required: ['user_request']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_liked_songs',
            description: 'Get all liked songs for the current user. ALWAYS use this tool when the user asks about their liked songs.',
            parameters: {
                type: 'object',
                properties: {
                    user_request: { type: 'string', description: 'The user request' }
                },
                required: ['user_request']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'remove_songs_by_artist',
            description: 'Remove all songs by a specific artist from a playlist or liked songs',
            parameters: {
                type: 'object',
                properties: {
                    artist: { type: 'string', description: 'The artist name to remove' },
                    playlistName: { type: 'string', description: 'The playlist name e.g. "Liked Songs"' }
                },
                required: ['artist', 'playlistName']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'search_and_add_song',
            description: 'Search for a song on Spotify and add it to a playlist or liked songs.',
            parameters: {
                type: 'object',
                properties: {
                    songQuery: { type: 'string', description: 'The song name and artist to search for e.g. "One Love Bob Marley"' },
                    playlistName: { type: 'string', description: 'The playlist name to add to e.g. "Liked Songs"' }
                },
                required: ['songQuery', 'playlistName']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'remove_specific_song',
            description: 'Remove a specific song by name from a playlist or liked songs',
            parameters: {
                type: 'object',
                properties: {
                    songName: { type: 'string', description: 'The name of the song to remove' },
                    playlistName: { type: 'string', description: 'The playlist name e.g. "Liked Songs"' }
                },
                required: ['songName', 'playlistName']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'create_playlist',
            description: 'Create a new playlist for the user. Cannot create Liked Songs.',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'The name for the new playlist' }
                },
                required: ['name']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'delete_playlist',
            description: 'Delete a playlist by name. Cannot delete Liked Songs.',
            parameters: {
                type: 'object',
                properties: {
                    playlistName: { type: 'string', description: 'The name of the playlist to delete' }
                },
                required: ['playlistName']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'move_songs_by_artist',
            description: 'Move all songs by a specific artist from one playlist to another. Creates the destination playlist if it does not exist. Use this instead of separate remove and add operations when the user wants to move songs.',
            parameters: {
                type: 'object',
                properties: {
                    artist: { type: 'string', description: 'The artist name' },
                    fromPlaylist: { type: 'string', description: 'The source playlist name e.g. "Liked Songs"' },
                    toPlaylist: { type: 'string', description: 'The destination playlist name' }
                },
                required: ['artist', 'fromPlaylist', 'toPlaylist']
            }
        }
    }
]

module.exports = { tools, handleToolCall }