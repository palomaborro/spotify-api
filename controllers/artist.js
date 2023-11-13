const Artist = require("../models/artist");
const Album = require("../models/album");
const Song = require("../models/song");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const artistImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/artists");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
}).single("image");

const getArtist = (req, res) => {
  const artistId = req.params.id;

  Artist.findById(artistId, (err, artist) => {
    if (err) {
      res.status(500).send({ message: "Error in the request" });
    } else {
      if (!artist) {
        res.status(404).send({ message: "Artist not found" });
      } else {
        res.status(200).send({ artist });
      }
    }
  });
};

const saveArtist = (req, res) => {
  const artist = new Artist();
  const params = req.body;

  artist.name = params.name;
  artist.description = params.description;

  if (req.file) {
    artist.image = `/uploads/artists/${req.file.filename}`;
  }
  artist.save((err, artistStored) => {
    if (err) {
      res.status(500).send({ message: "Error saving artist" });
    } else {
      if (!artistStored) {
        res.status(404).send({ message: "Artist not registered" });
      } else {
        res.status(200).send({ artist: artistStored });
      }
    }
  });
};

const getArtists = (req, res) => {
  const options = {
    sort: "name",
    page: req.params.page,
    limit: 12,
  };

  Artist.paginate({}, options, (err, artists) => {
    if (err) {
      res.status(500).send({ message: "Error in the request" });
    } else {
      if (!artists) {
        res.status(404).send({ message: "No artists found" });
      } else {
        return res.status(200).send({
          total_items: artists.totalDocs,
          artists: artists.docs,
          docs: artists,
        });
      }
    }
  });
};

const updateArtist = (req, res) => {
  const artistId = req.params.id;
  const update = req.body;

  if (req.file) {
    update.image = `/uploads/artists/${req.file.filename}`;
  }

  Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
    if (err) {
      res.status(500).send({ message: "Error updating artist" });
    } else {
      if (!artistUpdated) {
        res.status(404).send({ message: "Artist not updated" });
      } else {
        res.status(200).send({ artistUpdated });
      }
    }
  });
};

const deleteArtist = (req, res) => {
  const artistId = req.params.id;

  Artist.findByIdAndDelete(artistId, (err, artistRemoved) => {
    if (err) {
      res.status(500).send({ message: "Error removing artist" });
    } else {
      if (!artistRemoved) {
        res.status(404).send({ message: "Artist not removed" });
      } else {
        Album.find({ artist: artistRemoved._id }).deleteOne(
          (err, albumRemoved) => {
            if (err) {
              res.status(500).send({ message: "Error removing album" });
            } else {
              if (!albumRemoved) {
                res.status(404).send({ message: "Album not removed" });
              } else {
                Song?.find({ album: albumRemoved._id }).deleteOne(
                  (err, songRemoved) => {
                    if (err) {
                      res.status(500).send({ message: "Error removing song" });
                    } else {
                      if (!songRemoved) {
                        res.status(404).send({ message: "Song not removed" });
                      } else {
                        res.status(200).send({ artistRemoved });
                      }
                    }
                  }
                );
              }
            }
          }
        );
      }
    }
  });
};

const uploadImage = (req, res) => {
  const artistId = req.params.id;

  if (req.files) {
    const file_path = req.files.image.path;
    const file_split = file_path.toString().split("/");
    const file_name = file_split[2];

    const ext_split = file_name.split(".");
    const file_ext = ext_split[1] || null;

    if (
      file_ext === "png" ||
      file_ext === "jpg" ||
      file_ext === "jpeg" ||
      file_ext === "gif"
    ) {
      Artist.findByIdAndUpdate(
        artistId,
        { image: file_name },
        (err, artistUpdated) => {
          if (err) {
            res.status(404).send({ message: "Artist not updated" });
          } else {
            res.status(200).send({ image: file_name, artist: artistUpdated });
          }
        }
      );
    } else {
      res.status(415).send({ message: "Invalid image extension" });
    }
  } else {
    res.status(404).send({ message: "You have not uploaded any image" });
  }
};

const getImageFile = (req, res) => {
  const imageFile = req.params.imageFile;
  const path_file = `./uploads/artists/${imageFile}`;

  if (fs.existsSync(path_file)) {
    res.sendFile(path.resolve(path_file));
  } else {
    res.status(404).send({ message: "Image does not exist" });
  }
};

module.exports = {
  getArtist,
  saveArtist,
  getArtists,
  updateArtist,
  deleteArtist,
  uploadImage,
  getImageFile,
  artistImageUpload,
};
