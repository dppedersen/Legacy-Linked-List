var db = require('../db-config.js');
var mongoose = require('mongoose');

var Contact = mongoose.model('Contact', { 
	name: {
		type: String,
		required: [true, 'need a content name field when creating a contact']
	},
	phoneNumber: {
		type: String,
		default: 'Please update the phoneNumber...'
	},
	email: {
		type: String,
		default: 'Please update the email...'
	}
});

module.exports = Contact;