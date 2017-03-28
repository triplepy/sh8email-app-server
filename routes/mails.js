const express = require('express');
const Mail = require('../models/mail');

const router = express.Router();

/* POST create a mail */
router.post('/create', (req, res) => {
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
      success: true,
      mailId: m.id,
    });
  });
});

/* GET show mails */
router.get('/', (req, res) => {
  Mail.find({
    recipient: req.query.recipient,
  }).exec().then((mails) => {
    // TODO refactor using Query#select
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
  });
});

/* GET show a mail */
router.get('/:mailId', (req, res) => {
  Mail.findOne({
    recipient: req.query.recipient,
    id: req.param.mailId,
  }).select('-secretCode').exec().then((mail) => {
    res.send(mail);
  });
});

module.exports = router;
