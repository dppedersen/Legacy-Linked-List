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

		if(username.google.id !== '') {
			User.findOne({ "google.id": username.google.id }).exec(function(err, user){
				if(err) {
					console.log('Error Finding User (Routes:30):', err);
					res.status(400).send('null');
				} else {
					console.log('User Found!', user);
					res.send(user);
				}
			});
		} else {
			User.findOne({ "local.username": username.local.username }).exec(function(err, user){
				if(err) {
					console.log('Error Finding User (Routes:40):', err);
					res.status(400).send('null');
				} else {
					console.log('User Found!', user);
					res.send(user);
				}
			});
		}
	});

	// in body: User object
	app.patch('/api/users', function(req, res) {
		var username = req.session.passport.user;
		var body = req.body;

		if(username.google.id !== '') {
			User.update({ "_id": body._id }).exec((err, user) => {
				console.log(`Updating ${user} with: ${body}`);
				if(err) {
					console.log('Error Updating User (Routes:59)', err);
					res.status(400).send('There was an error updating your account.');
				} else {
					console.log('Account Successfully Updated!');
					res.send('Your Account has been Updated!');
				}
			});
		} else {
			User.update({ _id: body._id }, body).exec((err, user) => {
				console.log(`Updating ${user} with: ${body}`);
				if(err) {
					console.log('Error Updating User (Routes:59)', err);
					res.status(400).send('There was an error updating your account.');
				} else {
					console.log('Account Successfully Updated!');
					res.send('Your Account has been Updated!');
				}
			});
		}
	});

	app.delete('/api/users', function(req, res) {
		var username = req.session.passport.user;

		if(username.google.id !== '') {
			User.remove({ "google.username": username.google.username }).exec((err, user) => {
				if(err) {
					console.log('Error Deleting User (Routes:72):', err);
					res.status(400).send('There was an error deleting your account.');
				} else {
					console.log('Account Successfully Deleted!');
					res.send('Your Account has been Deleted!');
				}
			});
		} else {
			User.remove({ "local.username": username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Deleting User (Routes:72):', err);
					res.status(400).send('There was an error deleting your account.');
				} else {
					console.log('Account Successfully Deleted!');
					res.send('Your Account has been Deleted!');
				}
			});
		}
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                    Jobs
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.get('/api/jobs', function(req, res) {
		console.log('session info get /api/jobs', req.session.passport.user);
		var username = req.session.passport.user;

		if(username.google.id !== '') {
			User.findOne({ "google.id": username.google.id }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Jobs (Routes:92):', err);
					res.status(400).send('null');
				} else {
					console.log('Successfully Retrieved Jobs!');
					res.send(user.jobs);
				}
			})
		} else {
			User.findOne({ "local.username": username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Jobs (Routes:102):', err);
				} else {
					console.log('Successfully Retrieved Jobs!');
					res.send(user.jobs);
				}
			})
		}
	});

	// body (companyname, position)
	app.post('/api/jobs', function(req, res) {
		console.log('session info post /api/jobs', req.session.passport.user);
		console.log('attempting to create job', req.body);
		var username = req.session.passport.user;

		if(username.google.id !== '') {
			User.findOneAndUpdate({ 'google.id': username.google.id }, { $push: {"jobs": req.body }}, { safe: true, upsert: true, new : true },
	      (err, model) => {
	      	if(err) {
						console.log('Jobs POST Error (Routes:98):', err);
	      		res.status(401).send(err);
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
								}, (err, event) => {
									if (err) {
										console.log('There was an error contacting the Calendar service. (Routes:136):', err);
										return;
									}
									console.log('Event created: %s', event.htmlLink);
								});
							});
						}
						res.send('New job created');
	      	});
	      } else {
					User.findOneAndUpdate({ 'local.username': username.local.username }, { $push: {"jobs": req.body }}, { safe: true, upsert: true, new : true },
			    (err, model) => {
			      if(err) {
			      	res.status(401).send(err);
		      	} else {
							res.send('New job created');
		      	}
			 	});
			}
		});

	// body (_id)  _id is found inside specific job, and any fields to be updated
	// job array can be retrieved using get /api/jobs
	app.patch('/api/jobs', function(req, res) {
		console.log('session info patch /api/jobs', req.session.passport.user);
		console.log('attempting to patch job', req.body);

		var username = req.session.passport.user;
		if(username.google.id !== '') {
			User.findOne({ 'google.id': username.google.id }).exec((err, user) => {
				if(err) {
					console.log('Error Patching Jobs (Routes:216):', err);
					res.status(400).send('null');
				} else {
					user.jobs.forEach(job => {
						if(job._id == req.body._id) {
							for(let key in req.body) {
								job[key] = req.body[key];
							}
						}
					});
					User.findOneAndUpdate(
				  { "google.id": username.google.id },
				  { $set: user },
				  { new: true },
				  (err, model) => {
				  	if(err) {
							console.log('Error Updating Jobs (Routes:232):', err);
				    	res.status(401).send(err);
				    } else {
				    	res.send('Job Updated!');
				    }
				  }
					);
				}
			})
		} else {
			User.findOne({ 'local.username': username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Patching Jobs (Routes:231):', err);
					res.status(400).send('null');
				} else {
					user.jobs.forEach(job => {
						if(job._id == req.body._id) {
							for(var key in req.body) {
								job[key] = req.body[key];
							}
						}
					});
					User.findOneAndUpdate(
				  { "local.username": username.local.username },
				  { $set: user },
				  { new: true },
				  (err, model) => {
				  	if(err) {
							console.log('Error Updating Jobs (Routes:259):', err);
				    	res.status(401).send(err);
				    } else {
				    	res.send('Job Updated!');
				    }
				  }
					);
				}
			})
		}
	});

	// body (_id)  _id is found inside specific job
	// job array can be retrieved using get /api/jobs
	app.delete('/api/jobs', function(req, res) {
		console.log('session info delete /api/jobs', req.session.passport.user);
		console.log('attempting to delete job', req.body);

		var username = req.session.passport.user;

		if(username.google.id !== '') {
			User.findOne({ 'google.id': username.google.id }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Jobs (Routes:283):', err);
					res.status(400).send('null');
				} else {
					user.jobs = user.jobs.filter((job) => {
						return job._id != req.body._id;
					});

					User.findOneAndUpdate(
	        { "google.id": username.google.id },
	        { $set: user },
	        { new: true },
			    (err, model) => {
	        	if(err) {
							console.log('Error Deleting Jobs (Routes:296):', err);
	        		res.status(401).send(err);
	        	} else {
	        		res.send('Job Successfully Deleted!');
	        	}
			    }
			    );
				}
			})
		} else {
			User.findOne({ 'local.username': username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Jobs (Routes:308):', err);
					res.status(400).send('null');
				} else {
					user.jobs = user.jobs.filter((job) => {
						return job._id != req.body._id;
					});

					User.findOneAndUpdate(
	        { "local.username": username.local.username },
	        { $set: user },
	        { new: true },
			    (err, model) => {
	        	if(err) {
							console.log('Error Deleting Jobs (Routes:321):', err);
	        		res.status(401).send(err);
	        	} else {
	        		res.send('Job Successfully Deleted!');
	        	}
			    }
			    );
				}
			})
		}
	});


		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		//                    Saved Jobs
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.post('/api/savedJobs', function(req, res) {
		var username = req.session.passport.user;

		if(username.google.id !== '') {
			User.findOne({ "google.name": username.google.name }).exec((err, user) => {
				if(err) {
					console.log('Error Saving Jobs (Routes:344):', err);
					res.status(400).send('null');
				} else {
					var jobToSave = user.jobs.filter((job) => {
						return job._id.toString() === req.body._id;
					})[0];

					if (jobToSave !== null && jobToSave !== undefined) {
						jobToSave.interviewQuestions = req.body.question;
						user.savedJobs.push(jobToSave);
					}

					user.jobs = user.jobs.filter((job) => {
						return job._id.toString() !== req.body._id;
					});

					User.findOneAndUpdate(
						{ "google.name": username.google.name },
		        { $set: user },
		        { new: true },
		        (err, model) => {
		        	if(err) {
								console.log('Error Saving Job (Routes:366):', err);
		        		res.status(401).send(err);
		        	} else {
		        		res.send('Job Successfully Saved and Removed!');
		        	}
		        }
				  );
				}
			});
		} else {
			User.findOne({ "local.username": username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Saving Jobs (Routes:344):', err);
					res.status(400).send('null');
				} else {
					var jobToSave = user.jobs.filter((job) => {
						return job._id.toString() === req.body._id;
					})[0];

					if (jobToSave !== null && jobToSave !== undefined) {
						jobToSave.interviewQuestions = req.body.question;
						user.savedJobs.push(jobToSave);
					}

					user.jobs = user.jobs.filter((job) => {
						return job._id.toString() !== req.body._id;
					});

					User.findOneAndUpdate(
						{ "local.name": username.local.username },
		        { $set: user },
		        { new: true },
		        (err, model) => {
		        	if(err) {
								console.log('Error Saving Job (Routes:366):', err);
		        		res.status(401).send(err);
		        	} else {
		        		res.send('Job Successfully Saved and Removed!');
		        	}
		        }
				  );
				}
			});
		}
	});

	app.get('/api/savedJobs', function(req, res) {
		var username = req.session.passport.user;
		if(username.google.id !== '') {
			User.findOne({ "google.name": username.google.name }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Saved Jobs (Routes:417):', err);
					res.status(400).send('null');
				} else {
					console.log('Successfully Retrieved Jobs!');
					res.send(user.savedJobs);
				}
			})
		} else {
			User.findOne({ "local.username": username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Saved Jobs (Routes:417):', err);
					res.status(400).send('null');
				} else {
					console.log('Successfully Retrieved Jobs!');
					res.send(user.savedJobs);
				}
			})
		}
	});

	app.delete('/api/savedJobs', function(req, res) {

		var username = req.session.passport.user;
		if(username.google.id !== '') {
			User.findOne({ "google.id": username.google.id }).exec((err, user) => {
				if(err) {
					console.log('Error Deleting Saved Job (Routes:443):', err);
					res.status(400).send('null');
				} else {
					user.savedJobs = user.savedJobs.filter(savedJob => {
						return savedJob._id != req.body._id;
					});

					User.findOneAndUpdate(
						{ "google.name": username.google.name },
						{ $set: user },
						{ new: true },
						(err, model) => {
							if(err) {
								console.log('Error Deleting Saved Job (Routes:456):', err);
								res.status(401).send(err);
							} else {
								res.send('Job Deleted!');
							}
						}
					);
				}
			})
		} else {
			User.findOne({ "local.username": username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Deleting Saved Job (Routes:468):', err);
					res.status(400).send('null');
				} else {
					user.savedJobs = user.savedJobs.filter(savedJob => {
						return savedJob._id != req.body._id;
					});

					User.findOneAndUpdate(
						{ "local.username": username.local.username },
						{ $set: user },
						{ new: true },
						(err, model) => {
							if(err) {
								console.log('Error Deleting Saved Job (Routes:481):', err);
								res.status(401).send(err);
							} else {
								res.send('Job Deleted!');
							}
						}
					);
				}
			})
		}
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                    Tasks
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.get('/api/tasks', function(req, res) {
		console.log('session info get /api/tasks', req.session.passport.user);
		var username = req.session.passport.user;
		if(username.google.id !== '') {
			User.findOne({ "google.id": username.google.id }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Tasks (Routes:503):', err);
					res.status(400).send('null');
				} else {
					console.log('Successfully Retrieved Tasks!');
					res.send(user.tasks);
				}
			})
		} else {
			User.findOne({ "local.username": username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Tasks (Routes:513):', err);
					res.status(400).send('null');
				} else {
					console.log('Successfully Retrieved Tasks!');
					res.send(user.tasks);
				}
			})
		}
	});

	// body (name)
	app.post('/api/tasks', function(req, res) {
		console.log('session info post /api/tasks', req.session.passport.user);
		console.log('attempting to create tasks', req.body);

		var username = req.session.passport.user;

		if(username.google.id !== '') {
			User.findOneAndUpdate(
	      { "google.id": username.google.id },
	      {$push: {"tasks": req.body}},
	      {safe: true, upsert: true, new: true},
	      (err, model) => {
        	if(err) {
						console.log('Error Posting New Task (Routes:537):', err);
        		res.status(401).send(err);
        	} else {
        		res.send('Task Successfully Created!');
        	}
        }
		  );
		} else {
			User.findOneAndUpdate(
	      { "local.username": username.local.username },
	      {$push: {"tasks": req.body}},
	      {safe: true, upsert: true, new: true},
	      (err, model) => {
        	if(err) {
						console.log('Error Posting New Task (Routes:537):', err);
        		res.status(401).send(err);
        	} else {
        		res.send('Task Successfully Created!');
        	}
        }
		  );
		}
	});

	// body (_id)  _id is found inside specific tasks and the name
	// tasks array can be retrieved using get /api/tasks
	app.patch('/api/tasks', function(req, res) {

		console.log('session info patch /api/tasks', req.session.passport.user);
		console.log('attempting to patch tasks', req.body);

		var username = req.session.passport.user;
		if(username.google.id !== '') {
			User.findOne({ "google.id": username.google.id }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Tasks (Routes:572):', err);
					res.status(400).send('null');
				} else {
					user.tasks.forEach((task) => {
						if(task._id == req.body._id) {
							for(var key in req.body) {
								task[key] = req.body[key];
							}
						}
					});

					User.findOneAndUpdate(
		        { "google.id": username.google.id },
		        { $set: user },
		        { new: true },
		        (err, model) => {
		        	if(err) {
								console.log('Error Updating Task (Routes:589):', err);
		        		res.status(401).send(err);
		        	} else {
		        		res.send('Job Successfully Updated!');
		        	}
		        }
				 	);
				}
			});
		} else {
			User.findOne({ "local.username": username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Tasks (Routes:601):', err);
					res.status(400).send('null');
				} else {
					user.tasks.forEach((task) => {
						if(task._id == req.body._id) {
							for(var key in req.body) {
								task[key] = req.body[key];
							}
						}
					});

					User.findOneAndUpdate(
		        { "local.username": username.local.username },
		        { $set: user },
		        { new: true },
		        (err, model) => {
		        	if(err) {
								console.log('Error Updating Task (Routes:618):', err);
		        		res.status(401).send(err);
		        	} else {
		        		res.send('Job Successfully Updated!');
		        	}
		        }
				 	);
				}
			});
		}
	});

	// body (_id)  _id is found inside specific tasks
	// tasks array can be retrieved using get /api/tasks
	app.delete('/api/tasks', function(req, res) {
		console.log('REQ.BODY: ', req.body);
		console.log('session info delete /api/tasks', req.session.passport.user);
		console.log('attempting to delete tasks', req.body);

		var username = req.session.passport.user;
		if(username.google.id !== '') {
			User.findOne({ "google.id": username.google.id }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Tasks (Routes:641):', err);
					res.status(400).send('null');
				} else {
					user.tasks = user.tasks.filter((task) => {
						return task._id != req.body._id;
					});

					User.findOneAndUpdate(
		        { "google.name": username.google.name },
		        { $set: user },
		        { new: true },
		        (err, model) => {
		        	if(err) {
								console.log('Error Deleting Task (Routes:654):', err);
		        		res.status(401).send(err);
		        	} else {
		        		res.send('Task Successfully Deleted!');
		        	}
		        }
				  );
				}
			});
		} else {
			User.findOne({ "local.username": username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Tasks (Routes:666):', err);
					res.status(400).send('null');
				} else {
					user.tasks = user.tasks.filter((task) => {
						return task._id != req.body._id;
					});

					User.findOneAndUpdate(
		        { "local.username": username.local.username },
		        { $set: user },
		        { new: true },
		        (err, model) => {
		        	if(err) {
								console.log('Error Deleting Task (Routes:679):', err);
		        		res.status(401).send(err);
		        	} else {
		        		res.send('Task Successfully Deleted!');
		        	}
		        }
				  );
				}
			});
		}
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                     User Companies
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.get('/api/companies', function(req, res) {
		console.log('session info get /api/jobs', req.session.passport.user);
		var username = req.session.passport.user;

		if(username.google.id !== '') {
			User.findOne({ "google.id": username.google.id }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Jobs (Routes:702):', err);
					res.status(400).send('null');
				} else {
					console.log('Successfully Retrieved Jobs!');
					var companies = user.jobs.map(obj => obj.company);

					res.send(companies.filter((val, index) => companies.indexOf(val) === index));
				}
			});
		} else {
			User.findOne({ "local.username": username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving Jobs (Routes:714):', err);
					res.status(400).send('null');
				} else {
					console.log('Successfully Retrieved Jobs!');
					var companies = user.jobs.map(obj => obj.company);

					res.send(companies.filter((val, index) => companies.indexOf(val) === index));
				}
			});
		}
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                User Due Dates For Tasks
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	app.get('/api/dates', (req, res) => {
		console.log('session info get /api/dates', req.session.passport.user);
		var username = req.session.passport.user;
		if(username.google.id !== '') {
			User.findOne({ "google.id": username.google.id }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving User (Routes:736):', err);
					res.status(400).send('null');
				} else {
					console.log('Successfully Retrieved User!');
					googleToken = user.google.token;
					var userSteps = [];
					user.jobs.forEach(job => {
						userSteps = userSteps.concat(job.currentStep);
						userSteps = userSteps.concat(job.nextStep);
					});

					userSteps = userSteps.filter(step => !!step);

					var dates = userSteps.filter(step => !!step.dueDate);
					if(google.email !== '') {
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
					}
					setTimeout(function() {
						res.send(dates);
					}, 750);
				}
			})
		} else {
			User.findOne({ "local.username": username.local.username }).exec((err, user) => {
				if(err) {
					console.log('Error Retrieving User (Routes:736):', err);
					res.status(400).send('null');
				} else {
					console.log('Successfully Retrieved User!');
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
		}
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
