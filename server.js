var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var exphbs = require("express-handlebars");
var methodOverride = require("method-override");

var app = express();
var PORT = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(methodOverride("_method"));


// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

var routes = require("./controllers/news_controller.js");

app.use("/", routes);

app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});