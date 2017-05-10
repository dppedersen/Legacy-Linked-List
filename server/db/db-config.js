var mongoose = require('mongoose');

// connect to database at europaDB
// Or, use ours mongodb://europa:europa@ds133331.mlab.com:33331/europa
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
var dbURI = 'mongodb://demo:demo@ds045694.mlab.com:45694/legacy';
=======
<<<<<<< HEAD
var dbURI = 'mongodb://europa:europa@ds133331.mlab.com:33331/europa';
=======
var dbURI = 'mongodb://demo:demo@ds045694.mlab.com:45694/legacy';
>>>>>>> Begin Implementing savedJobs Widget
>>>>>>> Begin Implementing savedJobs Widget
=======
var dbURI = 'mongodb://europa:europa@ds133331.mlab.com:33331/europa';

>>>>>>> Align With Base
=======

var dbURI = 'mongodb://europa:europa@ds161487.mlab.com:61487/legacy_ganymede';

>>>>>>> Begin Styling Saved Jobs
mongoose.connect(dbURI);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Mongodb connection open');
});

module.exports = db;
