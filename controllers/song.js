const Song = require("../models/song");
const User = require("../models/user");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const songUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/songs");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
}).single("song");

const getSong = (req, res) => {
  const songId = req.params.id;

  Song.findById(songId)
    .populate({ path: "album" })
    .exec((err, song) => {
      if (err) {
        res.status(500).send({ message: "Error in the request" });
      } else {
        if (!song) {
          res.status(404).send({ message: "Song not found" });
        } else {
          res.status(200).send({ song });
        }
      }
    });
};

const saveSong = (req, res) => {
  const song = new Song();
  const params = req.body;

  song.number = Number(params.number);
  song.name = params.name;
  song.duration = Number(params.duration);
  song.artist = params.artist;
  song.album = params.album;

  if (req.file) {
    song.song = `/uploads/songs/${req.file.filename}`;
  }

  song.save((err, songStored) => {
    if (err) {
      res.status(500).send({ message: "Error saving song" });
    } else {
      if (!songStored) {
        res.status(404).send({ message: "Song not stored" });
      } else {
        res.status(200).send({ song: songStored });
      }
    }
  });
};

const getSongs = (req, res) => {
  const albumId = req.params.album;

  let find;

  if (!albumId) {
    find = Song.find({}).sort("number");
  } else {
    find = Song.find({ album: albumId }).sort("number");
  }

  find
    .populate({
      path: "album",
      populate: {
        path: "artist",
        model: "Artist",
      },
    })
    .exec((err, songs) => {
      if (err) {
        res.status(500).send({ message: "Error in the request" });
      } else {
        if (!songs) {
          res.status(404).send({ message: "There are no songs" });
        } else {
          res.status(200).send({ songs });
        }
      }
    });
};

const updateSong = (req, res) => {
  const songId = req.params.id;
  const update = req.body;

  Song.findByIdAndUpdate(songId, update, (err, songUpdated) => {
    if (err) {
      res.status(500).send({ message: "Error in the request" });
    } else {
      if (!songUpdated) {
        res.status(404).send({ message: "Song not updated" });
      } else {
        res.status(200).send({ song: songUpdated });
      }
    }
  });
};

const deleteSong = (req, res) => {
  const songId = req.params.id;

  Song.findByIdAndDelete(songId, (err, songRemoved) => {
    if (err) {
      res.status(500).send({ message: "Error in the request" });
    } else {
      if (!songRemoved) {
        res.status(404).send({ message: "Song not removed" });
      } else {
        res.status(200).send({ song: songRemoved });
      }
    }
  });
};

module.exports = {
  getSong,
  saveSong,
  getSongs,
  updateSong,
  deleteSong,
  songUpload,
};
