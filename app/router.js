'use strict';
module.exports = app => {
  const { router, controller } = app;
  // 上传图片
  router.post('/api/feedback', controller.api.postFeedback);
};
