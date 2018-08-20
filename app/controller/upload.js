'use strict';
const Controller = require('egg').Controller;

class publicController extends Controller {

  async postUploadImg() {
    const { ctx } = this;
    const { succeed } = ctx.helper.response;
    const { saveTmpGif } = ctx.helper.util;
    const stream = await ctx.getFileStream();
    const fileLocation = await saveTmpGif(stream);
    ctx.body = succeed({
      data: fileLocation,
    });
  }
}

module.exports = publicController;
