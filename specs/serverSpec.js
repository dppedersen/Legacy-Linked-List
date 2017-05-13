
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
        uri: 'http://127.0.0.1:4000/api/login',
        json: { username: 'Test', password: 'test' }
      }, function(err, res, body) {
        console.log(body);
        done()
      })
    });


    it('Should return twitter messages for empty array', function(done) {
       // make twitter request
       console.log('requesting twitter')
       request({
         method: 'POST',
         uri: 'http://127.0.0.1:4000/api/twitter',
         json: ['']
       }, (err, res, body) => {
         console.log(err);


         expect(res.statusCode).to.equal(200);
         done()
       });
    });

    it('Should return twitter messages for array of handles', function(done) {
       // make twitter request
       console.log('requesting twitter')
       request({
         method: 'POST',
         uri: 'http://127.0.0.1:4000/api/twitter',
         json: ['twitterdev, TheDailyShow']
       }, (err, res, body) => {
         console.log(err);


         expect(res.statusCode).to.equal(200);
         done()
       });
    })

    it('Should return Jobs', function(done) {
      request({
        method: 'GET',
        uri: 'http://127.0.0.1:4000/api/jobs'
      }, (err, res, body) => {
        console.log(body);
        expect(body).to.not.equal(undefined);
        done();
      });
    });

    it('Should return SavedJobs', function(done) {
      request({
        method: 'GET',
        uri: 'http://127.0.0.1:4000/api/savedJobs'
      }, (err, res, body) => {
        console.log(body);
        expect(body).to.not.equal(undefined);
        done();
      });
    });
})
