const mongoose = require('mongoose')

const Schema = mongoose.Schema

const addressSchema = new Schema({
  address: {
    type: String,
    required: true,
  },
  name: String,
})

const mailTransform = (doc, ret, options) => {
  const result = ret
  delete result.secretCode
  return result
}

const mailSchema = new Schema({
  subject: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
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
  toObject: { transform: mailTransform, virtuals: true },
  toJSON: { transform: mailTransform, virtuals: true },
})
mailSchema.virtual('isSecret').get(function () {
  return Boolean(this.secretCode)
})

const Mail = mongoose.model('Mail', mailSchema)

module.exports = Mail
