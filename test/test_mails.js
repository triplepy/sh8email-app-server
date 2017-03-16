/* eslint-disable prefer-arrow-callback*/

const request = require('supertest');
require('should');

const app = require('../app');

describe('/api/mails/create', function() {
  it('should save a mail successfully', function(done) {
    request(app).post('/api/mails/create').send({
      subject: 'This is the test subject.',
      recipient: 'getogrand',
      secretCode: 'secret',
      to: [
        {
          address: 'kyunooh@sh8.email',
          name: 'Kyunoohhh',
        },
        {
          address: 'getogrand@sh8.email',
          name: 'Getogrand!',
        },
      ],
      from: [
        {
          address: 'downy@sh8.email',
          name: 'Downyyy',
        },
      ],
      cc: [
        {
          address: 'rivermountain@sh8.email',
          name: 'River and Mountain',
        },
      ],
      bcc: [
        {
          address: 'hyndeeeee@sh8.email',
          name: 'Hyndeeeee@@',
        },
      ],
      date: new Date(),
      messageId: 'testmessageid',
      text: 'This is the test text.',
      html: '<p>test html</p>',
    }).expect(200).then((res) => {
      res.body.success.should.equal(true);
      res.body.mailId.should.not.empty();
    }).then(done).catch(done);
  });
});
