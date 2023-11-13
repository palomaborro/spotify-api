const jwt = require("jsonwebtoken");
const moment = require("moment");

const secret = process.env.SECRET_KEY;

exports.createToken = (user) => {
  const payload = {
    sub: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  return jwt.sign(payload, secret);
};
