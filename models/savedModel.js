// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  heading: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  // This only saves one comment's ObjectId, ref refers to the Comments model
  note: {
    type: Schema.Types.ObjectId,
    ref: "Comments"
  }
});

// Create the Article model with the ArticleSchema
var article = mongoose.model("article", ArticleSchema);

// Export the model
module.exports = article;
