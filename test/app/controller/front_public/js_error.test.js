'use strict';

const { app } = require('egg-mock/bootstrap');
describe('test/app/controller/front_public/js_error.test.js', () => {

  it('should post /front_public/jsErrors 200', () => {
    return app.httpRequest()
      .post('/front-public/jsErrors')
      .send({
        errorMessage: 'testError',
        scriptURI: 'testFile',
        lineNumber: 1,
        columnNumber: 2,
        errorObj: {
          test: 1,
        },
      })
      .expect(res => {
        console.log(res.body);
      })
      .expect(200);
  });

});
