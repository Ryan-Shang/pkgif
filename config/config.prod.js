'use strict';
module.exports = () => {
  return {
    // log
    logger: {
      level: 'WARN',
      consoleLevel: 'NONE',
      disableConsoleAfterReady: false,
    },
    // backJwt
    backJwt: {
      username: 'admin',
      password: '123prod456',
      w: 'g4IiwiaWF0IjoxNTI1NTgwMzasdaqwQ22NDAzNjh9V3gVIasdIwYASA3TQYocJqTo',
    },
    // mongodb
    mongoose: {
      client: {
        url: 'mongodb://127.0.0.1:27017/prod',
        options: {
          auth: {
            user: 'root',
            password: 'wooden2018earspro',
          },
        },
      },
    },
    // 全局配置
    global: {},
  };
};
