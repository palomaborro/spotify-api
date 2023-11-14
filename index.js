const mongoose = require("mongoose");
const app = require("./app");
mongoose.set("strictQuery", true);
const port = process.env.PORT;
require("dotenv").config();

const dbConnectionURL =
  process.env.DATABASE_URL || "mongodb://localhost:27017/spotify_project";

const writeMongoDBCertificate = (cert) => {
  return new Promise((resolve, reject) => {
    const fs = require("fs");
    fs.writeFile("certificate.pem", cert, (err) => {
      if (err) {
        reject(err);
      }
      resolve("Certificate saved");
    });
  });
};

writeMongoDBCertificate(process.env.MONGODB_CERTIFICATE).then(() =>
  mongoose
    .connect(dbConnectionURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      sslValidate: true,
      tlsCertificateKeyFile: "certificate.pem",
      authMechanism: "MONGODB-X509",
      authSource: "$external",
    })
    .then(() => {
      console.log("Connected to Database");

      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("Database connection error:", err);
    })
);
