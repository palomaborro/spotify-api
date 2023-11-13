const express = require("express");
const SongController = require("../controllers/song");
const middlewareAuth = require("../middlewares/authentication");
const multer = require("multer");
const upload = multer();

const api = express.Router();

api.get("/song/:id", middlewareAuth.isAuthenticated, SongController.getSong);
api.get("/songs/:album?", SongController.getSongs);

api.post(
  "/song/:id",
  middlewareAuth.isAuthenticated,
  SongController.songUpload,
  SongController.saveSong
);

api.put(
  "/song/:id",
  upload.none(),
  middlewareAuth.isAuthenticated,
  SongController.updateSong
);

api.delete(
  "/song/:id",
  middlewareAuth.isAuthenticated,
  SongController.deleteSong
);

module.exports = api;
