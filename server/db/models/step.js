var db = require('../db-config.js');
var mongoose = require('mongoose');

var Step = mongoose.model('Step', { 
	name: {
		type: String,
		required: [true, 'Step needs a name field']
	},
	dueDate: {
		type: Date
	},
	dateCreated: {
		type: Date,
		default: Date.now
	},
	comments: [String]
});

module.exports = Step;