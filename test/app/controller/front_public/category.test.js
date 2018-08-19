'use strict';

const { app } = require('egg-mock/bootstrap');
describe('test/app/controller/front_public/category.test.js', () => {

  it('should GET /front-public/categories 200', () => {
    return app.httpRequest()
      .get('/front-public/categories')
      .expect(res => {
        console.log(res.body);
      })
      .expect(200);
  });

  it('should GET /front-public/indexCategoryColumns 200', () => {
    return app.httpRequest()
      .get('/front-public/indexCategoryColumns')
      .expect(res => {
        console.log(res.body);
      })
      .expect(200);
  });

});
