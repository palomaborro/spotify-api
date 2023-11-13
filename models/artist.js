const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

const ArtistSchema = Schema({
  name: String,
  description: String,
  image: String,
});

ArtistSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Artist", ArtistSchema);
