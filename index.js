const mongoose = require("mongoose");
const app = require("./app");
mongoose.set("strictQuery", true);
const port = process.env.PORT;
require("dotenv").config();

const dbConnectionURL =
  process.env.DATABASE_URL || "mongodb://localhost:27017/spotify_project";

console.log(dbConnectionURL);

mongoose
  .connect(dbConnectionURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Database");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
