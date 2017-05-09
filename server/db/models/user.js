var db = require('../db-config.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Job = require('./job.js');
var Task = require('./task.js');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
	username: {
		type: String,
	},
	profilePic: {
		type: String,
		default: 'http://25.media.tumblr.com/tumblr_mc8ujbmGuk1rndl7do1_1280.png'
	},
	email: {
		type: String,
		default: 'Please update the email...'
	},
	city: {
		type: String,
	 	default: 'New York City'
	},
	state: {
		type: String,
	 	default: 'NY'
	},
	tasks: [Task.schema],
	jobs: [Job.schema]
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', UserSchema);

module.exports = User;
