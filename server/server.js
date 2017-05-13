var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var request = require('request');
var config = require('./config/config');
// auth dependencies
var config = require('./config/config');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var hash = require('bcrypt-nodejs');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy
// adding favicon in express
var favicon = require('serve-favicon');
var request = require('request');
// user schema/model
var User = require('./db/models/user.js');

// set up express app
var app = express();

// set up port
var port = process.env.PORT || 8080;

//set up mongodb
var db = require('./db/db-config.js');

// define middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(require('express-session')({secret: 'secret', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

//serve up static files
app.use(express.static(__dirname + '/../client'));

// add favicon
app.use(favicon(__dirname + '/../client/favicon.ico'));
passport.serializeUser(function(user, done) {
  done(null, user);
  console.log("User: " + user.displayName); // If there is a persistent session, the console logs out the displayName
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
// configure passport
passport.use('local', new localStrategy({
  // by default, local strategy uses username and password, we will override with email
  'local.username': 'username',
  'local.password': 'password',
  passReqToCallback: true // allows us to pass back the entire request to the callback
}, function(req, username, password, done) {
  // find a user whose email is the same as the forms email
  // we are checking to see if the user trying to login already exists

  User.findOne({
    'local.username': req.body.username
  }, function(err, user) {
    // if there are any errors, return the error before anything else
    if (err)
      return done(err);

    // if no user is found, return the message
    if (!user)
      return done(null, false, console.log('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

    // if the user is found but the password is wrong
    if (!user.validPassword(password))
      return done(null, false, console.log('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

    // all is well, return successful user
    return done(null, user);
  });
}));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({

  // pull in our app id and secret from our auth.js file
  clientID: config.googleOAuth.clientID,
  clientSecret: config.googleOAuth.clientSecret,
  callbackURL: config.googleOAuth.callbackURL,
  passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

},

// Google will send back the token and profile
function(req, token, refreshToken, profile, done) {
  process.nextTick(function() {
    // check if the user is already logged in
    if (!req.user) {

      // find the user in the database based on their Google id
      User.findOne({ 'google.id': profile.id }, function(err, user) {
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err) {
          console.log('Goole Authentication Error:', err);
          return done(err);
        } else {
          User.findOne({ "google.id": profile.id }, (err, user) => {
            if(err) {
              console.log('Error Finding Google User (Server:109):', err);
            }
            if(user) {
              if(user.google.id !== '') {
                console.log(`Welcome back, ${user.google.name}! Updating your access token...`);
                user.google.token = token;
                console.log('Logging in as', user.google.name);
                return done(null, user);
              }
            }
            var newUser = new User({
              "google.id": profile.id,
              "google.token": token,
              "google.name": `${profile.name.givenName} ${profile.name.familyName}`,
              "google.email": profile.emails[0].value,
              "google.profilePic": profile._json.image.url
            });
            newUser.save(err => {
              console.log('Saving New User...');
              if(err) {
                console.log('Error Saving New User (Server:124):', err);
              } else {
                console.log(`Account Created! Logging in as ${newUser.google.name}`);
              }
              return done(null, newUser);
            });
          });
        }
      })
    }
  })
}));
    // } else {
    //   // user already exists and is logged in, we have to link accounts
    //   var user = req.user; // pull the user out of the session
    //   User.findOne({ 'google.email': profile.emails[0].value}, (err, user) => {
    //     if(err) {
    //       console.log('Google User Error (147):', err);
    //     }
    //     if(user) {
    //       console.log('Google User (150):', user);
    //     }
    //   })
    //   User.findOneAndUpdate({ "local.username": user.local.username }, {
    //     $set: {
    //       "google.id": profile.id,
    //       "google.token": token,
    //       "google.name": profile.name.givenName + ' ' + profile.name.familyName,
    //       "google.email": profile.emails[0].value,
    //       "google.profilePic": profile._json.image.url
    //     }
    //   }, {
    //     upsert: true
    //   }, function(err, user) {
    //     if (err) {
    //       res.status(401).send(err);
    //     } else {
    //       user.save(function(err) {
    //         if (err) {
    //           console.log('User Save Error:', err);
    //         } else {
    //           return done(null, user);
    //         }
    //       });
    //     }


      // User.findOneAndUpdate({username: user.local.username, 'user.google.id': profile.id, 'user.google.token': token, 'user.google.name': profile.name.givenName + ' ' + profile.name.familyName, 'user.google.email': profile.emails[0].value},
      // function(err, user) {
      //   if(err) {
      //     res.status(401).send(err);
      //   } else {
      //     user.save(function(err) {
      //       if (err) return res.send(err);
      //   return done(null, user);
      //   });
      //   }
      // });

//set up routes
var routes = require('./routes/routes.js')(app, express);

// error handlers
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.end(JSON.stringify({message: err.message, error: {}}));
});

// listen to port
app.listen(port);
console.log('server listening on port ' + port);
console.log('serving static files from' + __dirname + '/../client');
