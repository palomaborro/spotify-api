const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SongSchema = Schema({
  number: Number,
  name: String,
  song: String,
  artist: { type: Schema.ObjectId, ref: "Artist" },
  album: { type: Schema.ObjectId, ref: "Album" },
});

module.exports = mongoose.model("Song", SongSchema);
