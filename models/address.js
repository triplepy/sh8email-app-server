const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Address = mongoose.model('Address', new Schema({
  email: String,
  name: String,
}));

module.exports = Address;
