const express = require('express');
const Mail = require('../models/mail');

const router = express.Router();

/* POST create a mail */
router.post('/create', (req, res, next) => {
  const mail = new Mail();
  mail.subject = req.body.subject;
  mail.recipient = req.body.recipient;
  mail.secretCode = req.body.secretCode;
  mail.to.push(...req.body.to);
  mail.from.push(...req.body.from);
  mail.cc.push(...req.body.cc);
  mail.bcc.push(...req.body.bcc);
  mail.date = req.body.date;
  mail.messageId = req.body.messageId;
  mail.html = req.body.html;
  mail.text = req.body.text;
  mail.save().then((m) => {
    res.send({
      mailId: m.id,
    });
  }).catch(next);
});

/* GET show mails */
router.get('/', (req, res, next) => {
  Mail.find({
    recipient: req.query.recipient,
  }).exec().then((mails) => {
    res.send(mails.map((m) => {
      const base = {
        subject: m.subject,
        recipient: m.recipient,
        date: m.date,
      };
      const addtional = m.secretCode ? {
        to: [],
        from: [],
        cc: [],
        bcc: [],
      } : {
        to: m.to,
        from: m.from,
        cc: m.cc,
        bcc: m.bcc,
        html: m.html,
        text: m.text,
      };
      return Object.assign(base, addtional);
    }));
  }).catch(next);
});

/* GET show a mail */
router.get('/:mailId', (req, res, next) => {
  const recipient = req.query.recipient;
  const mailId = req.params.mailId;

  if (!recipient || !mailId) {
    res.sendStatus(400);
    return;
  }

  Mail.findOne({
    recipient,
    _id: mailId,
  }).exec().then((mail) => {
    if (!mail) {
      res.sendStatus(404);
      return;
    }
    if (mail.isSecret() && mail.secretCode !== req.header('Sh8-Secret-Code')) {
      res.sendStatus(403);
      return;
    }

    const result = mail.toObject();
    delete result.secretCode;
    res.send(result);
  }).catch(next);
});

module.exports = router;
