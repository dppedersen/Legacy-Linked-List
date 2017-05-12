var db = require('../db/db-config.js');
var mongoose = require('mongoose');
var passport = require('passport');
var request = require('request');
var Twit = require('twit');

// import mongoose models
var User = require('../db/models/user.js');
var Task = require('../db/models/task.js');
var Step = require('../db/models/step.js');
var Contact = require('../db/models/contact.js');
var Job = require('../db/models/job.js');
var LocalStrategy = require('passport-local').Strategy;
const rp = require('request-promise');
const config = require('../config/config.js');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
module.exports = function(app, express) {

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                    Users
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.get('/api/users', function(req, res) {
		console.log('session info get /api/users', req.session.passport.user);
		var username = req.session.passport.user;
		User.find({ "local.username": username.local.username }).exec(function(err, user){
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

		User.remove({ "local.username": username.local.username }).exec(function(err, user){
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

		User.find({ "local.username": username.local.username }).exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve jobs', username);
				res.status(400).send('null');
			} else {
				var clientSecret = config.googleOAuth.clientSecret;
				var clientId = config.googleOAuth.clientID;
				var redirectUrl = config.googleOAuth.callbackURL;
				var auth = new googleAuth();
				var calendar = google.calendar('v3');
				var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
				oauth2Client.setCredentials({
  				access_token: username.google.token,
  				refresh_token: username.google.token,
  				expiry_date: true
				});

				username.jobs.forEach(job => {
					var event = {
						summary: job.officialName,
						description: job.currentStep.name,
						start: {
							dateTime: job.currentStep.dueDate,
							timeZone: 'America/New_York'
						},
						end: {
							dateTime: job.currentStep.dueDate,
							timeZone: 'America/New_York'
						},
						attendees: [
							{'email': username.google.email}
						]
					}
					calendar.events.insert({
						auth: oauth2Client,
						calendarId: username.google.email,
						resource: event,
					}, function(err, event) {
						if (err) {
							console.log('There was an error contacting the Calendar service: ' + err);
							return;
						}
						console.log('Event created: %s', event.htmlLink);
					});

				});
				console.log('successful retrieve jobs', username, user[0].jobs.currentStep);
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
	        { 'local.username': username.local.username },
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

		User.find({ 'local.username': username.local.username }).lean().exec(function(err, user){
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
			        { "local.username": username.local.username },
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

		User.find({ "local.username": username.local.username }).lean().exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve jobs', username);
				res.status(400).send('null');
			} else {
				user[0].jobs = user[0].jobs.filter((job) => {
					return job._id != req.body._id;
				});

				User.findOneAndUpdate(
			        { "local.username": username.local.username },
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
		//                    Saved Jobs
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.post('/api/savedJobs', function(req, res) {
		var username = req.session.passport.user;

		User.find({ username: username }).exec(function(err, user){
			if(user.length === 0) {
				res.status(400).send('null');
			} else {
				// console.log('user[0].jobs: ',user[0].jobs);
				// console.log('typeof req.body._id',typeof req.body._id);
				for (var i = 0; i < user[0].jobs.length; i++) {
					if (user[0].jobs[i]._id.toString() === req.body._id) {
						// console.log('ITS A MATCH', user[0].jobs[i]);
					}
				}

				var jobToSave = user[0].jobs.filter((job) => {
					return job._id.toString() === req.body._id;
				})[0];

				if (jobToSave !== null && jobToSave !== undefined) {
					jobToSave.interviewQuestions = req.body.question;
					user[0].savedJobs.push(jobToSave);
				}
				// console.log('jobtosave:',jobToSave);


				user[0].jobs = user[0].jobs.filter((job) => {
					return job._id.toString() !== req.body._id;
				});
				User.findOneAndUpdate(
					{ username: username },
	        { $set: user[0] },
	        { new: true },
	        function(err, model) {
	        	if(err) {
	        		res.status(401).send(err);
	        	} else {
	        		res.send('Job Saved and Removed');
	        	}
	        }
			  );
			}
		});
	});

	app.get('/api/savedJobs', function(req, res) {
		var username = req.session.passport.user;

		User.find({ username: username }).exec(function(err, user){
			if(user.length === 0) {
				// console.log('unsuccessful retrieve jobs', username);
				res.status(400).send('null');
			} else {
				// console.log('successful retrieve jobs', username, user[0].savedJobs);
				res.send(user[0].savedJobs);
			}
		});
	});

	app.delete('/api/savedJobs', function(req, res) {

		var username = req.session.passport.user;

		User.find({ username: username }).exec(function(err, user){
			if(user.length === 0) {
				res.status(400).send('null');
			} else {
				user[0].savedJobs = user[0].savedJobs.filter((savedJob) => {
					return savedJob._id != req.body._id;
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

		User.find({ "local.username": username.local.username }).exec(function(err, user){
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
	        { "local.username": username.local.username },
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

		User.find({ "local.username": username.local.username }).lean().exec(function(err, user){
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
			        { "local.username": username.local.username },
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

		User.find({ "local.username": username.local.username }).lean().exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve tasks', username);
				res.status(400).send('null');
			} else {
				user[0].tasks = user[0].tasks.filter((task) => {
					return task._id != req.body._id;
				});

				User.findOneAndUpdate(
			        { username: username.local.username },
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

		User.find({ "local.username": username.local.username }).exec(function(err, user){
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

		User.find({ "local.username": username.local.username }).exec(function(err, user){
			if(user.length === 0) {
				console.log('unsuccessful retrieve user', username);
				res.status(400).send('null');
			} else {
				console.log('successful retrieve user', username);
				googleToken = user[0].google.token;
				var userSteps = [];
				user[0].jobs.forEach(job => {
					userSteps = userSteps.concat(job.currentStep);
					userSteps = userSteps.concat(job.nextStep);
				});

        userSteps = userSteps.filter(step => !!step);

				var dates = userSteps.filter(step => !!step.dueDate);
				var options = {
					url: `https://www.googleapis.com/calendar/v3/calendars/${username.google.email}/events?maxResults=2500`,
					method: 'GET',
					headers: {
						'User-Agent': 'request',
						'clientID': config.googleOAuth.clientID,
						'clientSecret': config.googleOAuth.clientSecret,
						'scope': 'https://www.googleapis.com/auth/calendar',
						'Authorization': 'Bearer ' + googleToken,
					},
					json: true
				}

				request(options, (err, res, body) => {
					if(err) {
						console.log('Calendar Error:', err);
					} else {
						console.log('GoogleToken:', googleToken, 'User Token:', username.google.token);
<<<<<<< HEAD
						if(body.items){
							body.items.forEach(item => {
								if(item.created && item.created.slice(0, 4) === '2017') {
									newTask = new Task({
										name: item.summary,
										dueDate: item.end.dateTime,
										dateCreated: item.created
									});
									console.log('This is the New Task:', newTask);
									dates.push(newTask);
								}
							})
						}
					}
				})
				setTimeout(function() {
					res.send(dates);
				}, 750);
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
	//                    Twitter
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	var twitter = new Twit(config.twitter);

	app.post('/api/twitter', function(req, res) {
		console.error('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log('Req recieved');
		console.log(req.body);
		return Promise.all(req.body.map(handle => {
				return new Promise((resolve, reject) => {
					let params = {
						screen_name: handle,
						count: 5,
						exclude_replies: true
					};
					twitter.get('statuses/user_timeline', params, function(err, data, response) {
						if(err) {
							console.error('Failed twitter fetch');
							reject(err);
						}
						console.log('Successful Twitter retrieval by server.')
						console.log("Number of Tweets", data.length)
						resolve(data);
					});
				});
		}))
		.then(data => {
			console.log('Tweets Promise resolved')
			data = data.reduce((acc, item) => {
				return acc.concat(item)
			},[])
			console.log(data);
			res.status(200).send(JSON.stringify(data));
		})
		.catch(err => {
			console.error('Promise Failed')
			console.error(err)
		});



	})


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
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] }));

			 // the callback after google has authorized the user
	app.get('/auth/google/callback', passport.authenticate('google', { successRedirect : '/#/dashboard', failureRedirect : '/'}));
	app.post('/api/register', function(req, res) {
		console.log('attempting to register', req.body.username, req.body.password);
	  var newUser = new User({
			'local.username': req.body.username,
			'local.password': req.body.password
		});
			newUser.save(err => {
				if(err) {
					console.log('Save Error:', err);
				} else {
					console.log('User Successfully Saved!', newUser);
				}
			});
	    passport.authenticate('local')(req, res, function () {
	      return res.status(200).json({
	        status: 'Registration successful!'
	      });
	    });

	});

	//in req.body: (username: password: )
	app.post('/api/login', function(req, res, next) {
	  passport.authenticate('local', function(err, user, info) {
			console.log('Login Post:', user);
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
