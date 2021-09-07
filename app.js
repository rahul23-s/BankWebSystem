const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("./models/user");
require("./models/transactionHistory");
const bodyParser = require("body-parser");
const User = mongoose.model("User");
const History = mongoose.model("History");
const port = process.env.PORT || 8000;

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/bankdb',{useNewUrlParser: true});
mongoose.connect(
  "mongodb+srv://rahul-23s:abc@cluster0.lpbpc.mongodb.net/bankdb?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);
const app = express();

const server = app.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connection
  .on("open", () => {
    console.log("Mongoose connection open");
  })
  .on("error", (err) => {
    console.log(`Connection error: ${err.message}`);
  });

app.get("/", (req, res) => {
  res.render("home", { title: "Welcome | Internet Banking" });
});

app.get("/transactionHistory", (req, res) => {
  History.find()
    .then((histories) => {
      histories.reverse();
      res.render("transactionHistory", {
        title: "Listing Transactions",
        histories,
      });
    })
    .catch(() => {
      res.send("Sorry! Something went wrong.");
    });
});

app.get("/transferMoney", (req, res) => {
  res.render("transferMoney", { title: "Transfer Money" });
});

app.get("/allUsers", (req, res) => {
  User.find()
    .then((users) => {
      res.render("allUsers", { title: "All Account Holders", users });
    })
    .catch(() => {
      res.send("Sorry! Something went wrong.");
    });
});

app.post("/", (req, res) => {
  var balance = req.body.amount;
  var name1 = req.body.name1;
  var name2 = req.body.name2;
  const history = new History({
    Creditor: name1,
    Recipient: name2,
    Amount: balance,
  });
  history.save();

  User.findOne({ Username: name1 }, (err, user) => {
    if (err) console.log(err);
    else
      User.findOne({ Username: name2 }, (err, receipt) => {
        if (err) console.log(err);
        else {
          user.Balance -= Number(balance);
          user.save();
          console.log(user);
          receipt.Balance += Number(balance);
          receipt.save();
          console.log(receipt);
        }
      });
  });

  res.redirect("transactionHistory");
});

module.exports = app;
