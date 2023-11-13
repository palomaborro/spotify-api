const express = require("express");
const ArtistController = require("../controllers/artist");
const middlewareAuth = require("../middlewares/authentication");
const multer = require("multer");

const api = express.Router();

api.get("/artist/:id", ArtistController.getArtist);
api.get("/artists/:page?", ArtistController.getArtists);

api.post(
  "/artists",
  middlewareAuth.isAuthenticated,
  ArtistController.artistImageUpload,
  ArtistController.saveArtist
);
api.post(
  "/artist/:id",
  middlewareAuth.isAuthenticated,
  ArtistController.artistImageUpload,
  ArtistController.updateArtist
);

api.put(
  "/artist/:id",
  middlewareAuth.isAuthenticated,
  ArtistController.artistImageUpload,
  ArtistController.updateArtist
);

api.delete(
  "/artist/:id",
  middlewareAuth.isAuthenticated,
  ArtistController.deleteArtist
);

module.exports = api;
