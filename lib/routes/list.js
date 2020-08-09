const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Schema = require("../models/schemas");
const Item = Schema.Item;
const List = Schema.List;

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

const listArray = [];

router.get("/", function (req, res) {
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
          for (let i = 0; i < list.length; i++) {
            listArray.push(list[i].name);
          }
        }
      }
    });
  }
});

router.get("/:customListName", function (req, res) {
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

router.post("/", function (req, res) {
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

router.post("/create", function (req, res) {
  const customListName = _.capitalize(req.body.createName);

  res.redirect("/" + customListName);
});

router.post("/delete", function (req, res) {
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

module.exports = router;
