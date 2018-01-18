// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display scraped information on the page
    $("#articles").append("<div class='article'><p data-id='" + data[i]._id + "'><a href='" + data[i].link + "' target='_blank' class='title'>" + data[i].title + "</a><br />" + 
      data[i].excerpt + "</p><div class='comment'>Comments</div></div>");
  }
});

// Whenever someone clicks a p tag
$(document).on("click", ".comment", function() {
  // Empty the notes from the note section
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the comment information to the page
    .done(function(data) {
      console.log("Getting any comments...");
      // If there are comments on the article
      if (data.comment) {
        // Place the title of the note in the title input
        var username = $("#username").val(data.comment.username);
        // Place the body of the note in the body textarea
        var comment_body = $("#comment_body").val(data.comment.body);
        $(this).children('.comment').append(comment_body).append(username);
      }
    });
});