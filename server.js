var express = require("express");
var app = express();
var url = require("url");
var db = require("./db.js");

function retError() {
    return JSON.stringify({
        error: "Wrong URL format, should be like 'http://www.example.com'."
    });
}

app.get("/new/*",
    function(req, res) {
        var orig_url = url.parse(req.params[0], false, true);
        
        if (!orig_url.protocol || !orig_url.host) {
            res.end(retError());
            return;
        }
        
        new db.ShortenedURLdoc({
            original_url: orig_url.protocol + "//" + orig_url.host + "/",
        }).save(
            function(err, shortenedURLdoc) {
                if (err) {
                    console.error(err);
                    res.end();
                } else {
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({
                        original_url: shortenedURLdoc.original_url,
                        short_url: shortenedURLdoc._id
                    }));
                }
            });
    });

  
var port = process.env.PORT || 8080;
app.listen(port,
    function() {
        console.log("Node.js listening on port " + port + "...");
    });