'use strict';

const { app } = require('egg-mock/bootstrap');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3IjoiZzRJaXdpYVdGMElqb3hOVEkxTlRnd016WTRMQ0psZUhBaU9qUTJPREV6TkRBek5qaDlWM2dWSWNjSXdZQVNBM1RRWW9jSnFUbyIsImlhdCI6MTUyNTc4MjU5NSwiZXhwIjo0NjgxNTQyNTk1fQ.HCPgIiQSXp9NZOcmp9zbNQu2BHCL2HCBfMQkB9q4xO0';
describe('test/app/controller/back_api/qiniu.test.js', () => {

  it('should GET /back-api/qiniuToken 200', () => {
    return app.httpRequest()
      .get('/back-api/qiniuToken')
      .set('token', token)
      .expect(res => {
        console.log(res.header);
      })
      .expect(200);
  });

});
