/* eslint-disable prefer-arrow-callback*/

const request = require('supertest')
const factory = require('factory-girl').factory
const moment = require('moment')
const _ = require('lodash')
const should = require('should')
const Mail = require('../../models/mail')

const app = require('../../app')

const assertAddressField = (field, actual, expected) => {
  _.zip(actual[field], expected[field]).forEach((zipped) => {
    const oneOfActual = zipped[0]
    const oneOfExpected = zipped[1]
    oneOfActual.address.should.equal(oneOfExpected.address)
    oneOfActual.name.should.equal(oneOfExpected.name)
  })
}

const assertAddressFields = (actual, expected) => {
  const fields = ['to', 'from', 'cc', 'bcc']
  fields.forEach((field) => {
    assertAddressField(field, actual, expected)
  })
}

const assertMailResponse = (actual, expected) => {
  actual.subject.should.equal(expected.subject)
  actual.recipient.should.equal(expected.recipient)
  moment(actual.date).isSame(moment(expected.date)).should.be.true()
  should.not.exist(actual.secretCode)
  should.exist(actual.isSecret)
  actual.text.should.equal(expected.text)
  actual.html.should.equal(expected.html)
  actual.messageId.should.equal(expected.messageId)
  assertAddressFields(actual, expected)
}

describe('POST /api/mails/create', function() {
  it('should save a mail successfully', function() {
    let expected
    return factory.attrs('mail').then((mail) => {
      expected = mail
      return request(app).post('/api/mails/create').send(mail).expect(200)
    }).then((res) => {
      res.body.mailId.should.not.empty()

      return Mail.findById(res.body.mailId)
    }).then((saved) => {
      saved.subject.should.equal(expected.subject)
      saved.recipient.should.equal(expected.recipient)
      // nullable assertion
      should(saved.secretCode).equal(expected.secretCode)
      should.exist(saved.isSecret)
      moment(saved.date).isSame(moment(expected.date)).should.be.true()
      saved.messageId.should.equal(expected.messageId)
      saved.text.should.equal(expected.text)
      saved.html.should.equal(expected.html)
      assertAddressFields(saved, expected)
    })
  })
})

describe('GET /api/recipient/:recipient/mails', function() {
  const fixture = {
    mails: [],
    recipient: 'getogrand',
  }

  before(function () {
    const buildOption = _.times(3, () => ({ recipient: fixture.recipient }))
    return factory.createMany('mail', 3, buildOption).then((mails) => {
      fixture.mails.push(...mails)
    }).then(() => factory.create('mail', { recipient: fixture.recipient, secretCode: 'secret1234' })).then((mailWithSecretCode) => {
      fixture.mails.push(mailWithSecretCode)
    })
  })

  it('should respond mails list successfully', function () {
    return request(app).get(`/api/recipient/${fixture.recipient}/mails`).expect(200).then((res) => {
      const mails = res.body
      mails.length.should.equal(fixture.mails.length)
      mails.forEach((actual, i) => {
        const expected = fixture.mails[i]
        actual.subject.should.equal(expected.subject)
        actual.recipient.should.equal(expected.recipient)
        moment(actual.date).isSame(moment(expected.date)).should.be.true()
        // secretCode should not reveal to user
        should.not.exist(actual.secretCode)
        if (expected.isSecret) {
          // should not have mail fields if there is secretCode
          actual.to.should.empty()
          actual.from.should.empty()
          actual.cc.should.empty()
          actual.bcc.should.empty()
        } else {
          actual.text.should.equal(expected.text)
          actual.html.should.equal(expected.html)
          assertAddressFields(actual, expected)
        }
      })
    })
  })

  it('should respond empty array when there is no mail which is matched params', function() {
    const recipient = 'not_exist_recipient'
    return request(app).get(`/api/recipient/${recipient}/mails`).expect(200).then((res) => {
      res.body.should.deepEqual([])
    })
  })

  it('should respond 404 Not Found if the \'recipient\' params is missing', function() {
    return request(app).get('/api/mails').expect(404)
  })
})

describe('GET /api/recipient/:recipient/mails/:mailId', function() {
  describe('CASE: non-secret mail', function() {
    const fixture = {
      mails: [],
    }

    before(function () {
      return factory.createMany('mail', 3).then((mails) => {
        fixture.mails.push(...mails)
      })
    })

    it('should respond a non-secret mail successfully', function() {
      const expected = fixture.mails[1]
      return request(app).get(`/api/recipient/${expected.recipient}/mails/${expected.id}`).expect(200).then((res) => {
        const actual = res.body
        assertMailResponse(actual, expected)
      })
    })

    it('should respond 404 Not Found if the \'recipient\' params is missing', function() {
      const expected = fixture.mails[1]
      return request(app).get(`/api/mails/${expected.id}`).expect(404)
    })

    it('should respond 404 Not Found if the requested mail is not present', function() {
      const expected = fixture.mails[1]
      const id = 'not_exist_id'
      return request(app).get(`/api/recipient/${expected.recipient}/mails/${id}`).expect(404)
    })
  })

  describe('CASE: secret mail', function() {
    const fixture = {
      mails: [],
    }

    before(function () {
      const buildOption = _.times(3, () => ({ secretCode: 'this_is_secret_code' }))
      return factory.createMany('mail', 3, buildOption).then((mails) => {
        fixture.mails.push(...mails)
      })
    })

    it('should respond a secret mail successfully', function() {
      const expected = fixture.mails[1]
      return request(app).get(`/api/recipient/${expected.recipient}/mails/${expected.id}`).set('Sh8-Secret-Code', expected.secretCode).expect(200).then((res) => {
        const actual = res.body
        assertMailResponse(actual, expected)
      })
    })

    it('should respond 403 Forbidden if the secretCode is invalid', function () {
      const expected = fixture.mails[1]
      return request(app).get(`/api/recipient/${expected.recipient}/mails/${expected.id}`).set('Sh8-Secret-Code', 'invalid_password_1234').expect(403)
    })
  })
})
