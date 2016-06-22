var express = require("express");
var app = express();
var url = require("url");

function retError() {
    return JSON.stringify(
        {
            "error": "Wrong URL format, should be like 'http://www.example.com'."
        });
}

app.get("/new/*",
    function(req, res) {
        var orig_url = url.parse(req.params[0], false, true);
        
        console.log(orig_url);
        
        if (!orig_url.protocol || !orig_url.host) {
            res.end(retError());
            return;
        }
        
        var ret = {
            "original_url": orig_url.protocol + "//" + orig_url.host + "/",
            "short_url": null
        };
        
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(ret));
    });

var port = process.env.PORT || 8080;
app.listen(port,
    function() {
        console.log("Node.js listening on port " + port + "...");
    });