var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var mongodb_url = "mongodb://localhost/url-shortener";

var connection = mongoose.createConnection(mongodb_url);
autoIncrement.initialize(connection);

connection.on("error",
    function(err) {
        throw new Error("Cannot open MongoDB database: " + err);
    });

connection.once("open",
    function() {
        console.log("Connected to MongoDB on '" + mongodb_url + "'");
            
        var shortenedURLschema = mongoose.Schema({
            original_url: {
                type: String,
                required: true,
                unique: true
            }
        }, {
            versionKey: false
        });
        shortenedURLschema.plugin(autoIncrement.plugin, "ShortenedURLs");
        shortenedURLschema.methods.upsert = upsert;

        exports.ShortenedURLdoc = connection.model("ShortenedURLs", shortenedURLschema);
    });
    
function upsert(callback) {
    var shortenedURLdoc = this;
    var ShortenedURLdoc = exports.ShortenedURLdoc;
    
    ShortenedURLdoc.findOne({original_url: shortenedURLdoc.original_url},
        function(err, doc) {
            if (err)
                callback(err, null);
            else if (doc)
                callback(null, doc);
            else
                shortenedURLdoc.save(callback);
        });
}