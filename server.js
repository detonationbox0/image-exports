const express = require('express');
const app = express();

var im = require('imagemagick-composite');
var sizeOf = require('image-size'); // Could be done with ImageMagick, but this is easier
var path = require('path');
const { Z_PARTIAL_FLUSH } = require('zlib');
// app.set('view engine', 'ejs');

app.use(express.static("public"))
app.use(express.urlencoded({extended: true}));

app.use(express.json());


/**--------------------------------------------------------------------------------------------------------------------
 * Apply Effects to the Image
 * --------------------------------------------------------------------------------------------------------------------
 * {
 *   image:fileName.png,
 *   effect:"knockout"
 * }
 * ImageMagick Reference: https://legacy.imagemagick.org/Usage/
 */

app.post("/render", (req, res) => {
//#region

    var imagePath = `${__dirname}/public/${req.body.image}`; // image from Konva in the front end
    var fileName = req.body.image.split('.').slice(0, -1).join('.');
    var outFileName = `${__dirname}/public/render/${Math.random().toString().substring(2, 8)}.png`;


    // console.log(`${__dirname}/public/${imagePath}`);
    console.log(req.body.effect);

    switch(req.body.effect) {
        case "knockout":
            // var args = [imagePath, "-transparent", "white", outPath];
            // convert rooster.jpg -fuzz 5% -bordercolor white -border 1 -fill none -draw "alpha 0,0 floodfill" -shave 1x1 output.png
            // var args = [imagePath, "-fuzz", "5%", "-bordercolor", "white", "-border", "1", "-fill", "none", , "-shave", "1x1", outPath];
            var args = [imagePath, "-fuzz", "5%", "-bordercolor", "white", "-border", "1", "-fill", "none", "-draw", 'alpha 0,0 floodfill', "-shave", "1x1", outFileName];
            console.log("Running Imagemagick with the following arguments:");
            console.log(args);
            im.convert(args, function(err, stdout) {

                if (err) { // Handle error
                    console.log(err);
                    return;
                }

                console.log(`Converted. Feeding back: ${path.basename(outFileName)}`);
                res.send(`render/${path.basename(outFileName)}`);
            });

            break;

        case "paint":

            var args = [imagePath, "-paint", "8", outFileName];
            console.log("Running Imagemagick with the following arguments:");
            console.log(args);
            im.convert(args, function(err, stdout) {

                if (err) { // Handle error
                    console.log(err);
                    return;
                }
                console.log(`Converted. Feeding back: ${path.basename(outFileName)}`);
                res.send(`render/${path.basename(outFileName)}`);
            });

            break;

        case "canny":

            var args = [imagePath, "-canny", "0x1+10%+20%", "-negate", outFileName];
            console.log("Running Imagemagick with the following arguments:");
            console.log(args);
            im.convert(args, function(err, stdout) {

                if (err) { // Handle error
                    console.log(err);
                    return;
                }
                console.log(`Converted. Feeding back: ${path.basename(outFileName)}`);
                res.send(`render/${path.basename(outFileName)}`);
            }); 

            break;

        case "pencil":

            var args = [imagePath, "-colorspace", "gray", "-sketch", "0x20+20", outFileName];
            console.log("Running Imagemagick with the following arguments:");
            console.log(args);
            im.convert(args, function(err, stdout) {

                if (err) { // Handle error
                    console.log(err);
                    return;
                }
                console.log(`Converted. Feeding back: ${path.basename(outFileName)}`);
                res.send(`render/${path.basename(outFileName)}`);
            }); 

            break;

        case "swirl":

            var args = [imagePath, "-swirl", "180", outFileName];
            console.log("Running Imagemagick with the following arguments:");
            console.log(args);
            im.convert(args, function(err, stdout) {

                if (err) { // Handle error
                    console.log(err);
                    return;
                }
                console.log(`Converted. Feeding back: ${path.basename(outFileName)}`);
                res.send(`render/${path.basename(outFileName)}`);
            }); 

            break;

        case "negate": // (negate)

            var args = [imagePath, "-negate", outFileName];
            console.log("Running Imagemagick with the following arguments:");
            console.log(args);
            im.convert(args, function(err, stdout) {

                if (err) { // Handle error
                    console.log(err);
                    return;
                }
                console.log(`Converted. Feeding back: ${path.basename(outFileName)}`);
                res.send(`render/${path.basename(outFileName)}`);
            }); 

            break;

        case "wave": // https://legacy.imagemagick.org/Usage/mapping/
 
            // This one requires a displacement map.
            // First, find out the dimensions of the imagePath
            var dims = sizeOf(imagePath);
            // console.log(dims);
            var w = dims.width;
            var h = dims.height;

            var mapPath = `${__dirname}/public/render/map.png`;
            // Displacement map
            var mArgs = [
                "-size", `${w}x${h}`,
                "gradient:",
                "-evaluate", "sin", "8",
                mapPath
            ]
            im.convert(mArgs, function(err, stdout) {
                // Entering callback hell...
                if (err) {
                    console.log(err); return;
                }
                console.log(`STDOUT:${stdout}`);
                var waveArgs = [
                    mapPath,
                    imagePath,
                    "-displace", "25x25",
                    outFileName
                ]

                im.composite(waveArgs, function(err, stdout) {
                    // Entering 2nd circle
                    if (err) {
                        console.log(err); return;
                    }
                    console.log(`STDOUT:${stdout}`);
                    res.send(`render/${path.basename(outFileName)}`);
                })

                
            });
            
            break;
        case "glass":

            /*
                FROSTED GLASS EFFECT:

                # PARAMS:
                    spread=5
                    bluramt=5
                    density=10

                #1:
                convert -quiet rooster.jpg -blur 0x5 +repage frosted_1.mpc

                #2:
                convert -size 1600x1598 xc: +noise Random \
                    -virtual-pixel tile \
                    -colorspace gray -contrast-stretch 0% \
                    outFile.png

                #3:
                convert outFile.png -colorspace sRGB\
                    -channel R -evaluate sine 10 \
                    -channel G -evaluate cosine 10 \
                    -channel RG -separate frosted_1.mpc -insert 0 \
                    -set colorspace RGB -define compose:args=5x5 \
                    -compose displace -composite rooster_out.png
            */

                // This one requires a displacement map.
                // First, find out the dimensions of the imagePath
                var dims = sizeOf(imagePath);
                var w = dims.width;
                var h = dims.height;

                var params = {
                    spread:10,
                    bluramt:5,
                    density:50
                };

                // Blurred image copy:
                var blurPath = `${__dirname}/public/render/blur.png`; 
                var noisePath = `${__dirname}/public/render/noise.png`; 
                
                // Step 1: Make a blurred copy of then input image
                var args = [
                    "-quiet",
                    imagePath,
                    "-blur", `0x${params.spread}`,
                    "+repage",
                    blurPath 
                ];

    
                im.convert(args, function(err, stdout) {

                    // Now entering callback hell...
                    if (err) { console.log(err); return }

                    // Create the noise file

                    var args = [
                        "-size", `${w}x${h}`,
                        "xc:",
                        "+noise", "random",
                        "-virtual-pixel", "tile",
                        "-colorspace", "gray",
                        "-contrast-stretch", "0%",
                        noisePath
                    ];

                    im.convert(args, function(err, stdout) {
                        // Entering the 2nd Circle....
                        if (err) { console.log(err); return } 

                        // Composite the noise and blur images into the final image
                        var args = [
                            noisePath,
                            "-colorspace", "sRGB",
                            "-channel", "R", "-evaluate", "sine", params.density,
                            "-channel", "G", "-evaluate", "cosine", params.density,
                            "-channel", "RG", "-separate", blurPath, "-insert", "0",
                            "-set", "colorspace", "RGB", "-define", `compose:args=${params.spread}x${params.spread}`,
                            "-compose", "displace", "-composite", outFileName
                        ];

                        im.convert(args, function(err, stdout) {
                            // Entering the 3rd Circle...
                            if (err) { console.log(err); return } 

                            // Send back to front end
                            res.send(`render/${path.basename(outFileName)}`)
                        })
                        
                    })

                    
                })
    
                break;

        case "thermal":

                // Translated from http://www.fmwconcepts.com/imagemagick/thermography/index.php

                var params = {
                    lowpt:0,
                    highpt:100
                };

                var range = `${Math.round(1000*(params.highpt-params.lowpt)/100)}%`;
                var offset = `${Math.round(1000*params.lowpt/100)}%`; 

                // First, make grayscale

                var grayPath = `${__dirname}/public/render/gray.png`; 

                var args = [
                    "-quiet",
                    imagePath,
                    "-colorspace", "gray",
                    "+repage",
                    grayPath
                ];

                im.convert(args, function(err, stdout) {

                    // Entering callback hell...

                    // Use the black and white image with the params to make heat map (the output)

                    if (err) { console.log(err); return };

                    var args = [
                        grayPath,
                        "(",
                            "-size", "1x1",
                            "xc:blueviolet",
                            "xc:blue",
                            "xc:cyan",
                            "xc:green1",
                            "xc:yellow",
                            "xc:orange",
                            "xc:red",
                            "+append",
                            "-filter", "Cubic",
                            "-resize", "1000x1!",
                            "-crop", `${range}x${range}+${offset}+0`,
                            "+repage",
                            "-resize", "1000x1!",
                        ")",
                        "-clut",
                        outFileName
                    ];

                    im.convert(args, function(err, stdout) {
                        // Entering 2nd Circle

                        if (err) { console.log(err); return }; 

                        // Send back to front end
                        res.send(`render/${path.basename(outFileName)}`)

                    });

                });



            break;

        case "toon": // 
            var params = {
                gain:5,
                method:1,
                blur:5,
                compose:"",
                saturation:100,
                brightness:100,
                smoothing:0
            }


            // First command:
            // convert -quiet "$infile" +repage $dir/tmpI.mpc
            // This just duplicates the image from what I can tell
            var dupFile = `${__dirname}/public/render/dup.png`;  

            var args = [
                "-quiet",
                imagePath,
                "+repage",
                dupFile 
            ];

            im.convert(args, function(err, stdout) {
                // Next command:
                /*
                convert $dir/tmpI.mpc \
                    \( -clone 0 -colorspace gray -define convolve:scale='!' \
                    -define morphology:compose=Lighten \
                    -morphology Convolve  'Sobel:>' \
                    -negate -evaluate pow $gain -sigmoidal-contrast $smoothing,50% \) \
                    +swap -compose colorize -composite \
                    $composing $modulating \
                    "$outfile"
                */

                var args = [
                    dupFile,
                    "(",
                        "-clone", "0",
                        "-colorspace", "gray",
                        "-define", "convolve:scale='!'",
                        "-define", "morphology:compose=Lighten",
                        "-morphology", "Convolve", "Sobel:>",
                        "-negate", "-evaluate", "pow", params.gain,
                        "-sigmoidal-contrast", params.smoothing,
                    ")",
                    "+swap",
                    "-compose", "colorize",
                    "-composite",
                    outFileName
                ];

                im.convert(args, function(err, stdout) {
                    // Final image has been output. Send back to front.

                    if (err) { console.log(err); return }; 

                        // Send back to front end
                    res.send(`render/${path.basename(outFileName)}`)
                })

            });

            break;

        case "swap":

            /*
            convert rose: \( +clone -channel R -fx B \) \
                    +swap -channel B -fx v.R     fx_rb_swap.gif
            */

            var args = [
                imagePath,
                "(",
                    "+clone",
                    "-channel", "R",
                    "-fx", "B",
                ")",
                "+swap",
                "-channel", "B",
                "-fx", "v.R",
                outFileName
            ]

            im.convert(args, function(err, stdout) {
                if (err) { console.log(err); return }
                res.send(`render/${path.basename(outFileName)}`)
            })

            break;
    }
//#endregion
});



/**--------------------------------------------------------------------------------------------------------------------
 * Convert image to PNG file
 * --------------------------------------------------------------------------------------------------------------------
 * {
 *   file:fileName.psd,
 * }
 */
app.post("/convert", (req, res) => {
    var file = req.body.filename;
    var filename = file.split('.').slice(0, -1).join('.');
    // var png 
    var ext = file.split(".").pop();
    var inFile  = `${__dirname}/public/${file}` + ((ext == "psd") ? "[0]" : ""); // PSD layers get exported. Without [0], there's 50 png files made. The first one is the PSD itself.
    var outFile = `${__dirname}/public/${filename}.png`;

    im.convert([inFile, `${__dirname}/public/${filename}.png`], function(err, stdout) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Image converted. Kicking back with name of PNG file");
        res.send(`${filename}.png`);
    });
});

app.listen(3000, function() {
    console.log("Server is running on http://localhost:3000...")
});


/*
var maskOnePath = `${__dirname}/public/mask1.png`;

            var mArgs = [
                imagePath,
                "-size", `${w}x${h}`,
                "xc:",
                "-channel", "R",
                "-fx", "yy=(j+.5)/h-.5; (i/w-.5)/(sqrt(1-4*yy^2))+.5",
                "-separate", "+channel",
                maskOnePath
            ];

            im.convert(mArgs, function (err, stdout) {

                // Now entering into callback hell...
                // First sphere gradient map is rendered.

                // The output of this should be as close to 100px x 100px as possible for blurring purposes
                // What percent of ${w} makes it approx. 100px?
                // ${w}x = 100
                // x = 100 / ${w}
                // From docs (in Large Blur using Resize area):
                // "The technique is basically shrink the image, then enlarge it again to generate the heavilly blured result."
                // var scale = 100 / w;
                // var sW = w * scale;
                // var sH = h * scale;

                // From docs:
                // "Now this mapping also has some large areas which would be classed as invalid, so will need some type of masking to define what pixels will be valid and invalid in the final image. A simple circle will do in this case."
                var maskTwoPath = `${__dirname}/public/mask2.png`;
                var mArgs = [
                    "-size", `${w}x${h}`,
                    "xc:black",
                    "-fill", "white",
                    "-draw", `circle ${w/2},${h/2} ${w/2},0`,
                    maskTwoPath
                ]
                console.log(mArgs);
                im.convert(mArgs, function(err, stdout) {

                    // Now entering the 2nd circle...

                    // Circle map is now rendered and is ${scale}% of og size...

                    // From docs:
                    // "And to complete we also need a shading highlight"
                    var maskThreePath = `${__dirname}/public/mask3.png`
                    var mArgs = [
                        maskTwoPath,
                        "(",
                            "+clone",
                            "-blur", "0x25",
                            "-shade", "110x21.7",
                            "-contrast-stretch", "0%",
                            "+sigmoidal-contrast", "6x50%",
                            "-fill", "grey50",
                            "-colorize", "10%",
                        ")",
                        "-composite",
                        maskThreePath
                    ];

                    im.convert(mArgs, function(err, stdout) {

                        // Now entering the 3rd circle...

                        res.send("Done");

                    });



                });

            });
 */