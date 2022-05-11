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

    // console.log(tr);

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
            imgNode.clearCache();
            imgNode.image(imageObj);
        };
        // imageObj.clearCache();
        imageObj.src = outFileName; 
        // tr.forceUpdate();*/
        // console.log(imgNode);
        // imgNode.image(outFileName);


        $("#wait").hide(); // Hide the loading animation
    });
});

/** ----------------------------------------------------------------------------
 *  KONVA EFFECTS
 *  ----------------------------------------------------------------------------
 */

/* ---------------------------------------------------------------------------- *
 * BLUR
 */
$(document).on("input", "#blur-slide", function() {
//#region
    var effectPercent = $(this).val();
    var imgNode = tr.nodes()[0];
    // Cache the image, if it's not cached (required for effects)
    if (imgNode.isCached() == false) {
        imgNode.cache()
    }

    // Add the filter if it's not there yet
    addFilter(imgNode, Konva.Filters.Blur, "Blur");

    console.log(`Blur ${effectPercent}%`);
    imgNode.blurRadius(effectPercent);
//#endregion
});

 

/* ---------------------------------------------------------------------------- *
* BRIGHTEN 
*/
$(document).on("input", "#brighten-slide", function() {
//#region
    var effectPercent = $(this).val();
    var imgNode = tr.nodes()[0];
    // Cache the image, if it's not cached (required for effects)
    if (imgNode.isCached() == false) {
        imgNode.cache();
    }

    // Add the filter if it's not there yet
    addFilter(imgNode, Konva.Filters.Brighten, "Brighten");

    console.log(`Brighten ${effectPercent}%`);
    imgNode.brightness(effectPercent);

//#endregion
});

/* ---------------------------------------------------------------------------- *
* BRIGHTEN 
*/
$(document).on("input", "#contrast-slide", function() {
//#region
    var effectPercent = $(this).val();
    var imgNode = tr.nodes()[0];
    // Cache the image, if it's not cached (required for effects)
    if (imgNode.isCached() == false) {
        imgNode.cache();
    }

    // Add the filter if it's not there yet
    addFilter(imgNode, Konva.Filters.Contrast, "Contrast");
    // console.log(`Contrast ${effectPercent}%`);
    console.log(effectPercent);
    imgNode.contrast(effectPercent);

//#endregion
});

  

/* ---------------------------------------------------------------------------- *
*  EMBOSS 
*/
$(document).on("input", "#emboss-slide-strength", function() {
//#region
    var effectPercent = $(this).val();
    var imgNode = tr.nodes()[0];
    // Cache the image, if it's not cached (required for effects)
    if (imgNode.isCached() == false) {
        imgNode.cache();
    }


    // Add the filter if it's not there yet
    addFilter(imgNode, Konva.Filters.Emboss, "Emboss");
    console.log(`Emboss (Strength) ${effectPercent}%`);
    imgNode.embossStrength(effectPercent);
//#endregion
});



/**
 * Check if filter is already on Image. If not, add it
 * @param {Konva Image} imgNode The image node we are looking at
 * @param {Konva Filter} filter The filter to add if it's not there
 * @param {String} filterString The name of the filter, used as the lookup
 * @returns
 */
function addFilter (imgNode, filter, filterString) {
//#region
    var filters = imgNode.filters();

    // is imgNode.filters() null? If so, there's no effect so just add it
    if (filters === null) {
        imgNode.filters([filter]);
        return
    }

    // Does the filter exist already?
    var filterExists = false;
    imgNode.filters().forEach(function(filter) {
        if (filter.name === filterString) {
            filterExists = true;
            return;
        }
    }); 

    if (filterExists === false) {
        // Filter is not there, add it
        filters.push(filter);
        imgNode.filters(filters);
    }

    return
//#endregion
}


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