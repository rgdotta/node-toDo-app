//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require('path')
const lists = require("./lib/routes/list")

const app = express();

app.set("views", path.join(__dirname, "./app/views"))
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});

app.use('/', lists);  

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
