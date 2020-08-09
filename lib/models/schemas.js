const mongoose = require("mongoose");

const todoSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [todoSchema],
};

module.exports = {
  Item: mongoose.model("Item", todoSchema),
  List: mongoose.model("List", listSchema),
};
