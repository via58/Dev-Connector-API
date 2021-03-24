var express = require("express");
var app = express();
var PORT = process.env.PORT || 5000;

var connectDB = require("../config/db");

connectDB();

app.get("/", (req, res) => {
  res.send("API is running");
});
// define routes
app.use("/api/users", require("./api/users"));
app.use("/api/profile", require("./api/profile"));
app.use("/api/posts", require("./api/posts"));
app.use("/api/auth", require("./api/auth"));

app.listen(PORT, () => {
  console.log("Application is listening on PORT number :", PORT);
});
