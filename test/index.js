/* eslint-disable prefer-arrow-callback*/

process.env.NODE_ENV = 'test';

require('../app');
const mongoose = require('mongoose');

before(function () {
  mongoose.connection.once('connected', () => {
    mongoose.connection.db.dropDatabase();
  });
});

require('./integration/mail-api');
