const express = require("express");
const AlbumController = require("../controllers/album");
const middlewareAuth = require("../middlewares/authentication");
const multer = require("multer");

const api = express.Router();

api.get("/album/:id", AlbumController.getAlbum);
api.get(
  "/albums/:artist?",
  middlewareAuth.isAuthenticated,
  AlbumController.getAlbums
);

api.post(
  "/album",
  middlewareAuth.isAuthenticated,
  AlbumController.albumImageUpload,
  AlbumController.saveAlbum
);

api.put(
  "/album/:id",
  middlewareAuth.isAuthenticated,
  AlbumController.albumImageUpload,
  AlbumController.updateAlbum
);

api.delete(
  "/album/:id",
  middlewareAuth.isAuthenticated,
  AlbumController.deleteAlbum
);

module.exports = api;
