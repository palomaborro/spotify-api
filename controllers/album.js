const Album = require("../models/album");
const Song = require("../models/song");
const path = require("path");
const multer = require("multer");

const albumImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/albums");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
}).single("image");

const getAlbum = (req, res) => {
  const albumId = req.params.id;

  Album.findById(albumId)
    .populate({ path: "artist" })
    .exec((err, album) => {
      if (err) {
        res.status(500).send({ message: "Error in the request" });
      } else {
        if (!album) {
          res.status(404).send({ message: "Album not found" });
        } else {
          res.status(200).send({ album });
        }
      }
    });
};

const saveAlbum = (req, res) => {
  const album = new Album();
  const params = req.body;

  album.title = params.title;
  album.description = params.description;
  album.year = Number(params.year);
  album.artist = params.artist;

  if (req.file) {
    album.image = `/uploads/albums/${req.file.filename}`;
  }

  album.save((err, albumStored) => {
    if (err) {
      res.status(500).send({ message: "Error saving album" });
    } else {
      if (!albumStored) {
        res.status(404).send({ message: "Album not registered" });
      } else {
        res.status(200).send({ album: albumStored });
      }
    }
  });
};

const getAlbums = (req, res) => {
  const artistId = req.params.artist;

  let find;

  if (!artistId) {
    find = Album.find({}).sort("title");
  } else {
    find = Album.find({ artist: artistId }).sort("year");
  }

  find.populate({ path: "artist" }).exec((err, albums) => {
    if (err) {
      res.status(500).send({ message: "Error in the request" });
    } else {
      if (!albums) {
        res.status(404).send({ message: "No albums found" });
      } else {
        res.status(200).send({ albums });
      }
    }
  });
};

const updateAlbum = (req, res) => {
  const albumId = req.params.id;
  const update = req.body;

  if (req.file) {
    update.image = `/uploads/albums/${req.file.filename}`;
  }

  Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
    if (err) {
      res.status(500).send({ message: "Error in the request" });
    } else {
      if (!albumUpdated) {
        res.status(404).send({ message: "Album not found" });
      } else {
        res.status(200).send({ album: albumUpdated });
      }
    }
  });
};

const deleteAlbum = (req, res) => {
  const albumId = req.params.id;

  Album.findByIdAndDelete(albumId, (err, albumRemoved) => {
    if (err) {
      res.status(500).send({ message: "Error in the request" });
    } else {
      if (!albumRemoved) {
        res.status(404).send({ message: "Album not found" });
      } else {
        Song.find({ album: albumRemoved._id }).remove((err, songRemoved) => {
          if (err) {
            res.status(500).send({ message: "Error in the request" });
          } else {
            if (!songRemoved) {
              res.status(404).send({ message: "Song not found" });
            } else {
              res.status(200).send({ album: albumRemoved });
            }
          }
        });
      }
    }
  });
};

module.exports = {
  getAlbum,
  saveAlbum,
  getAlbums,
  updateAlbum,
  deleteAlbum,
  albumImageUpload,
};
