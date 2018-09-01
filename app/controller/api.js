'use strict';
const Controller = require('egg').Controller;

class publicController extends Controller {

  async postFeedback() {
    const { ctx } = this;
    const { response, tencentCaptcha, mail } = ctx.helper;
    const { succeed, failed } = response;
    const body = ctx.request.body;
    // 校验参数
    const rule = {
      content: {
        type: 'string',
        max: 200,
      },
      email: {
        type: 'string',
        required: false,
        empty: true,
      },
      ticket: {
        type: 'string',
      },
      randstr: {
        type: 'string',
      },
    };
    ctx.validate(rule);
    // 验证码校验
    try {
      await tencentCaptcha({
        type: 'commentVote',
        Ticket: body.ticket,
        Randstr: body.randstr,
        UserIP: ctx.ip,
      });
    } catch (e) {
      ctx.body = failed('验证码验证失败', 'CAPTCHA_ERROR');
    }
    await mail({
      content: body.content,
      email: body.email,
      ip: ctx.ip,
    });
    ctx.body = succeed();
  }
}

module.exports = publicController;
