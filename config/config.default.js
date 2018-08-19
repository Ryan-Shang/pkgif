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
    // 静态资源
    static: {
      maxAge: 365 * 24 * 60 * 60,
      gzip: true,
      usePrecompiledGzip: true,
      dynamic: true,
    },
    // swagger
    swagger2: {
      enable: false,
      base: {
        info: {
          version: '1.0.0',
          title: '2期前台接口',
        },
        tags: [
          {
            name: 'front-public',
            description: '前台公开接口',
          },
          {
            name: 'front-api',
            description: '前台鉴权接口',
          },
        ],
        definitions: {
          // model definitions
        },
        securityDefinitions: {
          // security definitions
        },
      },
    },
    // ------local------
    // log
    logger: {
      level: 'NONE',
      consoleLevel: 'DEBUG',
      dir: '/home/log/woodenears-service',
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
    // protocol+host
    proxy: true,
  };
};
