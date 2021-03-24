var express = require("express");
var app = express();
var PORT = process.env.PORT || 5000;

var connectDB = require("../config/db");

connectDB();

app.get("/", (req, res) => {
  res.send("API is running");
});
app.listen(PORT, () => {
  console.log("Application is listening on PORT number :", PORT);
});
