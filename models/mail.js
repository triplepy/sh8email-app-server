const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Mail = mongoose.model('Mail', new Schema({
  subject: String,
  recipient: String,
  secretCode: String,
  to: [Schema.Types.ObjectId],
  from: [Schema.Types.ObjectId],
  cc: [Schema.Types.ObjectId],
  bcc: [Schema.Types.ObjectId],
  date: Date,
  messageId: String,
  html: String,
  text: String,
}));

module.exports = Mail;
