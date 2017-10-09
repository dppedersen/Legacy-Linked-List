var db = require('../db-config.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Job = require('./job.js');
var Task = require('./task.js');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = mongoose.Schema({
		local: {
			username: {
				type: String
			},
			password: {
				type: String
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
			}
		},
    google: {
    	id: {
				type: String,
				default: ''
			},
    	token: {
				type: String,
				default: ''
			},
    	email: {
				type: String,
				default: ''
			},
    	name: {
				type: String,
				default: ''
			},
			profilePic: {
				type: String,
				default: ''
			}
    },
		tasks: [Task.schema],
		jobs: [Job.schema],
		savedJobs: [Job.schema]
});

UserSchema.methods.validPassword = function( password ) {
	return this.local.password === password ? true : false;
};

var User = mongoose.model('User', UserSchema);

module.exports = User;
