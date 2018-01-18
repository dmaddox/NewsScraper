var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news_db";
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Routes

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.nytimes.com/section/technology?module=SectionsNav&action=click&version=BrowseTree&region=TopBar&contentCollection=Tech&pgtype=sectionfront").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // Now, we grab every h2 within an article tag, and do the following:
    $("#latest-panel .story-menu .story").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .find(".headline")
        .text().trim();
      result.link = $(this)
        .find(".story-link")
        .attr("href");
      result.excerpt = $(this)
        .find('.summary')
        .text().trim();

        console.log(result);

      // Create a new Article using the `result` object built from scraping
      db.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });

    });
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article
    .find({})
    .then(function(dbArticle) {
      // If all Articles are successfully found, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article
  //"_id": mongojs.ObjectId(req.params.id)
    .findOne({_id: req.params.id})
    .populate("comment")
    .then(function(article) {
      res.json(article);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated comment
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new comment that gets posted to the comments collection
  // then find an article from the req.params.id
  // and update it's "comment" property with the _id of the new note
  db.Comment
    .create(req.body)
    .then(function(dbComment) {
      // If a comment was created successfully, find one article and push the new Note's _id to the articles's `note` array
      // { new: true } tells the query that we want it to return the updated article -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      console.log("saving dbComment._id: " + dbComment._id + " to the associated Article");
      return db.Article.findOneAndUpdate(
        {_id: req.params.id}, 
        { comment: dbComment._id }, 
        { new: true }
        );
    })
    .then(function(dbArticle) {
      // If the article was updated successfully, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});


// Route for saving/updating an Article's associated Note
app.put("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Comment
    .remove({ _id: req.params.id })
    .then(function(dbComment) {
      // If a comment was removed succesfully, find one article and remove the comment from the article's comments
      // { new: true } tells the query that we want it to return the updated article -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        {comment: req.params.id}, 
        { comment: null }, 
        { new: true }
        );
    })
    .then(function(dbArticle) {
      // If the article was updated successfully, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
