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
        console.log("save button clicked")
    })
});