var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

mongoose.connect("mongodb://heroku_6c8hc7fw:8pmjfq3247t8m1g1ncal1qaukq@ds127044.mlab.com:27044/heroku_6c8hc7fw");

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("we're connected");

  var Schema = mongoose.Schema;

  var articleSchema = new Schema({
    heading:  String,
    summary: String,
    url:   String,
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
    hidden: Boolean
  });

  var article = mongoose.model("article", articleSchema);

  //load index.handlebars
  router.get("/", function(req, res) {
    article.find(function (err, articles) {
      if (err) return console.error(err);
      var hbsObject = { article: articles };
      res.render("index", hbsObject);
    });
  });

  router.get("/all", function(req, res) {
    var cheerio = require("cheerio");
    var request = require("request");

    // Making a request to surfer.com. The page's HTML is passed as the callback's third argument
    request("https://http://www.surfer.com", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var results = [];

    // With cheerio, find each h3-tag with the "entry-title" class
    // (i: iterator. element: the current element)
    $("header.entry-header").each(function(i, element) {

      // Save the text of the element in a "title" variable
      var heading = $(element).children().attr();
      

      // In the currently selected element, look at its child elements
      // then save the values for any "href" and "p" attributes that the child elements may have
      var url = $(element).children("h3").attr("href");
      var summary = $(element).children("div").attr("p");

      // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        heading: heading,
        summary: summary,
        url: url
      });
    });

  // Log the results once you've looped through each of the elements found with cheerio
  console.log(results);
  });
});

  router.get("/save", function(req, res) {
    article.find(function (err, articles) {
      if (err) return console.error(err);
      console.log(articles);
      });
    });

  });

module.exports = router;