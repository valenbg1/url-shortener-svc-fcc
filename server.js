var express = require("express");
var app = express();
var url = require("url");
var db = require("./db.js");

function retError(err) {
    switch (err) {
        case "wrong_format":
            return JSON.stringify({
                error: "Wrong URL format, should be like 'http://www.example.com'."
            });
            
        case "not_in_db":
            return JSON.stringify({
                error: "This URL is not in the database."
            });
            
        case "wrong_short_url":
            return JSON.stringify({
                error: "Wrong short URL format, should be a number."
            });
    }
}

app.get("/new/*",
    function(req, res) {
        res.writeHead(200, {"Content-Type": "application/json"});
        
        var orig_url = url.parse(req.params[0], false, true);
        
        if (!orig_url.protocol || !orig_url.host) {
            res.end(retError("wrong_format"));
            return;
        }
        
        new db.ShortenedURLdoc({
            original_url: orig_url.protocol + "//" + orig_url.host + "/",
        }).findOrInsert(
            function(err, shortenedURLdoc) {
                if (err) {
                    console.error(err);
                    res.end();
                } else {
                    res.end(JSON.stringify({
                        original_url: shortenedURLdoc.original_url,
                        short_url: shortenedURLdoc._id
                    }));
                }
            });
    });

app.get("/*",
    function(req, res) {
        res.writeHead(200, {"Content-Type": "application/json"});
        
        var short_url = req.params[0];
        
        if (isNaN(short_url)) {
            res.end(retError("wrong_short_url"));
            return;
        }
        
        db.ShortenedURLdoc.findOne({_id: +short_url},
            function(err, shortenedURLdoc) {
                if (err || !shortenedURLdoc)
                    res.end(retError("not_in_db"));
                else {
                    res.end(JSON.stringify({
                        original_url: shortenedURLdoc.original_url,
                        short_url: shortenedURLdoc._id
                    }));
                }
            });
    });
    
db.connection.once("open", function() {
    var port = process.env.PORT || 8080;
    app.listen(port,
        function() {
            console.log("Node.js listening on port " + port + "...");
        }); 
});