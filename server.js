const express = require('express');
const app = express();

var im = require('imagemagick-composite');
var path = require('path');
var fs = require('fs');
var client = require('https')
var {spawn} = require('child_process');


// var exiftool = require('node-exiftool');
// const { Z_PARTIAL_FLUSH } = require('zlib');
// const { runMain } = require('module');
// app.set('view engine', 'ejs');

app.use(express.static("public"))
app.use(express.urlencoded({limit:"100mb", extended: true}));

app.use(express.json());

app.listen(3001, function() {
    console.log("Server is running on http://localhost:3001...")
});


// Download the shirt image used...
app.post("/download-image", async(req, res) => {

    var shirtFile = path.join(__dirname, "process", "Shirt.png") 

    client.get(req.body.imgFile, (clientRes) => {
        clientRes.pipe(fs.createWriteStream(shirtFile)) 
        res.send(true)
    });
})

// Make the canvas file...
app.post("/canvas-file", async (req, res) => {

    var imageBuffer = decodeBase64Image(req.body.dataURL);

    // Write the image buffer to a file
    var canvasFile = path.join(__dirname, "process", "CanvasOutput.png")

    fs.writeFile(canvasFile , imageBuffer.data, function(err) { 

        if (err) {
            console.log(err);
            reject(err)
        };

        res.send(true);

    });
    
});

// Execute Python
app.post("/python", async (req, res) => {

    // OS Friendly File Paths
    var canvasFile = path.join(__dirname, "process", "CanvasOutput.png") 
    var shirtFile = path.join(__dirname, "process", "Shirt.png")
    var outFile = path.join(__dirname, "public", "thumbs", "Proof.png")

        /** Python script accepts these arguments:
            shirtFile = sys.argv[1]  # Path to the thumbnail of the shirt from editor
            artFile = sys.argv[2]  # Path to the full-size output from the canvas
            outFile = sys.argv[3]  # Path to the final proof PNG thumbnail
            x = int(sys.argv[4])  # Number of pixels from the left of the shirt to position the art
            y = int(sys.argv[5])  # Number of pixels from the top of the shirt to position the art
            s = float(sys.argv[6])  # Scale of the image in relation to the shirt
            bgColor = sys.argv[7].split(",")  # RGB of shirt's color (ex: 255,255,255)
         */

        // Spawn will need the first argument to be the path to the Python file
        var pyFile = path.join(__dirname, "makeShirtProofs.py")
        var args = [
            pyFile,
            shirtFile,
            canvasFile,
            outFile,
            req.body.x,
            req.body.y,
            req.body.s,
            req.body.rgb 
        ]

        console.log("Executing python...")


        const python = spawn('python3', args);

        python.stderr.on('data', (data) => {
            // There was a problem with the Python script...
            console.log(data.toString());
            res.send(false);
        });

        python.on("close", () => {
            // All done. Return to sender
            console.log("Python is done. Returning to sender.")
            res.send(true)
        })

    })

    app.post("/make-print", async (req, res) => {

        var canvasFile = path.join(__dirname, "process", "CanvasOutput.png") 
        var trimFile = path.join(__dirname, "process", "TrimmedFile.png")

        var args = [
            canvasFile,
            "-trim",
            "-density", "300",
            "-units", "PixelsPerInch",
            "-define", "png:color-type=6",
            "-profile", `${path.join(__dirname, "sRGB2014.icc")}`,
            "+repage",
            trimFile
        ];
        console.log(`Trimming ${canvasFile}`)
        im.convert(args, function(err, stdout) {
            if (err) throw err;

            res.send(true)

            
        });
    })


/**
 *             // Trigger print file creation async process here.

 */

/**
 * Asynchronous function to generate the print files
 * @param {String} fullFile Full path to full sized file
 * @param {String} trimFile Full path to trimmed image output
 * @param {Buffer} imageBuffer Decoded Base 64 Image
 * @returns Promise
 */
async function myWriteFile(fullFile, imageBuffer) {
    return new Promise((resolve, reject) => {
        
    })
}

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
  


