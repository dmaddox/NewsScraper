
// scrape NYT site & save to db
function scrape() {
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    // With that done, add the comment information to the page
    .done(function(data) {
      // delete any old & then re-populate 
      $("#articles").html("");
      populate();
  });
};

populate();

// display scrape results from db in DOM
function populate() {
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
                            "<button id='savecomment'>Save Comment</button><button id='delete'>Delete Comment</button></form>" + 
                            "</div></div>");
    }
  });

};



// TOGGLE COMMENT ===================================================================
// Whenever someone clicks a comment div
$(document).on("click", ".comment", function() {
  // save the comment's parent div
  var thisComment = $(this).parent();
  // Save the article id from the sibling p tag
  var thisId = thisComment.siblings("p").attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the comment information to the page
    .done(function(data) {
      console.log('.comment div data: ');
      console.log(data);
      // If there is a comment on the article
      if (data.comment) {
          // Place the body of the comment in the body textarea
          thisComment.find("#bodyinput").val(data.comment.body);
          // update the button's text to say "Update Comment"
          thisComment.find("#savecomment").text("Update Comment");
          // add a delete option
          thisComment.find("#delete").show();
          // add the comment's id as a data attribute
          console.log("test");
          console.log(data.comment._id);
          thisComment.find("#bodyinput").attr("data-comment-id", data.comment._id);
      }
      // if there is no comment, hide the delete button 
      else {
        thisComment.find("#delete").hide();
      }
      // 
      thisComment.find("button").attr("data-id", thisId);
      thisComment.children("form").toggle();

    });
});


// SAVE / UPDATE COMMENT ===================================================================
// When user clicks the #savecomment button
$(document).on("click", "#savecomment", function() {
  event.preventDefault();
  // save the comment for later reference
  var thisComment = $(this);
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  // determine if user is saving or updating a comment by checking for attr("data-comment-id")
  var commentId = $(this).siblings("#bodyinput").attr("data-comment-id");
  if (commentId) {
    console.log("commendId exists");
    // update comment
    updateComment(commentId, thisComment)
  } else {
    console.log('commentId does not yet exist');
    // save comment (need to add the data-commend-id)
    saveComment(thisId, thisComment);
  }
});


// POST request to save the comment & associate it with the article
function saveComment(thisId, thisComment) {
  console.log('Posting the following to the req.body: ');
  console.log(thisComment.siblings("#bodyinput").val());
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from note textarea
      body: thisComment.siblings("#bodyinput").val()
    }
  })
   // With that done
   .done(function(data) {
    // add the comment's id as a data attribute
    console.log("saving data-comment-id");
    console.log(data.comment);
    console.log(thisComment.siblings("#bodyinput").val())
    thisComment.siblings("#bodyinput").attr("data-comment-id", data.comment);
    // reveal delete button
     thisComment.siblings("#delete").show();
    // update save button to read "Update"
     thisComment.text("Update Comment");
    // let the user know the comment has been saved to the db
     var confirmDiv = $("<div class='confirmation'>Saved!</div>");
     thisComment.siblings(":last").after(confirmDiv);
     setTimeout(function(){
       thisComment.siblings(".confirmation").remove();
     }, 2000);
     console.log("Post request done, here is what is returned");
     console.log(data);
   });
};

// PUT? request to UPDATE the comment
function updateComment(commentId, thisComment) {
  console.log("put request for commentId: " + commentId);
  $.ajax({
    method: "PUT",
    url: "/comment/" + commentId,
    data: {
      // Value taken from note textarea
      body: thisComment.siblings("#bodyinput").val()
    }
  })
   // With that done
   .done(function(data) {
     thisComment.siblings("#delete").show();
     thisComment.text("Save Comment");
     thisComment.text("Update Comment");
     var confirmDiv = $("<div class='confirmation'>Saved!</div>");
     thisComment.siblings(":last").after(confirmDiv);
     setTimeout(function(){
       thisComment.siblings(".confirmation").remove();
     }, 2000);
   });
};


// DELETE COMMENT ==============================================================
// When user clicks the #delete button
$(document).on("click", "#delete", function() {
  event.preventDefault();
  // Save this
  var thisDelete = $(this);
  // empty textarea
  thisDelete.siblings("#bodyinput").val("");
  // Grab the comment's id from the submit button
  var commentId = $(this).siblings("#bodyinput").attr("data-comment-id");
  console.log("deleting comment" + commentId);
  // Run a PUT request to remove the comment and update the associated article
  deleteComment(commentId, thisDelete);
});

function deleteComment(id, thisDelete) {
  $.ajax({
    method: "DELETE",
    url: "/comment/" + id,
  })
    // With that done, add the comment information to the page
    .done(function(data) {
      console.log('comment ' + id + ' removed!');
      console.log(data);
      console.log(thisDelete.siblings("#bodyinput").attr("data-comment-id"));
      thisDelete.siblings("#bodyinput").removeAttr("data-comment-id");
      thisDelete.siblings("#savecomment").text("Save Comment");
      thisDelete.hide();
  });
};


// REFRESH / RESCRAPE ALL ======================================================
// When user clicks the #refresh-scrape button
$(document).on("click", "#refresh-scrape", function() {
  event.preventDefault();
  $.ajax({
    method: "DELETE",
    url: "/clear"
  })
    // With that done, add the comment information to the page
    .done(function(data) {
      // scrape the news site again
      scrape();
  });
});  