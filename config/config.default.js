'use strict';
module.exports = appInfo => {
  return {
    keys: appInfo.name + '_1521256564072_3999',
    // 中间件
    middleware: [ 'entry' ],
    // 安全
    security: {
      csrf: {
        enable: false,
      },
    },
    // ------local------
    // log
    logger: {
      level: 'NONE',
      consoleLevel: 'DEBUG',
      dir: '/home/log/pkgif',
    },
    // mongodb
    mongoose: {
      client: {
        url: 'mongodb://47.106.36.246:27017/gif',
        options: {
          useNewUrlParser: true,
          autoReconnect: true,
          poolSize: 10,
          reconnectTries: Number.MAX_VALUE,
          reconnectInterval: 500,
          authSource: 'admin',
          auth: {
            user: 'root',
            password: 'wooden2018ears',
          },
        },
      },
    },
    // 全局配置
    global: {},
    proxy: true,
  };
};
