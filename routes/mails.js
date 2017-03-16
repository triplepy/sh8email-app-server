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

module.exports = router;
