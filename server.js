const express = require('express');
const app = express();

var im = require('imagemagick');

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
 */
app.post("/render", (req, res) => {
//#region

    var imagePath = `${__dirname}/public/${req.body.image}`; // image from Konva in the front end
    var fileName = req.body.image.split('.').slice(0, -1).join('.');
    var outFileName = `${fileName}_output.png`;
    console.log(outFileName);
    var outPath = `${__dirname}/public/${outFileName}`




    // console.log(`${__dirname}/public/${imagePath}`);
    console.log(req.body.effect);

    switch(req.body.effect) {
        case "knockout":
            // var args = [imagePath, "-transparent", "white", outPath];
            // convert rooster.jpg -fuzz 5% -bordercolor white -border 1 -fill none -draw "alpha 0,0 floodfill" -shave 1x1 output.png
            // var args = [imagePath, "-fuzz", "5%", "-bordercolor", "white", "-border", "1", "-fill", "none", , "-shave", "1x1", outPath];
            var args = [imagePath, "-fuzz", "5%", "-bordercolor", "white", "-border", "1", "-fill", "none", "-draw", 'alpha 0,0 floodfill', "-shave", "1x1", outPath];
            console.log("Running Imagemagick with the following arguments:");
            console.log(args);
            im.convert(args, function(err, stdout) {

                if (err) { // Handle error
                    console.log(err);
                    return;
                }

                console.log(`Converted. Feeding back: ${outFileName}`);
                res.send(outFileName);
            });

            break;

        case "paint":

            var args = [imagePath, "-paint", "8", outPath];
            console.log("Running Imagemagick with the following arguments:");
            console.log(args);
            im.convert(args, function(err, stdout) {

                if (err) { // Handle error
                    console.log(err);
                    return;
                }

                console.log("Converted.");
                res.send(outFileName);
            });

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
