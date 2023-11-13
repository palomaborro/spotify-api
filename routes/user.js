const express = require("express");
const UserController = require("../controllers/user");
const middlewareAuth = require("../middlewares/authentication");
const multer = require("multer");

const upload = multer({ dest: "./uploads/users" });

const api = express.Router();

api.get("/get-image-user/:imageFile", UserController.getImageFile);
api.get(
  "/profile/:id",
  middlewareAuth.isAuthenticated,
  UserController.getUserProfile
);
api.get("/users", UserController.getUsers);
api.get(
  "/favorites/:userId",
  middlewareAuth.isAuthenticated,
  UserController.getFavoriteSongs
);

api.post("/sign-up", upload.single("image"), UserController.saveUser);
api.post("/login", UserController.loginUser);
api.post(
  "/upload-image-user/:id",
  [middlewareAuth.isAuthenticated, upload.single("image")],
  UserController.uploadImage
);
api.post(
  "/users/:userId/favorites",
  middlewareAuth.isAuthenticated,
  UserController.saveFavoriteSong
);

api.delete(
  "/users/:id",
  middlewareAuth.isAuthenticated,
  UserController.deleteUser
);
api.delete(
  "/users/:userId/favorites/:songId",
  middlewareAuth.isAuthenticated,
  UserController.deleteFavoriteSong
);

api.put(
  "/profile/:id",
  [middlewareAuth.isAuthenticated],
  UserController.updateUser
);
api.put(
  "/users/:id",
  middlewareAuth.isAuthenticated,
  UserController.makeUserAdmin
);
api.put(
  "/users/:id",
  middlewareAuth.isAuthenticated,
  UserController.revokeUserAdmin
);

module.exports = api;
