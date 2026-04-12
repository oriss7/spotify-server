const mongoose = require('mongoose')
const Schema = mongoose.Schema
const model = mongoose.model

const songSchema = new Schema({
    trackId: { type: String, required: true },
    name: { type: String, required: true },
    artist: { type: String, required: true },
    albumImage: { type: String },
    duration_ms: { type: Number },
}, { _id: false })

const PlaylistSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    name: { type: String, required: true, minlength: 1, maxlength: 15 },
    isDefault: { type: Boolean, default: false },
    songs: { type: [songSchema], default: [] },
}, { timestamps: true })

const PlaylistModel = model('Playlist', PlaylistSchema)

module.exports = { PlaylistModel }