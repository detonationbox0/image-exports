/**
 * Document is ready
 */
$(function() {
    console.log("Hello.")

    // User changes the shirt color
    $("#shirt-color").change(function () {
        var col = this.value;
        $("#tshirt").css("background-color", `rgb(${col})`);
    });

});




/**
 * -----------------------------------------------------------------------------------
 * User clicks Make Proof button 
 * -----------------------------------------------------------------------------------
 */
$(document).on("click", "#files", () => {

    // Show loading screen
    $("#wait").css("display", "flex"); 

    console.log("Let's make all of the files...")

    // Hide the guides first...
    hideGuides();

    // Get the PNG file as dataURL
    const dataURL = stage.toDataURL({ pixelRatio: 15 });
    // Get what image is being used
    const imgFile = $("#tshirt").attr("src");
    const imgWidth = $("#tshirt").width();
    const imgNatWidth = $("#tshirt").prop("naturalWidth");

  


    // Width of the canvas as it should appear on top of shirt
    finalCanvas = (300 * imgNatWidth) / imgWidth;
    // Scale of 4500px to equal final canvas width
    const s = finalCanvas / 4500 

    // Get the scale of the shirt's visible width and natural width
    const xScale =  imgNatWidth / imgWidth
    // x and y coordinate of canvas on shirt 
    let [x, y] = [
            $("#canvas").css("left").replace("px", ""),
            $("#canvas").css("top").replace("px", "")
        ]
    // // Multiply by scale of original image to current image size 
    x = Number(x) * xScale
    y = Number(y) * xScale


    // Get the rgb of the shirt
    let rgb = $("#shirt-color option:selected").val();


   // Make object to send to back end
    const obj =  {
        dataURL:dataURL,
        imgFile: imgFile,
        x: Math.round(x),
        y: Math.round(y),
        s: s,
        rgb: rgb
    }

    // Everything we need is loaded in to obj
    console.log("Object", obj)

    say("Downloading the shirt image...")
    $.post("/download-image", obj)
        .then(() => {
            say("Creating the canvas file...") 
            return $.post("/canvas-file", obj)
        })
        .then(() => {
            say("Making proof and thumbnail...")
            return $.post("/python", obj)
        })
        .then((p) => {
            // Release browser back to user.
            $("#wait").css("display", "none");

            if (p === false) {
                alert("Something went wrong executing the python process. Make sure python3 is installed and available in your PATH. Make sure PIL (pillow) is installed and available globally.\nhttps://pypi.org/project/Pillow/")
            }

            // Show the thumbnail, link to the PDF
            let d = new Date();
            $("#thumb-area").empty().append(`
                <img id="thumb" src="thumbs/Proof.png?${d.getTime()}" /><br />
                <a href="thumbs/proof.pdf" download>Download</a>
            `)


            $("#print-file-text").text("Making the print file...")
                .css("color", "crimson")

            return $.post("/make-print", obj)
        })
        .then(() => {
            console.log("Print file has been made.")
            $("#print-file-text").text("Print file has been made.")
                .css("color", "mediumseagreen")
        })
    
    
    showGuides();

})

// Useful for logging to the console and loading screen
function say(what) {
    console.log(what)
    $("#loading-message").text(what);
}

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

   
//#endregion ----------------------------------------------------------------------------------------------------------------------------------------------------------------