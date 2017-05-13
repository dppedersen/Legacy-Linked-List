
var request = require('request'); // You might need to npm install the request module!
var expect = require('chai').expect;
var config = require('../server/config/config.js');
var app = require('../server/server.js');
var mongoose = require('mongoose')


describe('Persistent Node Server', function() {
    var server;
    before(function() {
      server = app.listen(4000, function() {
        console.log('Testing on port 4000');
      });
    });

    after(function() {
      server.close();
    })


    beforeEach(function(done) {
      // Login Test account
      request({
        method: 'POST',
        uri: 'http://127.0.0.1:8080/api/login',
        json: { username: 'Test', password: 'test' }
      }, function(err, res, body) {
        console.log(body);
        done()
      })
    });


    it('Should not login users that do not exist', function(done) {
       // make twitter request
       console.log('requesting twitter')
       request({
         method: 'POST',
         uri: 'http://127.0.0.1:8080/api/login'
       }, (err, res, body) => {
         console.log(err);


         expect(res.statusCode).to.equal(401);
         done()
       });
    });

    it('Should allow users to login with Google Users', function(done) {
       request({
         method: 'GET',
         uri: 'http://127.0.0.1:8080/auth/google'
       }, (err, res, body) => {
         console.log(err);


         expect(res.statusCode).to.equal(200);
         done()
       });
    })
})
