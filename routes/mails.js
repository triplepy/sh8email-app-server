const express = require('express');
const Mail = require('../models/mail');
const Address = require('../models/address');

const router = express.Router();

/* POST create a mail */
router.post('/create', (req, res) => {
  const promiseToSave = (t) => {
    const address = new Address();
    address.email = t.address;
    address.name = t.name;
    return address.save();
  };
  const promisesToSaveTo = req.body.to.map(promiseToSave);
  const promisesToSaveCc = req.body.cc.map(promiseToSave);
  const promisesToSaveBcc = req.body.bcc.map(promiseToSave);
  const promiseToGetToIds = Promise.all(promisesToSaveTo).then(
    addresses => addresses.map(addr => addr._id));
  const promiseToGetCcIds = Promise.all(promisesToSaveCc).then(
    addresses => addresses.map(addr => addr._id));
  const promiseToGetBccIds = Promise.all(promisesToSaveBcc).then(
    addresses => addresses.map(addr => addr._id));

  Promise.all([promiseToGetToIds, promiseToGetCcIds, promiseToGetBccIds]).then((values) => {
    const to = values[0];
    const cc = values[1];
    const bcc = values[2];

    const mail = new Mail();
    mail.subject = req.body.subject;
    mail.recipient = req.body.recipient;
    mail.secretCode = req.body.secretCode;
    mail.to = to;
    mail.cc = cc;
    mail.bcc = bcc;
    mail.date = req.body.date;
    mail.messageId = req.body.messageId;
    mail.html = req.body.html;
    mail.text = req.body.text;
    return mail.save(); // promise
  }).then((mail) => {
    res.send({
      success: true,
      mailId: mail.id,
    });
  });
});

module.exports = router;
