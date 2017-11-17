$( document ).ready(function() {
    // scrape for new articles
    $("#scrape-btn").on("click", function(event) {
        // console.log("button clicked");
        $.get("/api/scrape", function(result) {
            console.log("scrape completed");
        });
    });

    // client-side: getting all saved articles
    $.get("/saved", function(result) {
        console.log("api GET route hit");
    })
    // client-side: saving article as read
    $(".save-article").on("click", function(result) {

        var article = $(this).attr('id');

        var obj = {
            id: article
        };
        // ajax call for put 
        $.ajax({
          url: "api/article/saved",
          data: obj,
          method: "PUT"
        }).done(function(dbSaved) {
            
            // Need to refresh page
            location.reload();
        });
    })

    // client-side: remove article from saved list
    $(".remove-article-btn").on("click", function(result) {

        console.log("remove note hit");

        var article = $(this).data('deleteid');

        var obj = {
            id: article
        }

        $.ajax({
          url: "api/article/remove",
          data: obj,
          method: "PUT"
        }).done(function(dbSaved) {
          // console.log(dbSaved);
          location.reload();
        });
    })

    $(".article-notes-btn").on("click", function(result){
        console.log("create note button");

        var articleId = $(this).data('cardid');
        console.log(articleId);

        // $.get("/api/notes/" + articleId, function(result){

            sendArticleId(articleId);
        // })
    })

    function sendArticleId(articleId){
        
        $(".save-note").on("click", function(event) {
            console.log("saved note button clicked");

            console.log(articleId);
            
            let title = $(this).parent().find(".note-title").val();
            let body = $(this).parent().find(".note-body").val();

            var noteObj = {
                articleId: articleId,
                title: title,
                body: body
            }
            
            console.log("sending this data over to " , noteObj);
            $.ajax({
                method: "POST",
                url: "/api/note",
                data: noteObj
            })
            .done(function(data){
                console.log(data);
                var url = window.location;

            });
        });
    }
    
    $(".delete-note").on("click", function(event){
        console.log("delete note clicked")

        var deleteId = $(this).data("id");

        $.ajax({
            method: "DELETE",
            url: "/api/delete/" + deleteId
        })
        .done(function(data){
            console.log(data);
        })
    })

    $(".close").on("click", function(event) {
        location.reload();
    })

    // client-side: create a note for an article and show existing notes

    // client-side: deleted note
});