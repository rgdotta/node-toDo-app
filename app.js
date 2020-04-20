//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});

//Schemas

const todoSchema = {
  name: String,
};

const Item = mongoose.model("Item", todoSchema);

const item1 = new Item({
  name: "Welcome to your to-do list.",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "< Hit the checkbox to delete the item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [todoSchema],
};

const List = mongoose.model("List", listSchema);

//

const listArray = [];

app.get("/", function (req, res) {
  Item.find({}, function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Items succesfully created");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items,
        listArray: listArray,
      });
    }
  });
  
  if (listArray.length === 0) {
    List.find({}, function (err, list) {
      if (!err) {
        if (!list) {
          console.log("Nothing found");
        } else {
          console.log(list);
          for (let i = 0; i < list.length; i++) {
            listArray.push(list[i].name);
          }
        }
      }
    });
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, found) {
    if (!err) {
      if (!found) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        if (list.name != "Favicon.ico") {
          listArray.push(list.name);
        }
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: found.name,
          newListItems: found.items,
          listArray: listArray,
        });
      }
    }
    
    if (listArray.length === 0) {
    List.find({}, function (err, list) {
      if (!err) {
        if (!list) {
          console.log("Nothing found");
        } else {
          console.log(list);
          for (let i = 0; i < list.length; i++) {
            listArray.push(list[i].name);
          }
        }
      }
    });
  }
  });

  List.deleteMany({ name: "Favicon.ico" }, function (err) {
    err = err;
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/create", function (req, res) {
  const customListName = _.capitalize(req.body.createName);

  res.redirect("/" + customListName);
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.deleteItem;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item succesfully removed");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, result) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// app.post("/list", function (req, res) {});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
