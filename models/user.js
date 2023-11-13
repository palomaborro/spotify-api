const mongoose = require("mongoose");
const favorites = require("./favorites");

const Schema = mongoose.Schema;

const UserSchema = Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  role: String,
  image: String,
  favorites: [{ type: Schema.ObjectId, ref: "Favorites" }],
});

module.exports = mongoose.model("User", UserSchema);
