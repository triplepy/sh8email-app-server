/* eslint-disable prefer-arrow-callback*/

const request = require('supertest');
const factory = require('factory-girl').factory;
const _ = require('lodash');
require('should');
const Mail = require('../models/mail');

const app = require('../app');

describe('/api/mails/create', function() {
  it('should save a mail successfully', function(done) {
    let expected;
    factory.attrs('mail').then((mail) => {
      expected = mail;
      return request(app).post('/api/mails/create').send(mail).expect(200);
    }).then((res) => {
      res.body.success.should.equal(true);
      res.body.mailId.should.not.empty();

      // TODO assert the db values
      return Mail.findById(res.body.mailId);
      // TODO seperate these assertions
    }).then((saved) => {
      saved.subject.should.equal(expected.subject);
      saved.recipient.should.equal(expected.recipient);
      saved.secretCode.should.equal(expected.secretCode);
      saved.date.should.eql(expected.date);
      saved.messageId.should.equal(expected.messageId);
      saved.text.should.equal(expected.text);
      saved.html.should.equal(expected.html);
      _.zip(saved.to, expected.to).forEach((z) => {
        const s = z[0];
        const e = z[1];
        s.address.should.equal(e.address);
        s.name.should.equal(e.name);
      });
      _.zip(saved.from, expected.from).forEach((z) => {
        const s = z[0];
        const e = z[1];
        s.address.should.equal(e.address);
        s.name.should.equal(e.name);
      });
      _.zip(saved.cc, expected.cc).forEach((z) => {
        const s = z[0];
        const e = z[1];
        s.address.should.equal(e.address);
        s.name.should.equal(e.name);
      });
      _.zip(saved.bcc, expected.bcc).forEach((z) => {
        const s = z[0];
        const e = z[1];
        s.address.should.equal(e.address);
        s.name.should.equal(e.name);
      });
    }).then(done).catch(done);
  });
});
