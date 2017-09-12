var express = require("express");
var router = express.Router();
var article = require("../models/articleModel.js");
var mongoose = require("mongoose");
var Handlebars = require("handlebars");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var connectionString = process.env.DB_CONN || "mongodb://heroku_6c8hc7fw:8pmjfq3247t8m1g1ncal1qaukq@ds127044.mlab.com:27044/heroku_6c8hc7fw";
mongoose.connect(connectionString);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("we're connected");

  //load index.handlebars
  router.get("/", function(req, res) {
    
    var hbsObject = { errorMessage: "no articles loaded yet", hasArticles: false };
    res.render("index", hbsObject);
  });

  //load articles after scrape
  router.get("/find", function(req, res) {
    var query = article.find({"heading": {$regex: /.+/}, "summary": {$regex: /.+/}, "url": {$regex: /.+/}});
      query.limit(20);
      query.exec(function (err, docs) {
        var hbsObject = { article: docs, hasArticles: true };
        res.render("index", hbsObject);
          });      
  });

  //display saved articles when the save button in the navbar is clicked
  router.get("/saved", function(req, res) {
    article.find({"saved": true}, function(err, docs) {
      var hbsObject = { article: docs };
      res.render("index", hbsObject);
    });
  });//router

  //Scrape articles from surfer.com when scrape button is clicked
  router.post("/all", function(req, res) {

    var cheerio = require("cheerio");
    var request = require("request");
    var result = {};

    // Making a request to surfer.com. The page's HTML is passed as the callback's third argument
    request("https://www.surfer.com/features/", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    var $ = cheerio.load(html);
   
    $("div.entry-container").each(function(i, element) {

        // Extract info
        result.url = $(element).children("header.entry-header").children("h3.entry-title").children("a").attr("href");
        result.url = result.url;
        result.heading = $(element).children("header.entry-header").children("h3.entry-title").children("a").attr("title");
        result.summary = $(element).children("div.selects-content").children("p.entry-excerpt").text();
        result.saved = false;
        

        //create a new article and save to DB
        var art = new article(result);
        art.save(function(err, doc) {
          if (err) {
            console.log("save error" + err)
          };         
        });     
    }); 
    res.redirect("/find");//load articles on page
  });   
});//router


  //save an article ... update to saved=true
  router.post("/save/:id", function(req, res) {
    var articleID = req.params.id;
    article.findOneAndUpdate({"_id": articleID}, {$set: {"saved":true}}, 
      function(err, doc) {
        if (err) throw err;
        res.sendStatus(200);
      }); 
  });//closes router


  //delete an article ... update to saved=false
  router.post("/delete/:id", function(req, res) {
    var articleID = req.params.id;
    article.findOneAndUpdate({"_id": articleID}, {$set: {"saved":false}}, 
      function(err, doc) {
        if (err) throw err;
        res.redirect("/find");
      }); 
  });//router
  

}); //closes db connection

module.exports = router;