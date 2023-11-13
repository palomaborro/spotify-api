const User = require("../models/user");
const Favorites = require("../models/favorites");

const bcrypt = require("bcryptjs");
const jwt = require("../services/auth-service");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const saveUser = (req, res) => {
  const user = new User();
  const params = req.body;

  user.name = params.name;
  user.surname = params.surname;
  if (params.email) {
    user.email = params.email.toLowerCase();
  } else {
    res.status(400).send({ message: "Email is required" });
    return;
  }
  user.role = params.role || "USER";
  user.image = null;

  if (params.password) {
    User.findOne({ email: user.email.toLowerCase() }, (err, existingUser) => {
      if (err) {
        res.status(500).send({ message: "Error checking email" });
      } else if (existingUser) {
        res.status(409).send({ message: "Email already exists" });
      } else {
        bcrypt.hash(params.password, 10, (err, hash) => {
          user.password = hash;
          if (
            user.name !== null &&
            user.surname !== null &&
            user.email !== null
          ) {
            user.save((err, userStored) => {
              if (err) {
                res.status(500).send({ message: "Error saving user" });
              } else {
                if (!userStored) {
                  res.status(404).send({ message: "User not registered" });
                } else {
                  res.status(200).send({ user: userStored });
                }
              }
            });
          } else {
            res.status(400).send({ message: "Fill all fields" });
          }
        });
      }
    });
  } else {
    res.status(400).send({ message: "Introduce your password" });
  }
};

const loginUser = (req, res) => {
  const params = req.body;

  const email = params.email;
  const password = params.password;

  User.findOne({ email: email?.toLowerCase() }, (err, user) => {
    if (err) {
      res.status(500).send({ message: "Error in the request" });
    } else {
      if (!user) {
        res.status(404).send({ message: "User not found" });
      } else {
        bcrypt.compare(password, user.password, (err, check) => {
          if (check) {
            if (params.gethash !== false) {
              res.status(200).send({
                token: jwt.createToken(user),
                user: {
                  _id: user._id,
                  role: user.role,
                },
              });
            } else {
              res.status(200).send({ user });
            }
          } else {
            res.status(404).send({ message: "User not logged in" });
          }
        });
      }
    }
  });
};

const updateUser = async (req, res) => {
  const userId = req.params.id;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/users");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage }).single("image");

  upload(req, res, async (err) => {
    if (err) {
      res.status(500).send({ message: "Error uploading file" });
    } else {
      const update = req.body;

      if (update.newPassword) {
        try {
          const hashedPassword = await bcrypt.hash(update.newPassword, 10);
          update.password = hashedPassword;
        } catch (error) {
          return res.status(500).send({ message: "Error updating password" });
        }
        delete update.newPassword;
      }

      if (req.file) {
        update.image = req.file.filename;
      }

      User.findByIdAndUpdate(
        userId,
        update,
        { new: true },
        (err, userUpdated) => {
          if (err) {
            res.status(500).send({ message: "Error updating user" });
          } else {
            if (!userUpdated) {
              res.status(404).send({ message: "User not updated" });
            } else {
              res.status(200).send({ user: userUpdated });
            }
          }
        }
      );
    }
  });
};

const uploadImage = (req, res) => {
  const userId = req.params.id;

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
      User.findByIdAndUpdate(
        userId,
        { image: file_name },
        (err, userUpdated) => {
          if (err) {
            res.status(404).send({ message: "User not updated" });
          } else {
            res.status(200).send({ image: file_name, user: userUpdated });
          }
        }
      );
    } else {
      res.status(415).send({ message: "Invalid extension" });
    }
  } else {
    res.status(404).send({ message: "You have not uploaded any image" });
  }
};

const getImageFile = (req, res) => {
  const imageFile = req.params.imageFile;
  const path_file = `./uploads/users/${imageFile}`;

  if (fs.existsSync(path_file)) {
    res.sendFile(path.resolve(path_file));
  } else {
    res.status(404).send({ message: "Image does not exist" });
  }
};

const getUserProfile = (req, res) => {
  const userId = req.params.id;

  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).send({ message: "Error finding the user" });
    }

    if (!user) {
      return res.status(404).send({ message: "The user does not exist" });
    }

    res.status(200).send({
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname,
        image: user.image,
      },
    });
  });
};

const getUsers = (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.status(500).send({ message: "Error finding users" });
    } else {
      if (!users) {
        res.status(404).send({ message: "No users found" });
      } else {
        res.status(200).send({ users });
      }
    }
  });
};

const deleteUser = (req, res) => {
  const userId = req.params.id;
  console.log("Received user ID:", userId);

  User.findByIdAndRemove(userId, (err, userRemoved) => {
    if (err) {
      res.status(500).send({ message: "Error deleting user" });
    } else {
      if (!userRemoved) {
        res.status(404).send({ message: "User not deleted" });
      } else {
        res.status(200).send({ user: userRemoved });
      }
    }
  });
};

const makeUserAdmin = (req, res) => {
  const userId = req.params.id;

  User.findById(userId, (err, user) => {
    if (err) {
      res.status(500).send({ message: "Error finding user" });
    } else {
      if (!user) {
        res.status(404).send({ message: "User not found" });
      } else {
        const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
        User.findByIdAndUpdate(
          userId,
          { role: newRole },
          { new: true },
          (err, userUpdated) => {
            if (err) {
              res.status(500).send({ message: "Error updating user" });
            } else {
              if (!userUpdated) {
                res.status(404).send({ message: "User not updated" });
              } else {
                res.status(200).send({ user: userUpdated });
              }
            }
          }
        );
      }
    }
  });
};

const revokeUserAdmin = (req, res) => {
  const userId = req.params.id;

  User.findByIdAndUpdate(
    userId,
    { role: "USER" },
    { new: true },
    (err, userUpdated) => {
      if (err) {
        res.status(500).send({ message: "Error updating user" });
      } else {
        if (!userUpdated) {
          res.status(404).send({ message: "User not updated" });
        } else {
          res.status(200).send({ user: userUpdated });
        }
      }
    }
  );
};

const saveFavoriteSong = async (req, res) => {
  try {
    const { userId } = req.params;
    const { songId } = req.body;

    const favorite = new Favorites({
      user: userId,
      song: songId,
    });

    await favorite.save();
    await User.updateOne(
      { _id: userId },
      { $addToSet: { favorites: favorite._id } }
    );

    res.status(200).send({ success: true, favorite });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const deleteFavoriteSong = async (req, res) => {
  try {
    const { userId, songId } = req.params;
    const favorite = await Favorites.findOneAndDelete({
      user: userId,
      song: songId,
    });
    if (!favorite) {
      return res.status(404).send({ error: "Favorite not found" });
    }

    await User.updateOne(
      { _id: userId },
      { $pull: { favorites: favorite._id } }
    );
    await Favorites.deleteMany({ song: null });

    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getFavoriteSongs = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate({
      path: "favorites",
      populate: {
        path: "song",
        model: "Song",
      },
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send({ favorites: user.favorites });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  saveUser,
  loginUser,
  updateUser,
  uploadImage,
  getImageFile,
  getUserProfile,
  getUsers,
  deleteUser,
  makeUserAdmin,
  revokeUserAdmin,
  saveFavoriteSong,
  deleteFavoriteSong,
  getFavoriteSongs,
};
