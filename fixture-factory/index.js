const factory = require('factory-girl').factory;
const MongooseAdapter = require('factory-girl').MongooseAdapter;
const chance = require('chance').Chance();
const Mail = require('../models/mail');

factory.setAdapter(new MongooseAdapter());

factory.define('mail', Mail, () => {
  const recipient = chance.word();
  return {
    subject: chance.sentence(),
    recipient,
    to: [{
      address: `${recipient}@sh8.email`,
      name: chance.name(),
    }, {
      address: chance.email(),
      name: chance.name(),
    }],
    from: [{
      address: chance.email(),
      name: chance.name(),
    }],
    cc: [{
      address: chance.email({ domain: 'sh8.email' }),
      name: chance.name(),
    }],
    bcc: [{
      address: chance.email({ domain: 'sh8.email' }),
      name: chance.name(),
    }],
    date: () => new Date(),
    messageId: chance.hash(),
    text: chance.paragraph(),
    html: `<p>${chance.paragraph()}</p>`,
  };
});
