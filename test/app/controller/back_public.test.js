'use strict';

const { app } = require('egg-mock/bootstrap');
describe('test/app/controller/back_public.test.js', () => {

  it('should GET /back-public/global 200', () => {
    return app.httpRequest()
      .get('/back-public/global')
      .expect(res => {
        console.log(res.body);
      })
      .expect(200);
  });

});
