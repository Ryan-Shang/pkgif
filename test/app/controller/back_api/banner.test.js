'use strict';
const { app } = require('egg-mock/bootstrap');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3IjoiZzRJaXdpYVdGMElqb3hOVEkxTlRnd016WTRMQ0psZUhBaU9qUTJPREV6TkRBek5qaDlWM2dWSWNjSXdZQVNBM1RRWW9jSnFUbyIsImlhdCI6MTUyNTc4MjU5NSwiZXhwIjo0NjgxNTQyNTk1fQ.HCPgIiQSXp9NZOcmp9zbNQu2BHCL2HCBfMQkB9q4xO0';
describe('test/app/controller/back_api/banners.test.js', () => {

  it('should GET /back-api/banners 200', () => {
    return app.httpRequest()
      .post('/back-api/banners')
      .send({
        title: 'test',
        link: 'www.baidu.com',
        position: [ 'list' ],
        category: '5aefb86056a71a0f60a717a5',
        squareBannerImage: '',
        isPublish: false,
      })
      .set('token', token)
      .expect(res => {
        console.log(res.body);
      })
      .expect(200);
  });
});
