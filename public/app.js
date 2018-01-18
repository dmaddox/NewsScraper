// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display scraped information on the page
    $("#articles").append("<div class='article'><p data-id='" + data[i]._id + "'>" + 
                          "<a href='" + data[i].link + "' target='_blank' class='title'>" + 
                          data[i].title + "</a><br />" + 
                          data[i].excerpt + "</p>" + 
                          "<div class='comment-space'><h4 class='comment'>Comments</h4>" + 
                          "<form class='hidden'><h5>Add a comment:</h5>" + 
                          "<textarea id='bodyinput' name='body' ></textarea><br>" +
                          "<button id='savecomment'>Save Comment</button></form>" + 
                          "</div></div>");
  }
});

// Whenever someone clicks a p tag
$(document).on("click", ".comment", function() {
  // Save the id from the sibling tag
  var thisComment = $(this).parent();
  console.log(thisComment.text());
  var thisId = thisComment.siblings("p").attr("data-id");
  console.log(thisId);

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the comment information to the page
    .done(function(data) {
      console.log("Getting any comments...");
      // If there is a comment on the article
      if (data.comment) {
          // Place the body of the note in the body textarea
          thisComment.find("#bodyinput").val(data.comment.body);
      }
      console.log(thisId);
      thisComment.find("button").attr("data-id", thisId);
      thisComment.children("form").toggle();

    });
});


// When you click the savenote button
$(document).on("click", "#savecomment", function() {
  event.preventDefault();
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the comment, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from note textarea
      body: $(this).siblings("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log("data is: " + data);
      // say "saved" to user
      $(this).parent().append("<p>Comment Saved!</p>");
    });
});