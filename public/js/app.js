/**
 * Document is ready
 */
$(function() {
    console.log("Hello.")
});

/**
 * User clicks on an imagemagick effect
 */
$(document).on("click", ".magick-effect", function() {

    var whichEffect = $(this).attr("value"); // Different buttons have different effects

    var imageObj = new Image(); // Used after post to relink the source

    console.log(tr);

    var imgNode = tr.nodes()[0]; // Get the selection
    var imageSrc = $(imgNode.image()).attr("src"); // Current src of the image

    // Send to api (server.js)
    $("#wait").css("display", "flex"); // Show the loading animation
    $.post("/render", {
        image: imageSrc, // ex: "shark.png"
        effect: whichEffect // ex: "knockout"
    }).done(function(outFileName) {

        console.log(`The server finished rendering ${outFileName}...`);
        
        // Relink the image to the output.png
        imageObj.onload = function() {
            imgNode.image(imageObj);
        };

        imageObj.src = outFileName; 
        // tr.forceUpdate();
        $("#wait").hide(); // Hide the loading animation
    });
});

/**
 * User clicks on a Konva image effect
 */
 $(document).on("click", ".konva-effect", function() {

    var imgNode = tr.nodes()[0];
    var newImg = new Konva.Image();
    newImg.onload = function() {
        imgNode.image(this);
        imgNode.filters([Konva.Filters.Enhance]);
    }
    newImg.src = "rooster.jpg"

    // imgNode.filters([Konva.Filters.Enhance]); 


 });

 /**
  * User slides the Konva grayscale slider
  */
//   $(document).on("mousemove", "#grayscale-slide", function() {
//     console.log($(this).val())
//   })


/**
 * -----------------------------------------------------------------------------------
 * User clicks the Download button
 * -----------------------------------------------------------------------------------
 * */
$(document).on("click", "#download", function() {
    //#region
    hideGuides(); // The guides and transformer will be visible in the output
    var dataURL = stage.toDataURL({ pixelRatio: 15 });
    downloadURI(dataURL, 'stage.png')
    showGuides();
//#endregion
});



/**
 * DOWNLOAD-RELATED STUFF
 */
//#region ------------------------------------------------------------------------------------------------------------------------------------------------------------------
    /**
     * -----------------------------------------------------------------------------------
     * Hide the Guides!
     * -----------------------------------------------------------------------------------
     * */
    function hideGuides() {
        //#region
            // Hide the guides
            stage.find(".guide").forEach(function(guide) {
                guide.hide();
            })

            // Deselect things
            tr.hide();
        //#endregion
    }

    /**
     * -----------------------------------------------------------------------------------
     * Show the Guides
     * -----------------------------------------------------------------------------------
     * */
    function showGuides() {
        //#region
            // Hide the guides
            stage.find(".guide").forEach(function(guide) {
                guide.show();
            })

            // Deselect things
            tr.show();
        //#endregion
    }

    /**
     * -----------------------------------------------------------------------------------
     * Downloads the PNG
     * -----------------------------------------------------------------------------------
     * */
    function downloadURI(uri, name) {
        //#region
        var link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link.remove();
        //#endregion
    }
//#endregion ----------------------------------------------------------------------------------------------------------------------------------------------------------------