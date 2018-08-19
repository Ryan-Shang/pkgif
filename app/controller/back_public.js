'use strict';
const Controller = require('egg').Controller;

class publicController extends Controller {

  getGlobal() {
    const { ctx } = this;
    ctx.body = {};
  }
}

module.exports = publicController;
