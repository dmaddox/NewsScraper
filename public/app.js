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
                          "<button data-id='" + data._id + "' id='savecomment'>Save Comment</button></form>" + 
                          "</div></div>");
  }
});

// Whenever someone clicks a p tag
$(document).on("click", ".comment", function() {
  // Save the id from the sibling tag
  var thisComment = $(this);
  console.log(thisComment);
  var thisId = $(this).siblings("p").attr("data-id");
  console.log(thisId);

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
        // Place the body of the comment in the body textarea
        var comment_body = $("#comment_body").val(data.comment.body);
        thisComment.after(comment_body);
      }
      thisComment.siblings("form").toggle();

    });
});