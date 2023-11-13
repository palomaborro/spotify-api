const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FavoritesSchema = Schema({
  user: { type: Schema.ObjectId, ref: "User" },
  song: { type: Schema.ObjectId, ref: "Song" },
  album: { type: Schema.ObjectId, ref: "Album" },
  artist: { type: Schema.ObjectId, ref: "Artist" },
});

module.exports = mongoose.model("Favorites", FavoritesSchema);
