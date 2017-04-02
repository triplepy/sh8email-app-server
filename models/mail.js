const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  address: String,
  name: String,
});

const mailSchema = new Schema({
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
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});
mailSchema.virtual('isSecret').get(function () {
  return Boolean(this.secretCode);
});

const Mail = mongoose.model('Mail', mailSchema);

module.exports = Mail;
