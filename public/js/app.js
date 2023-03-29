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
    imgNode.contrast(Number(effectPercent));

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


$(document).on("input", "#emboss-slide-white", function() {
//#region
    var effectPercent = $(this).val();
    var imgNode = tr.nodes()[0];
    // Cache the image, if it's not cached (required for effects)
    if (imgNode.isCached() == false) {
        imgNode.cache();
    }


    // Add the filter if it's not there yet
    addFilter(imgNode, Konva.Filters.Emboss, "Emboss");
    console.log(`Emboss (White Level) ${effectPercent}%`);
    imgNode.embossWhiteLevel(effectPercent);
//#endregion
});

$(document).on("click", ".emboss-dir", function() {
//#region
    var effectPercent = $(this).val();
    var imgNode = tr.nodes()[0];
    // Cache the image, if it's not cached (required for effects)
    if (imgNode.isCached() == false) {
        imgNode.cache();
    }


    // Add the filter if it's not there yet
    addFilter(imgNode, Konva.Filters.Emboss, "Emboss");

    // What direction did they want?
    var dir = $(this).val();

    console.log(`Emboss (Direction) ${dir}`);
    imgNode.embossDirection(dir);
//#endregion
});

$(document).on("click", "#emboss-blend", function() {
//#region
    var effectPercent = $(this).val();
    var imgNode = tr.nodes()[0];
    // Cache the image, if it's not cached (required for effects)
    if (imgNode.isCached() == false) {
        imgNode.cache();
    }


    // Add the filter if it's not there yet
    addFilter(imgNode, Konva.Filters.Emboss, "Emboss");

    // Yay or nay?
    var yayNay = $(this).prop('checked');

    console.log(`Emboss (Direction) ${yayNay}`);
    imgNode.embossBlend(yayNay);
//#endregion
});

/* ---------------------------------------------------------------------------- *
*   ENHANCE
*/


$(document).on("input", "#enhance-slide", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.Enhance, "Enhance");
        console.log(`Enhance ${effectPercent}%`);
        imgNode.enhance(effectPercent);
    //#endregion
});

/* ---------------------------------------------------------------------------- *
*   GRAYSCALE
*/


$(document).on("click", "#grayscale", function() {
    //#region
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.Grayscale, "Grayscale");

    //#endregion
});

/* ---------------------------------------------------------------------------- *
*  LUMINANCE (HSL) 
*/

$(document).on("input", "#luminance-h", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.HSL, "HSL");
        console.log(`Hue ${Number(effectPercent)}%`);
        imgNode.hue(Number(effectPercent));
    //#endregion
});

$(document).on("input", "#luminance-s", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.HSL, "HSL");
        console.log(`Saturation ${Number(effectPercent)}%`);
        imgNode.saturation(Number(effectPercent));
    //#endregion
});

$(document).on("input", "#luminance-l", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.HSL, "HSL");
        console.log(`Luminance ${Number(effectPercent)}%`);
        imgNode.luminance(Number(effectPercent));
    //#endregion
});

/* ---------------------------------------------------------------------------- *
*  VALUE (HSV) 
*/
$(document).on("input", "#hsv-h", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.HSV, "HSV");
        console.log(`Hue ${Number(effectPercent)}%`);
        imgNode.hue(Number(effectPercent));
    //#endregion
});

$(document).on("input", "#hsv-s", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.HSV, "HSV");
        console.log(`Saturation ${Number(effectPercent)}%`);
        imgNode.saturation(Number(effectPercent));
    //#endregion
});

$(document).on("input", "#hsv-l", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.HSV, "HSV");
        console.log(`Value ${Number(effectPercent)}%`);
        imgNode.value(Number(effectPercent));
    //#endregion
});


/* ---------------------------------------------------------------------------- *
*  INVERT 
*/

$(document).on("click", "#invert", function() {
    //#region
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.Invert, "Invert");

    //#endregion
});


/* ---------------------------------------------------------------------------- *
*  MASK 
*/
$(document).on("input", "#mask", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.Mask, "Mask");
        console.log(`Mask ${Number(effectPercent)}`);
        imgNode.threshold(Number(effectPercent));
    //#endregion
});

/* ---------------------------------------------------------------------------- *
*  NOISE 
*/
$(document).on("input", "#noise", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.Noise, "Noise");
        console.log(`Noise ${Number(effectPercent)}`);
        imgNode.noise(Number(effectPercent));
    //#endregion
});

/* ---------------------------------------------------------------------------- *
*  PIXELATE
*/
$(document).on("input", "#pixelate", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.Pixelate, "Pixelate");
        console.log(`Pixel Size ${Number(effectPercent)}`);
        imgNode.pixelSize(Number(effectPercent));
    //#endregion
});

/* ---------------------------------------------------------------------------- *
*  POSTERIZE
*/
$(document).on("input", "#posterize", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.Posterize, "Posterize");
        console.log(`posterize ${Number(effectPercent)}`);
        imgNode.levels(Number(effectPercent));
    //#endregion
});

/* ---------------------------------------------------------------------------- *
*  RGB
*/
$(document).on("input", "#rgb-r", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.RGB, "RGB");
        console.log(`Red ${Number(effectPercent)}`);
        imgNode.red(Number(effectPercent));
    //#endregion
});
$(document).on("input", "#rgb-g", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.RGB, "RGB");
        console.log(`Green ${Number(effectPercent)}`);
        imgNode.green(Number(effectPercent));
    //#endregion
});
$(document).on("input", "#rgb-b", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.RGB, "RGB");
        console.log(`Blue ${Number(effectPercent)}`);
        imgNode.blue(Number(effectPercent));
    //#endregion
});


/* ---------------------------------------------------------------------------- *
*  RGBA
*/
$(document).on("input", "#rgba-r", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.RGBA, "RGBA");
        console.log(`Red ${Number(effectPercent)}`);
        imgNode.red(Number(effectPercent));
    //#endregion
});
$(document).on("input", "#rgba-g", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.RGBA, "RGBA");
        console.log(`Green ${Number(effectPercent)}`);
        imgNode.green(Number(effectPercent));
    //#endregion
});
$(document).on("input", "#rgba-b", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.RGBA, "RGBA");
        console.log(`Blue ${Number(effectPercent)}`);
        imgNode.blue(Number(effectPercent));
    //#endregion
});
$(document).on("input", "#rgba-a", function() {
    //#region
        var effectPercent = $(this).val();
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.RGBA, "RGBA");
        console.log(`Alpha ${Number(effectPercent)}`);
        imgNode.alpha(Number(effectPercent));
    //#endregion
});

/* ---------------------------------------------------------------------------- *
*  Sepia
*/

$(document).on("click", "#sepia", function() {
    //#region
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.Sepia, "Sepia");

    //#endregion
});

/* ---------------------------------------------------------------------------- *
*  Solarize
*/

$(document).on("click", "#solarize", function() {
    //#region
        var imgNode = tr.nodes()[0];
        // Cache the image, if it's not cached (required for effects)
        if (imgNode.isCached() == false) {
            imgNode.cache();
        }
    
    
        // Add the filter if it's not there yet
        addFilter(imgNode, Konva.Filters.Solarize, "Solarize");

    //#endregion
});


/* ---------------------------------------------------------------------------- *
*  Threshold
*/
$(document).on("click", "#threshold", function() {
    //#region
    var effectPercent = $(this).val();
    var imgNode = tr.nodes()[0];
    // Cache the image, if it's not cached (required for effects)
    if (imgNode.isCached() == false) {
        imgNode.cache();
    }


    // Add the filter if it's not there yet
    addFilter(imgNode, Konva.Filters.Threshold, "Threshold");
    console.log(`Threshold ${Number(effectPercent)}`);
    imgNode.threshold(Number(effectPercent));
//#endregion
});

// $(document).on("input", "#value", function() {
//     //#region
//         var effectPercent = $(this).val();
//         var imgNode = tr.nodes()[0];
//         // Cache the image, if it's not cached (required for effects)
//         if (imgNode.isCached() == false) {
//             imgNode.cache();
//         }
    
    
//         // Add the filter if it's not there yet
//         addFilter(imgNode, Konva.Filters.HSV, "HSV");
//         console.log(`Luminance ${Number(effectPercent)}%`);
//         imgNode.value(Number(effectPercent));
//     //#endregion
// });


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
    $("#wait").css("display", "flex"); 
    //#region
    hideGuides(); // The guides and transformer will be visible in the output
    var dataURL = stage.toDataURL({ pixelRatio: 15 });
    // console.log(dataURL)
    // downloadURI(dataURL, 'stage.png');
    // Create the trimmed outputs

    $.post("/export", {
        dataURL:dataURL
    }).done(function(res) {
        console.log(res);



        // setWidthHeight();
        resetImages(function() {
            console.log("Updating sizes...")
            var fW = document.querySelector("#img-full").naturalWidth;
            var fH = document.querySelector("#img-full").naturalHeight;
            var tW = document.querySelector("#img-trim").naturalWidth;
            var tH = document.querySelector("#img-trim").naturalHeight;
                // Grab the images's width and heights and update dom
        
            $("#full-w").text(fW); $("#full-h").text(fH); $("#trim-w").text(tW); $("#trim-h").text(tH);  
        });




        $("#wait").hide(); // Hide the loading animation
        $("#output-preview").css("display", "flex");
    });
    
    

    showGuides();


//#endregion
});

/**
 * -----------------------------------------------------------------------------------
 * User clicks Make Proof button 
 * -----------------------------------------------------------------------------------
 */
$(document).on("click", "#files", () => {
    $("#wait").css("display", "flex"); 
    console.log("Let's make all of the files...")
    // Hide the guides first...
    hideGuides();

    // Get the PNG file as dataURL
    const dataURL = stage.toDataURL({ pixelRatio: 15 });
    // Get what image is being used
    const imgFile = $("#tshirt").attr("src");

    // Assume an x and y coordinate to map onto the shirt image
    const [x, y] = [$("#canvas").css("left"), $("#canvas").css("top")];

    // What should the 4500px be scaled to to match the current width of the canvas?
    s = $("#canvas").width() / 4500;

    // Get the rgb of the shirt
    let rgb = $("#tshirt").css("background-color")
    rgb = rgb.replace("rgb(", "");
    rgb = rgb.replace(")", "")
    rgb = rgb.replace(/\s/g, '')


   // Make object to send to back end
    const obj =  {
        dataURL:dataURL,
        imgFile: imgFile,
        x: x,
        y: y,
        s: s,
        rgb: rgb
    }

    console.log(obj)
    
    $.post("/files", obj).done(function(res) {
        console.log(res);
        $("#wait").hide();

        
 
        // $("#output-preview").css("display", "flex");
    });
    showGuides();

})



function resetImages(callback) {
    // Make the image files update
    var d = new Date();
    $("#img-full").attr("src", "/Front_Original.png?"+d.getTime());
    $("#img-trim").attr("src", "/Front_Trim.png?"+d.getTime());
    callback();
}




/**
 * OUTPUT PREVIEW STUFF
 */

$(document).on("click", "#close", function() {
    $("#output-preview").fadeOut();
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