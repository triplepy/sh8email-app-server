/* eslint-disable prefer-arrow-callback*/

const request = require('supertest');
const factory = require('factory-girl').factory;
const moment = require('moment');
const _ = require('lodash');
const should = require('should');
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

describe('POST /api/mails/create', function() {
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
      // nullable assertion
      should(saved.secretCode).equal(expected.secretCode);
      moment(saved.date).isSame(moment(expected.date)).should.be.true();
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
    }).then(() => factory.create('mail', { recipient: fixture.recipient, secretCode: 'secret1234' })).then((mailWithSecretCode) => {
      fixture.mails.push(mailWithSecretCode);
    }).then(done).catch(done);
  });

  it('should respond mails list successfully', function (done) {
    request(app).get(`/api/mails?recipient=${fixture.recipient}`).expect(200).then((res) => {
      const mails = res.body;
      mails.length.should.equal(fixture.mails.length);
      mails.forEach((actual, i) => {
        const expected = fixture.mails[i];
        actual.subject.should.equal(expected.subject);
        actual.recipient.should.equal(expected.recipient);
        should.not.exist(actual.secretCode);
        moment(actual.date).isSame(moment(expected.date)).should.be.true();
        // secretCode should not reveal to user
        should.not.exist(actual.secretCode);
        if (expected.secretCode) {
          // should not have mail fields if there is secretCode
          actual.to.should.empty();
          actual.from.should.empty();
          actual.cc.should.empty();
          actual.bcc.should.empty();
        } else {
          actual.text.should.equal(expected.text);
          actual.html.should.equal(expected.html);
          assertMailField('to', actual, expected);
          assertMailField('from', actual, expected);
          assertMailField('cc', actual, expected);
          assertMailField('bcc', actual, expected);
        }
      });
    }).then(done).catch(done);
  });

  // TODO Add test when mail list is empty
});

describe('GET /api/mails/:mailId', function() {
  const fixture = {
    mails: [],
  };

  before(function (done) {
    factory.createMany('mail', 3).then((mails) => {
      fixture.mails.push(...mails);
    }).then(done).catch(done);
  });

  it('should respond a normal mail successfully', function(done) {
    const expected = fixture.mails[1];
    request(app).get(`/api/mails/${expected.id}?recipient=${expected.recipient}`).expect(200).then((res) => {
      const actual = res.body;
      actual.subject.should.equal(expected.subject);
      actual.recipient.should.equal(expected.recipient);
      should.not.exist(actual.secretCode);
      moment(actual.date).isSame(moment(expected.date)).should.be.true();
      should.not.exist(actual.secretCode);
      actual.text.should.equal(expected.text);
      actual.html.should.equal(expected.html);
      actual.messageId.should.equal(expected.messageId);
      assertMailField('to', actual, expected);
      assertMailField('from', actual, expected);
      assertMailField('cc', actual, expected);
      assertMailField('bcc', actual, expected);
    }).then(done).catch(done);
  });

  // TODO Add test reading secret mail
  // TODO Add test when 'recipient' GET parameter does not exist
  // TODO Add test when 'recipient' GET parameter is unmatched with database
  // TODO Add test when requested mail does not exist
});
