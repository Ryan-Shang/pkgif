'use strict';
module.exports = () => {
  return async (ctx, next) => {
    ctx.logger.info('---start---');
    ctx.logger.debug('requestBody:', ctx.request.body);
    await next();
    ctx.logger.debug('responseBody:', ctx.body);
    ctx.logger.info('---end---');
  };
};
