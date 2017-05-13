
var request = require('request'); // You might need to npm install the request module!
var expect = require('chai').expect;
var config = require('../server/config/config.js');
var app = require('../server/server.js');


describe('Persistent Node Server', function() {
    var dbConnection;
    var server;
    before(function() {
      server = app.listen(8080, function() {
        console.log('Testing on port 8080');
      });
    });

    after(function() {
      server.close();
    })

    beforeEach(function(done) {

      var dbURI = 'mongodb://europa:europa@ds161487.mlab.com:61487/legacy_ganymede';

      mongoose.connect(dbURI);
      dbConnection = mongoose.connection;
    });

    beforeEach(function(done) {
      // Login Test account
      request({
        method: 'POST',
        uri: 'http://127.0.0.1:8080/api/login',
        json: { username: 'Test', password: 'test' }
      }, function(err, res, body) {
        console.log(body);
      })
    });

    afterEach(function() {
      dbConnection.end()
    });

    it('Should return twitter messages for empty array', function(done) {
       // make twitter request
       request({
         method: 'POST',
         uri: 'http://127.0.0.1:8080/api/login',
         json: ['']
       }, (err, res, body) => {
         console.log(err);

         expect(res.status).to.equal(200);
       });
    })
})
