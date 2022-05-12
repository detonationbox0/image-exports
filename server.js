const express = require('express');
const app = express();

var im = require('imagemagick-composite');
var sizeOf = require('image-size'); // Could be done with ImageMagick, but this is easier
var path = require('path');
var fs = require('fs');
// var exiftool = require('node-exiftool');
// const { Z_PARTIAL_FLUSH } = require('zlib');
// const { runMain } = require('module');
// app.set('view engine', 'ejs');

app.use(express.static("public"))
app.use(express.urlencoded({limit:"100mb", extended: true}));

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
    //#region
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

//#endregion
});

/**--------------------------------------------------------------------------------------------------------------------
 * Create the output images for Jordan 
 * --------------------------------------------------------------------------------------------------------------------
 * {
 *   file:fileName.psd,
 * }
 */
app.post("/export", (req, res) => {

    // console.log("Exporting file...");

    var imageBuffer = decodeBase64Image(req.body.dataURL);
    // fs.writeFileSync('data.' + ext, buffer);
    var fullFile = `${__dirname}/public/Front_Original.png`;
    var trimFile = `${__dirname}/public/Front_Trim.png`;

    // Write the file
    console.log(`Writing ${fullFile}`);
    fs.writeFile(fullFile , imageBuffer.data, function(err) { 
        if (err) { console.log(err); return; };


        console.log("Done.");

       // Trim the image
       // convert Original.png -trim +repage Trimmed.png
        var args = [
            fullFile,
            "-trim",
            "+repage",
            trimFile
        ];
        console.log(`Trimming ${fullFile}`)
        im.convert(args, function(err, stdout) {
            if (err) { console.log(err); return; }
            console.log(`Done.`);
            res.send("Done.");
        });

        
    });

});

/**
 * Decode Base64 Image
 * https://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
 * @param {String} dataString Base64 Image Data
 * @returns 
 */
function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};
  
    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }
  
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
  
    return response;
  }
  

app.listen(3000, function() {
    console.log("Server is running on http://localhost:3000...")
});

/* I couldn't get this one to work. */

        // case "toon": // http://www.fmwconcepts.com/imagemagick/toon/index.php
        //     var params = {
        //         gain:5,
        //         method:1,
        //         blur:5,
        //         compose:"",
        //         saturation:100,
        //         brightness:100,
        //         smoothing:0
        //     }


        //     // First command:
        //     // convert -quiet "$infile" +repage $dir/tmpI.mpc
        //     // This just duplicates the image from what I can tell
        //     var dupFile = `${__dirname}/public/render/dup.png`;  

        //     var args = [
        //         "-quiet",
        //         imagePath,
        //         "+repage",
        //         dupFile 
        //     ];

        //     im.convert(args, function(err, stdout) {
        //         // Next command:
        //         /*
        //         convert $dir/tmpI.mpc \
        //             \( -clone 0 -colorspace gray -define convolve:scale='!' \
        //             -define morphology:compose=Lighten \
        //             -morphology Convolve  'Sobel:>' \
        //             -negate -evaluate pow $gain -sigmoidal-contrast $smoothing,50% \) \
        //             +swap -compose colorize -composite \
        //             $composing $modulating \
        //             "$outfile"
        //         */

        //         var args = [
        //             dupFile,
        //             "(",
        //                 "-clone", "0",
        //                 "-colorspace", "gray",
        //                 "-define", "convolve:scale='!'",
        //                 "-define", "morphology:compose=Lighten",
        //                 "-morphology", "Convolve", "Sobel:>",
        //                 "-negate", "-evaluate", "pow", params.gain,
        //                 "-sigmoidal-contrast", params.smoothing,
        //             ")",
        //             "+swap",
        //             "-compose", "colorize",
        //             "-composite",
        //             outFileName
        //         ];

        //         im.convert(args, function(err, stdout) {
        //             // Final image has been output. Send back to front.

        //             if (err) { console.log(err); return }; 

        //                 // Send back to front end
        //             res.send(`render/${path.basename(outFileName)}`)
        //         })

        //     });

        //     break;
               
        
        /* I couldn't get this one to work. */

        // case "crystal": // http://www.fmwconcepts.com/imagemagick/crystallize/index.php
                

        //     var params = {
        //         number:500,
        //         seed:""
        //     }

        //     var dims = sizeOf(imagePath);
        //     var w = dims.width;
        //     var h = dims.height;

        //     // It appears we need a list of random coordinates for x and y.
            

        //     // First action:
        //     /*
        //         convert -quiet -regard-warnings "$infile" +repage -alpha off "$tmpA1" ||
        //             errMsg "--- 1 FILE $infile DOES NOT EXIST OR IS NOT AN ORDINARY FILE, NOT READABLE OR HAS ZERO size  ---"
        //     */
        //     // This appears to be removing the alpha channel, but there's no visible effect on the output...

        //     var tmpFile = `${__dirname}/public/render/tmp.png`;

        //     var args = [
        //         "-quiet",
        //         imagePath,
        //         "+repage",
        //         "-alpha", "off",
        //         tmpFile
        //     ];

        //     im.convert(args, function(err, stdout) {
        //         if (err) { console.log(err); return }; 

        //         /*
        //         The next action is:
        //         ---------------------------------------------------------------------------------
        //         convert $tmpA1 \
        //             \( -clone 0 -fill black -colorize 100 \
        //             -fill white -draw "$list" \) \
        //             -alpha off -compose copy_opacity -composite \
        //             sparse-color:- | \
        //             convert -size ${ww}x${hh} xc: -sparse-color Voronoi @- "$outfile"
        //         ---------------------------------------------------------------------------------
                
        //         $list gets defined using this for loop:
        //        --------------------------------------------------------------------------------- 
        //         list=""
        //         xseed=$((seed % 32767))
        //         yseed=$((seed+1 % 32767))
        //         for ((i=0; i<number; i++)); do
        //             if [ "$seed" = "" ]; then
        //                 x=$((RANDOM % wwm1))
        //                 y=$((RANDOM % hhm1))
        //                 else
        //                 RANDOM=$((xseed % 32767))
        //                 x=$(($RANDOM % wwm1))
        //                 RANDOM=$((yseed % 32767))
        //                 y=$(($RANDOM % hhm1))
        //             fi
        //             list="$list point $x,$y"
        //             j=$((i+1))
        //             xseed=$((xseed+i*i))
        //             yseed=$((yseed+j*j))
        //         done
        //         ---------------------------------------------------------------------------------
        //         After some testing, by the time the command is run, $list looks like:
        //         point 1428,23 point 1196,577 point 1184,124 point 937,584 point 1393,287 point 1047,1403 point 55,831 point 442,965 point 432,1232 point 466,94 point 13,1007 point 513,1197 point 1412,72 point 183,1221 point 625,512 point 1460,1206 point 1121,427 point 68,1175 point 438,1137 point 1321,779 point 997,1596 point 1469,308 point 1300,1017 point 1013,224 point 146,710 point 1549,283 point 417,1572 point 523,669 point 193,909 point 1019,1461 point 902,51 point 1426,1268 point 513,630 point 1379,1579 point 432,1123 point 548,1591 point 524,744 point 1358,384 point 1534,1166 point 1013,342 point 1068,28 point 1159,289 point 949,1366 point 155,679 point 113,500 point 976,1281 point 436,1267 point 364,1505 point 1185,1142 point 1176,1432 point 1569,1364 point 1575,396 point 1583,607 point 568,1116 point 1126,1243 point 705,1304 point 1464,1025 point 1115,178 point 100,1198 point 762,1187 point 1502,1095 point 1325,296 point 486,810 point 1332,941 point 472,459 point 703,457 point 1261,595 point 165,573 point 770,1218 point 97,593 point 1437,264 point 1145,1112 point 983,332 point 440,931 point 575,96 point 507,233 point 1236,449 point 1260,1399 point 872,828 point 952,576 point 316,1211 point 747,831 point 275,1393 point 31,1205 point 56,1244 point 577,895 point 1553,255 point 942,632 point 637,370 point 947,1129 point 414,279 point 688,1142 point 1559,1338 point 1163,1123 point 1592,153 point 628,1202 point 13,823 point 87,793 point 1158,1478 point 889,220 point 1175,1242 point 1352,223 point 1575,817 point 1097,1288 point 394,1431 point 1578,1094 point 274,1301 point 198,525 point 1308,1271 point 1005,48 point 439,1458 point 961,793 point 1033,144 point 291,323 point 1030,818 point 815,837 point 63,405 point 589,826 point 974,1367 point 187,862 point 839,133 point 893,1232 point 135,347 point 1093,992 point 702,415 point 1113,1322 point 161,907 point 889,194 point 1435,1085 point 893,1023 point 390,26 point 255,385 point 391,644 point 797,1015 point 189,1201 point 1545,121 point 1490,1314 point 191,380 point 1015,1517 point 1425,91 point 1303,768 point 1405,906 point 1276,987 point 958,34 point 1429,1058 point 973,1387 point 1517,419 point 428,1424 point 846,965 point 90,844 point 1442,322 point 1305,211 point 76,1347 point 386,652 point 845,94 point 805,662 point 474,1483 point 553,1229 point 1288,1579 point 74,498 point 224,962 point 33,765 point 1240,1 point 151,1393 point 1475,552 point 922,1161 point 1501,974 point 1148,1242 point 483,36 point 1123,228 point 173,1593 point 1217,365 point 947,1119 point 42,848 point 288,80 point 1115,672 point 1589,330 point 318,185 point 601,1445 point 587,1426 point 1279,593 point 562,532 point 1351,492 point 351,566 point 756,667 point 851,1450 point 1301,1054 point 618,1380 point 424,124 point 88,707 point 128,975 point 1333,199 point 1088,585 point 1254,822 point 776,853 point 498,730 point 1455,26 point 621,804 point 1320,108 point 1348,1537 point 348,434 point 805,1010 point 317,491 point 171,710 point 402,66 point 1309,300 point 1215,587 point 375,1471 point 1229,1017 point 256,1391 point 1549,1481 point 204,549 point 580,566 point 702,655 point 345,46 point 189,912 point 75,725 point 955,1365 point 1484,1090 point 955,1534 point 520,1149 point 693,1570 point 177,1564 point 1048,1049 point 325,1267 point 1492,813 point 1259,785 point 10,259 point 1000,964 point 1572,503 point 692,526 point 828,616 point 1305,83 point 71,1031 point 1231,1487 point 91,965 point 204,1445 point 1189,160 point 984,1580 point 1322,1552 point 1246,322 point 723,396 point 840,122 point 183,1275 point 820,208 point 391,794 point 825,1529 point 70,709 point 419,540 point 500,150 point 173,966 point 225,695 point 1077,913 point 1352,547 point 577,613 point 1560,1250 point 234,1543 point 486,1539 point 1380,1552 point 996,718 point 338,0 point 1071,1289 point 1010,1373 point 241,924 point 746,280 point 959,1372 point 685,286 point 810,1261 point 517,574 point 67,911 point 901,885 point 488,1277 point 521,537 point 1261,989 point 166,1398 point 248,114 point 430,738 point 1505,118 point 49,683 point 475,1430 point 1393,320 point 542,1046 point 526,912 point 1238,1272 point 1274,203 point 1442,281 point 837,1362 point 37,71 point 309,361 point 756,254 point 1012,1418 point 1358,777 point 137,1456 point 1585,1235 point 123,669 point 1444,1301 point 1253,1024 point 1106,396 point 43,994 point 121,1435 point 1087,1288 point 1132,968 point 1092,1595 point 1267,534 point 1572,1170 point 1018,216 point 1566,883 point 493,380 point 671,1481 point 748,575 point 1207,54 point 1441,877 point 1396,1511 point 904,1440 point 532,96 point 805,471 point 1448,164 point 780,635 point 98,1076 point 443,1275 point 1252,218 point 1252,185 point 421,539 point 206,1116 point 1435,1199 point 409,605 point 1047,693 point 1105,171 point 1053,361 point 141,783 point 294,914 point 1034,853 point 457,560 point 1571,874 point 1288,1538 point 192,1343 point 84,608 point 300,1096 point 337,183 point 641,888 point 1595,1289 point 783,564 point 745,235 point 250,522 point 34,1182 point 233,1439 point 964,1172 point 924,1471 point 1544,47 point 318,1057 point 1069,1399 point 1524,226 point 957,889 point 1320,892 point 1081,1144 point 1074,1231 point 892,297 point 843,1493 point 796,1061 point 271,1225 point 1130,1483 point 520,894 point 392,956 point 576,119 point 1572,1339 point 563,1409 point 14,553 point 634,1166 point 961,727 point 666,1445 point 953,549 point 786,988 point 430,255 point 726,1204 point 277,1346 point 950,1363 point 504,1491 point 1552,736 point 1385,113 point 27,649 point 324,168 point 662,642 point 479,1194 point 867,1455 point 935,81 point 1464,41 point 58,253 point 1451,266 point 335,234 point 948,81 point 809,90 point 429,461 point 475,69 point 1060,216 point 537,21 point 945,1023 point 1375,1427 point 904,1519 point 989,548 point 1560,425 point 697,1509 point 36,1089 point 1071,333 point 1461,383 point 450,1254 point 828,895 point 1022,786 point 10,907 point 789,335 point 1117,1035 point 182,343 point 114,414 point 906,546 point 378,1264 point 250,507 point 418,1097 point 660,705 point 1052,1216 point 449,34 point 50,23 point 431,1313 point 827,948 point 1299,532 point 1003,740 point 906,909 point 997,246 point 472,617 point 1556,149 point 1235,578 point 963,1214 point 1138,535 point 1520,605 point 1002,41 point 1566,209 point 1181,787 point 374,731 point 483,358 point 206,816 point 609,1040 point 691,153 point 99,701 point 1142,490 point 118,201 point 403,1166 point 478,1557 point 882,361 point 310,625 point 939,487 point 65,525 point 1398,1254 point 898,705 point 1589,472 point 1409,994 point 973,276 point 1296,762 point 1094,1317 point 602,452 point 771,529 point 1186,47 point 1409,113 point 1292,615 point 1148,979 point 193,767 point 1080,1241 point 1566,267 point 1578,1055 point 1351,264 point 423,137 point 1392,1268 point 1522,76 point 1069,336 point 1039,1341 point 427,426 point 1081,806 point 364,37 point 1296,465 point 558,737 point 739,634 point 981,1537 point 1179,1380 point 1010,29 point 1060,1371 point 1300,1297 point 773,1053 point 1550,348 point 1442,220 point 224,337 point 938,201 point 571,1120 point 427,195 point 867,818 point 1543,1463 point 1294,465 point 1426,115 point 1453,313 point 411,743 point 89,100 point 8,1443 point 1258,784 point 125,1086
                
        //         I'll try to do that in JS.
        //         */
        //         var wwm1 = (w - 1);
        //         var hhm1 = (h - 1);
        //         var list = ""; 
        //         for (var i = 0; i < 500; i++) {
        //             // Loops 500 times
        //             if (params.seed == "") {
        //                 // What's happening here is, this is trying to find a random number between
        //                 // 0 and the width or height, as described by example 2 here:
        //                 // https://linuxconfig.org/generating-random-numbers-in-bash-with-examples
        //                 // Only in his script, he subracted 1 up front
        //                 var x = (Math.random() * 1000) % wwm1;
        //                 var y = (Math.random() * 1000) % hhm1;
        //             } else {
        //                 var x = params.seed % wwm1;
        //                 var y = params.seed % hhm1;
        //             }

        //             list = list + ` point ${x}, ${y}`
        //         }

        //         var pipeFile = `${__dirname}/public/render/pipe.png`; 

        //         // With the list now defined, let's run the final command,
        //         var args = [
        //             imagePath,
        //             "(",
        //                 "-clone", "0",
        //                 "-fill", "black",
        //                 "-colorize", "100",
        //                 "-fill", "white",
        //                 "draw", list,
        //             ")",
        //             "-alpha", "off",
        //             "-compose", "copy-opacity",
        //             "-composite",
        //             "sparse-color:-",
        //             // The script then pipes to another convert command...
        //             pipeFile
                
        //         ];

        //         im.convert(args, function(err, stdout) {
        //             if (err) {console.log(err); return};

        //             res.send(`render/${path.basename(outFileName)}`)

        //         })


        //     });