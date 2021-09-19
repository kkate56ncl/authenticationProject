require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

//Use the session package and set it up with some initial configuration.
app.use(session({
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false
}));

//Use passport and initialize the passport package.
app.use(passport.initialize());
//Use passport for dealing with the sessions.
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  username:String,
  password:String
});

//Add passport-local-mongoose as a plugin to the mongoose schema(it has to be a mongoose schema instead of just a standard Javascript object).
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

//Use passport local mongoose to create a local log in strategy.
passport.use(User.createStrategy());

//Set a passport to serialize and deserialize our user.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res) {
  //isAuthenticated() is a boolean value that indicates whether the current user is authenticated.
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }

});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});




app.post("/register", function(req, res) {

  User.register({username:req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      re.redirect("/register");
    } else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});


app.post("/login", passport.authenticate("local", {failureRedirect:"/login"}), function(req, res) {

  const user = new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else{
        res.redirect("/secrets");
    }
  });

});












app.listen("3000", function() {
  console.log("Server started on port 3000.");
})
