var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// var request = require("request");
var axios = require("axios");

var cheerio = require ("cheerio");

var db = require("./models");
var exphbs  = require('express-handlebars');

var PORT = 3000;

var app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: false }));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newscraper", {
  useMongoClient: true
});

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static("public"));

// scrape route- add url
app.get("/api/scrape", function(req,res) {
  axios.get("https://www.nytimes.com/").then(function(response) {

    var $ = cheerio.load(response.data);

    $("article.story").each(function(i, element) {  

    var result = {};

      result.headline = $(this).find("h2").find("a").text();
      result.summary = $(this).find("p.summary").text();
      result.url = $(this).find("h2").find("a").attr("href");
      
      console.log(result);

      db.Article
      .create(result)
      .then(function(dbArticle){

        res.send("scrape complete");
      })
      .catch(function(err){
        console.log(err);
      });
    });
  });
});

// GET route return all articles
app.get("/", function(req, res) {

  db.Article
  .find({"saved": false})
  .then(function(dbArticle) {
    // console.log(dbArticle);

    res.render("articles", {articles : dbArticle});
  })
  .catch(function(err) {
    res.json(err);
  });
});

// GET all notes based on specific ID of article
app.get("/articles/:id/note", function(req, res) {
  db.Article
  .findOne({ _id: req.params.id})
  .populate("note")
  .then(function(dbArticle){
    res.json(dbArticle)
  })
  .catch(function(err) {
    res.json(err);
  });
});

app.get("/saved", function(req,res) {

  db.Article
  .find({saved: true})
  .then(function(dbSavedArticle) {
    // console.log(dbSavedArticle)
    res.render("saved", {articles : dbSavedArticle})
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Mark article as saved in DB
app.put("/api/note/saved", function(req,res) {

  console.log(req.body.id)
  console.log("saved route hit");
  
  db.Article
  .findOneAndUpdate(
    {_id: req.body.id}, 
    {$set: {"saved": true}
  }).then(function(dbResponse){
     // Maybe do this client side
    res.redirect("/saved");
  });
});

app.get("/api/notes/:id", function(req, res){

  db.Article
  .findOne({_id: req.params.id})
  .populate("note")
  .then(function(dbArticle){
    res.render("home", {notes: dbArticle});
  })
  .catch(function(err) {
    res.json(err);
  })
})
// Post create new note associated with Article PUSH to array
app.post("/api/note", function(req,res) {
  db.note
  .create(req.body)
  .then(function(dbNote) {
    return db.Article.findOneAndUpdate({
       _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Remove note from saved

app.put("/api/note/remove", function(req,res) {

  console.log(req.body.id)
  console.log("removed route hit");
  
  db.Article
  .findOneAndUpdate(
    {_id: req.body.id}, 
    {$set: {"saved": false}
  }).then(function(dbResponse){
    console.log("note removed")
  });
  // Maybe do this client side
  res.redirect("/saved");
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});