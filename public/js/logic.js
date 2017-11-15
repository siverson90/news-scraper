$( document ).ready(function() {
    $("#scrape-btn").on("click", function(event) {
        // console.log("button clicked");
        $.get("/api/scrape", function(result) {
            console.log("scrape completed");
        });
    });

        // console.log("button clicked");
    $.get("/articles/saved", function(result) {
        console.log("api GET route hit");
    })

    $(".save-article").on("click", function(result) {

        var article = $(this).attr('id');

        var obj = {
            id: article
        }
        // ajax call for put 
        $.ajax({
          url: "api/saved",
          data: obj,
          method: "PUT"
        }).done(function(dbSaved) {
          console.log(dbSaved);
          console.log("ajax hit")
        });
    })
});