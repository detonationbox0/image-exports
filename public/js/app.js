$(function() {
    console.log("Hello.")
});

$("#do-something").on("click", function() {
    var imgSrc = $("#image").attr("src");
    // console.log(imgSrc);

    $.post("/render", {image: imgSrc}).done(function(data) {
        $("#image").attr("src", "output.png")
    });

})