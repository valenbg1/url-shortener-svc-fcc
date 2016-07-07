var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var mongodb_url = process.env.MONGOLAB_URI;

var connection = mongoose.createConnection(mongodb_url);
exports.connection = connection;
autoIncrement.initialize(connection);

connection.on("error",
    function(err) {
        throw new Error("Cannot open MongoDB database: " + err);
    });

connection.once("open",
    function() {
        //console.log("Connected to MongoDB on '" + mongodb_url + "'");
            
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
        shortenedURLschema.methods.findOrInsert = findOrInsert;

        exports.ShortenedURLdoc = connection.model("ShortenedURLs", shortenedURLschema);
    });
    
function findOrInsert(callback) {
    var shortenedURLdoc = this;
    var ShortenedURLdoc = exports.ShortenedURLdoc;
    
    ShortenedURLdoc.findOne({original_url: shortenedURLdoc.original_url},
        function(err, doc) {
            if (err || doc)
                callback(err, doc);
            else
                shortenedURLdoc.save(callback);
        });
}