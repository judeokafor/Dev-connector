const express = require("express");
const mongoose = require("mongoose");
const app = express();

const config = require("./config/database");
const users = require("./routes/api/users");
const profile = require("./routes/api/profile.js");
const posts = require("./routes/api/posts");

// mongoose connect to database
mongoose
  .connect(config.database, { useNewUrlParser: true })
  .then(() => {
    console.log(`MongoDB connected to ${config.database}`);
  })
  .catch(err => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Hello World");
});
// use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});