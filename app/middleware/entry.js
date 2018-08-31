'use strict';
module.exports = () => {
  return async (ctx, next) => {
    ctx.logger.info('---start---');
    ctx.logger.debug('requestBody:', ctx.request.body);
    if (ctx.path === '/') {
      ctx.redirect('/index.html');
    }
    await next();
    ctx.logger.debug('responseBody:', ctx.body);
    ctx.logger.info('---end---');
  };
};
