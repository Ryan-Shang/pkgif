'use strict';
module.exports = app => {
  const { router, controller } = app;
  /**
   * 后台公开
   **/
  // 获取配置
  router.get('/back-public/global', controller.backPublic.getGlobal);
};
