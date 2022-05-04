$(function() {
    console.log("Hello.")
});

$(document).on("click", ".btn", function() {

    if ($(this).text() == "Add Image") {
        return;
    }

    var imageSrc;
    var whichEffect = $(this).attr("value");

    var imageObj = new Image();

    stage.find('.image').forEach((eachImage) => {
        // and we can snap to all edges of shapes
        // console.log();
        imageSrc = eachImage.src;

        // stage.draw();
    });



    $.post("/render", {
        image: imageSrc,
        effect: whichEffect
    }).done(function(data) {

        console.log("The server finished rendering...")

        stage.find('.image').forEach((eachImage) => {
            // and we can snap to all edges of shapes
            imageObj.onload = function() {
                eachImage.image(imageObj)
            }
            imageObj.src = "output.png";

        }); 
    });

});