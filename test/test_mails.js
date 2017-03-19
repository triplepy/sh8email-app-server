/* eslint-disable prefer-arrow-callback*/

const request = require('supertest');
const factory = require('factory-girl').factory;
require('should');

const app = require('../app');

describe('/api/mails/create', function() {
  it('should save a mail successfully', function(done) {
    factory.attrs('mail').then(mail => request(app).post('/api/mails/create').send(mail).expect(200)).then((res) => {
      res.body.success.should.equal(true);
      res.body.mailId.should.not.empty();
      // TODO assert the db values
      // TODO seperate these assertions
    }).then(done).catch(done);
  });
});
