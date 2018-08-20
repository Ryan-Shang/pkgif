'use strict';

module.exports = () => {
  return {
    // 成功响应
    succeed(res) {
      const obj = res || {};
      obj.status = 'SUCCEED';
      return obj;
    },
    // 失败响应
    failed(errorMessage, errorCode) {
      return {
        status: 'FAILED',
        errorCode,
        errorMessage,
      };
    },
  };
};
