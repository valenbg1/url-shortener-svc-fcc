var express = require("express");
var app = express();
var url = require("url");
var db = require("./db.js");
var hostname_url = process.env.HOSTNAME_URI;

function endJSON(json, res) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(json));
}

function endError(err, res) {
    var ret = {error: "Error."};
    
    switch (err) {
        case "wrong_format":
            ret.error = "Wrong URL format, should be like 'http://www.example.com'.";
            break;
            
        case "not_in_db":
            ret.error = "This URL is not in the database.";
            break;
            
        case "wrong_short_url":
            ret.error = "Wrong short URL format, should be a number.";
            break;
    }
    
    endJSON(ret, res);
}

function endShortenedURLdoc(shortenedURLdoc, res) {
    endJSON({
        original_url: shortenedURLdoc.original_url,
        short_url: hostname_url + "/" + shortenedURLdoc._id
    }, res);
}

function printErrorAndEnd(err, res) {
    console.error(err);
    res.end();
}

app.get("/new/*",
    function(req, res) {
        var orig_url = url.parse(req.params[0], false, true);
        
        if (!orig_url.protocol || !orig_url.host) {
            endError("wrong_format", res);
            return;
        }
        
        new db.ShortenedURLdoc({
            original_url: orig_url.protocol + "//" + orig_url.host + "/",
        }).findOrInsert(
            function(err, shortenedURLdoc) {
                if (err)
                    printErrorAndEnd(err, res);
                else
                    endShortenedURLdoc(shortenedURLdoc, res);
            });
    });

app.use("/", express.static("public"));

app.get("/*",
    function(req, res) {
        var short_url = req.params[0];
        
        if (isNaN(short_url)) {
            endError("wrong_short_url", res);
            return;
        }
        
        db.ShortenedURLdoc.findOne({_id: +short_url},
            function(err, shortenedURLdoc) {
                if (err)
                    printErrorAndEnd(err, res);
                else if (!shortenedURLdoc)
                    endError("not_in_db", res);
                else
                    res.redirect(shortenedURLdoc.original_url);
            });
    });
    
db.connection.once("open", function() {
    var port = process.env.PORT || 8080;
    app.listen(port,
        function() {
            console.log("Node.js listening on port " + port + "...");
        }); 
});