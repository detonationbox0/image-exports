const express = require('express');
const app = express();
var im = require('imagemagick');

app.set('view engine', 'ejs');

app.use(express.static("public"))
app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.post("/render", (req, res) => {

    var imagePath = `${__dirname}/public/${req.body.image}`;
    var outPath = `${__dirname}/public/output.png`

    // console.log(`${__dirname}/public/${imagePath}`);

    // Knockout White:
    // convert input.gif -transparent white output.gif 
    var args = [imagePath, "-transparent", "white", outPath];
    console.log(args)
    im.convert(args, function(err, stdout) {
        console.log("Converted.");
        res.send("Connection done.")
    })
//   im.identify(`${__dirname}/public/${imagePath}`, function(err, features){
//     if (err) throw err;
//     console.log(features);
//     res.send("Connection done.")
//     // { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
//   });


});



// const userRouter = require('./routes/users');

// app.use("/users", userRouter);


app.listen(3000);
