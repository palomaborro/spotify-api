const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
const user_routes = require("./routes/user");
const artist_routes = require("./routes/artist");
const album_routes = require("./routes/album");
const song_routes = require("./routes/song");

// base routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", user_routes);
app.use("/", artist_routes);
app.use("/", album_routes);
app.use("/", song_routes);

// Serve static assets (build folder) if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

module.exports = app;
