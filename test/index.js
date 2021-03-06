/* eslint-disable prefer-arrow-callback*/

process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
// factory-girl setup
require('../fixture-factory')


before(function (done) {
  mongoose.connection.once('connected', () => {
    mongoose.connection.db.dropDatabase().then(() => {
      done()
    }).catch((err) => {
      throw err
    })
  })
})

require('./integration/mail-api')
