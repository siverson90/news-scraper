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
  .find({})
  .then(function(dbArticle) {
    console.log(dbArticle);

    res.render("home", {articles : dbArticle});
  })
  .catch(function(err) {
    res.json(err);
  });
});

// GET all articles based on specific ID
app.get("/articles/:id", function(req, res) {
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

// Post create new note associated with Article PUSH to array
app.post("/articles/:id", function(req,res) {
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

// DELETE delete note

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});