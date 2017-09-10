var express = require("express");
var router = express.Router();
//var Note = require("../models/commentModel.js");
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

  router.get("/find", function(req, res) {
    var query = article.find({"heading": {$regex: /.+/}, "summary": {$regex: /.+/}, "url": {$regex: /.+/}});
      query.limit(20);
      query.exec(function (err, docs) {
            var hbsObject = { article: docs, hasArticles: true };
            res.render("index", hbsObject);
          });      
  });

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
        result.heading = $(element).children("header.entry-header").children("h3.entry-title").children("a").attr("title");
        result.summary = $(element).children("div.selects-content").children("p.entry-excerpt").text();
        

        //create a new article and save to DB
        var art = new article(result);
        art.save(function(err, doc) {
          if (err) {
            console.log("save error" + err)
          };
          
        });
      
    }); 
    res.redirect("/find");
  });   
});

  router.post("/delete", function(req, res) {
    article.deleteMany();
    res.sendStauts(200);
  });

  
  

}); //closes db connection

module.exports = router;