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

app.get("/saved", function(req,res) {

  db.Article
  .find({saved: true})
  .populate("note")
  .then(function(dbSavedArticle) {
    console.log(dbSavedArticle)
    res.render("saved", {articles : dbSavedArticle})
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Mark article as saved in DB
app.put("/api/article/saved", function(req,res) {

  console.log(req.body.id)
  console.log("saved route hit");
  
  db.Article
  .findOneAndUpdate(
    {_id: req.body.id}, 
    {$set: {"saved": true}
  }).then(function(dbResponse){
     // Maybe do this client side
    res.json(dbResponse);
  });
});

// **** DONT NEED this route*****

// app.get("/api/notes/:id", function(req, res){

//   db.Article
//   .findOne({_id: req.params.id})
//   .populate("note")
//   .then(function(dbArticle){
//     // res.render("saved", {notes: dbArticle});
//     res.json(dbArticle);
//   })
//   .catch(function(err) {
//     res.json(err);
//   })
// })
// Post create new note associated with Article PUSH to array
app.post("/api/note", function(req,res) {
  
  var newNote = {
    title:req.body.title,
    body: req.body.body
  }

  console.log(req.body);
  db.Note
  .create(newNote)
  .then(function(dbNote) {
    console.log("This is after creating note ", dbNote)
    return db.Article.update({
       "_id": req.body.articleId }, { $push: { "note": dbNote._id }}, { "new": true });
    })
  .then(function(dbArticle) {
    res.end();
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Remove article from saved

app.put("/api/article/remove", function(req,res) {

  console.log(req.body.id)
  console.log("removed route hit");
  
  db.Article
  .findOneAndUpdate(
    {_id: req.body.id}, 
    {$set: {"saved": false}
  }).then(function(dbResponse){
    console.log("note removed")
    res.end();
  })
  .catch(function(err){
    res.json(err);
  })
});

app.delete("/api/delete/:id", function(req,res){
  console.log("this is the delete note route")
  console.log(req.params.id);

  db.Note
  .deleteOne({
    _id: req.params.id 
  }).then(function(dbResponse){
    console.log(dbResponse);
    res.end();
  })
})

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});