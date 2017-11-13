var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var request = require("request");

var cheerio = require ("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({extended: false}));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newScraper",{useMongoClient: true});

// scrape route- add url
app.get("/api/scrape", function(req,res){

  request.get("url").then(function(response){

    var $ = cheerio.load(response.data);

    $().each(function(i, element) {  

      var result = {};

      result.headline
      result.summary
      result.url

      db.Article
      .create(result)
      .then(function(dbArticle) {
        res.send("scrape complete");
      })
      .catch(function(err){
        res.json(err);
      });
    });
  })
});

// GET route return all articles

// GET all articles based on specific ID

// Post create new note associated with Article PUSH to array

// DELETE delete note

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});