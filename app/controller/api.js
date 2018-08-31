'use strict';
const Controller = require('egg').Controller;

class publicController extends Controller {

  async postFeedback() {
    const { ctx } = this;
    const { succeed } = ctx.helper.response;
    ctx.body = succeed({});
  }
}

module.exports = publicController;
