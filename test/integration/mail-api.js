/* eslint-disable prefer-arrow-callback*/

const request = require('supertest');
const factory = require('factory-girl').factory;
const _ = require('lodash');
require('should');
const Mail = require('../../models/mail');

const app = require('../../app');

const assertMailField = (field, actual, expected) => {
  _.zip(actual[field], expected[field]).forEach((zipped) => {
    const oneOfActual = zipped[0];
    const oneOfExpected = zipped[1];
    oneOfActual.address.should.equal(oneOfExpected.address);
    oneOfActual.name.should.equal(oneOfExpected.name);
  });
};

describe('/api/mails/create', function() {
  it('should save a mail successfully', function(done) {
    let expected;
    factory.attrs('mail').then((mail) => {
      expected = mail;
      return request(app).post('/api/mails/create').send(mail).expect(200);
    }).then((res) => {
      res.body.success.should.equal(true);
      res.body.mailId.should.not.empty();

      return Mail.findById(res.body.mailId);
    }).then((saved) => {
      saved.subject.should.equal(expected.subject);
      saved.recipient.should.equal(expected.recipient);
      saved.secretCode.should.equal(expected.secretCode);
      // You should use eql instead of equal for assertion of Date object.
      saved.date.should.eql(expected.date);
      saved.messageId.should.equal(expected.messageId);
      saved.text.should.equal(expected.text);
      saved.html.should.equal(expected.html);
      assertMailField('to', saved, expected);
      assertMailField('from', saved, expected);
      assertMailField('cc', saved, expected);
      assertMailField('bcc', saved, expected);
    }).then(done).catch(done);
  });
});

describe('GET /api/mails', function() {
  const fixture = {
    mails: [],
    recipient: 'getogrand',
  };

  before(function (done) {
    const buildOption = _.times(3, () => ({ recipient: fixture.recipient, secretCode: null }));
    factory.createMany('mail', 3, buildOption).then((mails) => {
      fixture.mails.push(...mails);
    }).then(done).catch(done);
  });

  it('should respond mails list successfully', function (done) {
    request(app).get(`/api/mails?recipient=${fixture.recipient}`).expect(200).then((res) => {
      const mails = res.body;
      mails.length.should.equal(3);
    }).then(done).catch(done);
  });
});
