var mongoose = require("mongoose");

// connect to database at europaDB
// Or, use ours mongodb://europa:europa@ds133331.mlab.com:33331/europa
var dbURI = "mongodb://demo:demo@ds045694.mlab.com:45694/legacy";

mongoose.connect(dbURI);

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Mongodb connection open");
});

module.exports = db;
