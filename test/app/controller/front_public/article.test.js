'use strict';

const { app } = require('egg-mock/bootstrap');
describe('test/app/controller/frontPublic/articles.test.js', () => {

  it('should GET /front-public/articles 200', () => {
    return app.httpRequest()
      .get('/front-public/articles')
      .expect(res => {
        console.log(res.body);
      })
      .expect(200);
  });

  it('should GET /front-public/oneArticle 200', () => {
    return app.httpRequest()
      .get('/front-public/oneArticle?_id=5af2afb4d44a1d1e4c5c60d2')
      .expect(res => {
        console.log(res.body);
      })
      .expect(200);
  });

});
