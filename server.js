const express = require('express');
const app = express();

var im = require('imagemagick');
// var getColors = require('get-image-colors');

app.set('view engine', 'ejs');

app.use(express.static("public"))
app.use(express.urlencoded({extended: true}));

app.use(express.json());



app.post("/render", (req, res) => {

    var imagePath = `${__dirname}/public/${req.body.image}`;
    var outPath = `${__dirname}/public/output.png`

    // console.log(`${__dirname}/public/${imagePath}`);
    console.log(req.body.effect);
    switch(req.body.effect) {
        case "knockout":
            var args = [imagePath, "-transparent", "white", outPath];
            im.convert(args, function(err, stdout) {
                console.log("Converted.");
                res.send("Connection done.");
            });
            break;
        case "outline":
            var args = [imagePath, "-canny", "0x3+5%+15%", outPath];
            im.convert(args, function(err, stdout) {
                console.log("Converted.");
                res.send("Connection done.");
            });
            break;
    }


    
    // console.log(args)


    // Knockout White:
    // convert input.gif -transparent white output.gif 


});



// const userRouter = require('./routes/users');

// app.use("/users", userRouter);


app.listen(3000);
