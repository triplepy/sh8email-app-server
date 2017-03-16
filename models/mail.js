const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  address: String,
  name: String,
});

const Mail = mongoose.model('Mail', new Schema({
  subject: String,
  recipient: String,
  secretCode: String,
  to: [addressSchema],
  from: [addressSchema],
  cc: [addressSchema],
  bcc: [addressSchema],
  date: Date,
  messageId: String,
  html: String,
  text: String,
}));

module.exports = Mail;
