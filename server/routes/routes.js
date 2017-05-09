var db = require('../db/db-config.js');
var mongoose = require('mongoose');
var passport = require('passport');

// import mongoose models
var User = require('../db/models/user.js');
var Task = require('../db/models/task.js');
var Step = require('../db/models/step.js');
var Contact = require('../db/models/contact.js');
var Job = require('../db/models/job.js');

const rp = require('request-promise');
const config = require('../config/config.js');

module.exports = function(app, express) {

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                    Users
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.get('/api/users', function(req, res) {
		console.log('session info get /api/users', req.session.passport.user);
		var username = req.session.passport.user;

		User.find({ username: username }).exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve user', username);
				res.status(400).send('null');
			} else {
				console.log('successful retrieve user', username, user);
				res.send(user[0]);
			}
		});
	});

	// in body: User object
	app.patch('/api/users', function(req, res) {
		var username = req.session.passport.user;
		var body = req.body;

		User.update({ _id: body._id }, body).exec(function(err, user){
			console.log('updating', err, user, 'with', username, body);
			if(err) {
				console.log('unsuccessful update user', username, body);
				res.status(400).send('unsuccessful update');
			} else {
				console.log('successful update user', username, user);
				res.send('successful update');
			}
		});
	});

	app.delete('/api/users', function(req, res) {
		var username = req.session.passport.user;

		User.remove({ username: username }).exec(function(err, user){
			if(err) {
				console.log('unsuccessful remove user', username);
				res.status(400).send('unsuccessful remove');
			} else {
				console.log('successful remove user', username);
				res.send('successful remove');
			}
		});
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                    Jobs
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.get('/api/jobs', function(req, res) {
		console.log('session info get /api/jobs', req.session.passport.user);
		var username = req.session.passport.user;

		User.find({ username: username }).exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve jobs', username);
				res.status(400).send('null');
			} else {
				console.log('successful retrieve jobs', username, user[0].jobs);
				res.send(user[0].jobs);
			}
		});
	});

	// body (companyname, position)
	app.post('/api/jobs', function(req, res) {
		console.log('session info post /api/jobs', req.session.passport.user);
		console.log('attempting to create job', req.body);

		var username = req.session.passport.user;

		User.findOneAndUpdate(
	        { username: username },
	        {$push: {"jobs": req.body}},
	        {safe: true, upsert: true, new : true},
	        function(err, model) {
	        	if(err) {
	        		res.status(401).send(err);
	        	} else {
	        		res.send('New job created');
	        	}
	        }
	    );
	});

	// body (_id)  _id is found inside specific job, and any fields to be updated
	// job array can be retrieved using get /api/jobs
	app.patch('/api/jobs', function(req, res) {
		console.log('session info patch /api/jobs', req.session.passport.user);
		console.log('attempting to patch job', req.body);

		var username = req.session.passport.user;

		User.find({ username: username }).lean().exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve jobs', username);
				res.status(400).send('null');
			} else {
				user[0].jobs.forEach((job) => {
					if(job._id == req.body._id) {
						for(var key in req.body) {
							job[key] = req.body[key];
						}
					}
				});

				User.findOneAndUpdate(
			        { username: username },
			        { $set: user[0] },
			        { new: true },
			        function(err, model) {
			        	if(err) {
			        		res.status(401).send(err);
			        	} else {
			        		res.send('Job updated');
			        	}
			        }
			    );
			}
		});
	});

	// body (_id)  _id is found inside specific job
	// job array can be retrieved using get /api/jobs
	app.delete('/api/jobs', function(req, res) {
		console.log('session info delete /api/jobs', req.session.passport.user);
		console.log('attempting to delete job', req.body);

		var username = req.session.passport.user;

		User.find({ username: username }).lean().exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve jobs', username);
				res.status(400).send('null');
			} else {
				user[0].jobs = user[0].jobs.filter((job) => {
					return job._id != req.body._id;
				});

				User.findOneAndUpdate(
			        { username: username },
			        { $set: user[0] },
			        { new: true },
			        function(err, model) {
			        	if(err) {
			        		res.status(401).send(err);
			        	} else {
			        		res.send('Job removed');
			        	}
			        }
			    );
			}
		});
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                    Tasks
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.get('/api/tasks', function(req, res) {
		console.log('session info get /api/tasks', req.session.passport.user);
		var username = req.session.passport.user;

		User.find({ username: username }).exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve tasks', username);
				res.status(400).send('null');
			} else {
				console.log('successful retrieve tasks', username, user[0].tasks);
				res.send(user[0].tasks);
			}
		});
	});

	// body (name)
	app.post('/api/tasks', function(req, res) {
		console.log('session info post /api/tasks', req.session.passport.user);
		console.log('attempting to create tasks', req.body);

		var username = req.session.passport.user;

		User.findOneAndUpdate(
	        { username: username },
	        {$push: {"tasks": req.body}},
	        {safe: true, upsert: true, new: true},
	        function(err, model) {
	        	if(err) {
	        		res.status(401).send(err);
	        	} else {
	        		res.send('New tasks created');
	        	}
	        }
	    );
	});

	// body (_id)  _id is found inside specific tasks and the name
	// tasks array can be retrieved using get /api/tasks
	app.patch('/api/tasks', function(req, res) {

		console.log('session info patch /api/tasks', req.session.passport.user);
		console.log('attempting to patch tasks', req.body);

		var username = req.session.passport.user;

		User.find({ username: username }).lean().exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve tasks', username);
				res.status(400).send('null');
			} else {
				user[0].tasks.forEach((task) => {
					if(task._id == req.body._id) {
						for(var key in req.body) {
							task[key] = req.body[key];
						}
					}
				});

				User.findOneAndUpdate(
			        { username: username },
			        { $set: user[0] },
			        { new: true },
			        function(err, model) {
			        	if(err) {
			        		res.status(401).send(err);
			        	} else {
			        		res.send('Job updated');
			        	}
			        }
			    );
			}
		});
	});

	// body (_id)  _id is found inside specific tasks
	// tasks array can be retrieved using get /api/tasks
	app.delete('/api/tasks', function(req, res) {
		console.log('REQ.BODY: ', req.body);
		console.log('session info delete /api/tasks', req.session.passport.user);
		console.log('attempting to delete tasks', req.body);

		var username = req.session.passport.user;

		User.find({ username: username }).lean().exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve tasks', username);
				res.status(400).send('null');
			} else {
				user[0].tasks = user[0].tasks.filter((task) => {
					return task._id != req.body._id;
				});

				User.findOneAndUpdate(
			        { username: username },
			        { $set: user[0] },
			        { new: true },
			        function(err, model) {
			        	if(err) {
			        		res.status(401).send(err);
			        	} else {
			        		res.send('Task removed');
			        	}
			        }
			    );
			}
		});
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                     User Companies
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.get('/api/companies', function(req, res) {
		console.log('session info get /api/jobs', req.session.passport.user);
		var username = req.session.passport.user;

		User.find({ username: username }).exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve jobs', username);
				res.status(400).send('null');
			} else {
				console.log('successful retrieve jobs', username, user[0].jobs);

				var companies = user[0].jobs.map(obj => obj.company);

				res.send(companies.filter((val, index) => companies.indexOf(val) === index));
			}
		});
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                User Due Dates For Tasks
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.get('/api/dates', function(req, res) {
		console.log('session info get /api/dates', req.session.passport.user);
		var username = req.session.passport.user;

		User.find({ username: username }).exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve user', username);
				res.status(400).send('null');
			} else {
				console.log('successful retrieve user', username);
				var userSteps = [];
				user[0].jobs.forEach(job => {
					userSteps = userSteps.concat(job.currentStep);
					userSteps = userSteps.concat(job.nextStep);
				});

        userSteps = userSteps.filter(step => !!step);

				var dates = userSteps.filter(step => !!step.dueDate);

				res.send(dates);
			}
		});
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                        News
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//query params : ?company=example
	app.get('/api/news', function(req, res) {

		let companyName = req.query.company;

		let options = {
			uri: "https://api.cognitive.microsoft.com/bing/v5.0/news/search?",
			qs: {
				q: companyName,
				count: 10,
				offset: 0,
				mkt: 'en-us',
				safeSearch: 'Moderate'
			},
			headers: {
				'Ocp-Apim-Subscription-Key': config.apiKeys.bingSearch
			},
			json: true
		};
		rp(options)
		.then(function(stories) {
			res.status(200).send(stories);
		})
		.catch(function(err) {
			console.log('API call failed!');
		});
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                  Company Information
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//query params : ?domain=example.com
	app.get('/api/companyInfo', function(req, res) {

		let companyName = req.query.domain;

		let options = {
			uri: "https://api.fullcontact.com/v2/company/lookup.json?",
			qs: {
				domain: companyName
			},
			headers: {
				'X-FullContact-APIKey' : config.apiKeys.fullContact
			}
		};
		rp(options)
		.then(function(response) {
			res.status(200).send(response);
		})
		.catch(function(err) {
			res.status(400).send('Something\s wrong, please try again!')
		})
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                    Authentication
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	//in req.body: (username: password: )
	app.post('/api/register', function(req, res) {
		console.log('attempting to register', req.body.username, req.body.password);

	  User.register(new User({
			username: req.body.username,
			email: req.body.email,
			city: req.body.city,
			state: req.body.state,
			profilePic: req.body.profilePic
		 }),
	    req.body.password, function(err, account) {
	    if (err) {
	      return res.status(500).json({
	        err: err
	      });
	    }
	    passport.authenticate('local')(req, res, function () {
	      return res.status(200).json({
	        status: 'Registration successful!'
	      });
	    });
	  });
	});

	//in req.body: (username: password: )
	app.post('/api/login', function(req, res, next) {
	  passport.authenticate('local', function(err, user, info) {
	    if (err) {
	      return next(err);
	    }
	    if (!user) {
	      return res.status(401).json({
	        err: info
	      });
	    }
	    req.logIn(user, function(err) {
	      if (err) {
	        return res.status(500).json({
	          err: 'Could not log in user'
	        });
	      }
	      res.status(200).json({
	        status: 'Login successful!'
	      });
	    });
	  })(req, res, next);
	});

	// get /api/logout, respond {status: "Bye"}
	app.get('/api/logout', function(req, res) {
	  req.logout();
	  res.status(200).json({
	    status: 'Bye!'
	  });
	});

	// get /api/status respond {status: true/false}
	app.get('/api/status', function(req, res) {
	  if (!req.isAuthenticated()) {
	    return res.status(200).json({
	      status: false
	    });
	  }
	  res.status(200).json({
	    status: true
	  });
	});
};
