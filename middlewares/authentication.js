const jwt = require("jsonwebtoken");
const moment = require("moment");

const secret = process.env.SECRET_KEY;

exports.isAuthenticated = (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(403)
      .send({ message: "The request does not have the authentication header" });
  }

  const token = req.headers.authorization.split(" ")[1];

  try {
    var payload = jwt.verify(token, secret);

    if (payload.exp <= moment().unix()) {
      return res.status(401).send({ message: "Token has expired" });
    }
  } catch (err) {
    return res.status(404).send({ message: "Token is not valid" });
  }

  req.user = payload;

  next();
};
