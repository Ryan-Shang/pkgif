'use strict';

module.exports = () => {
  return {
    // log
    logger: {
      level: 'INFO',
      consoleLevel: 'NONE',
      disableConsoleAfterReady: false,
    },
    // backJwt
    backJwt: {
      username: 'admin',
      password: 'test123456',
      w: 'g4IiwiaWF0IjoxNTI1NTgwMzY4LCJleHAiOjQ2ODEzNDAzNjh9V3gVIccIwYASA3TQYocJqTo',
    },
    // mongodb
    mongoose: {
      client: {
        url: 'mongodb://127.0.0.1:27017/test',
        options: {
          auth: {
            user: 'root',
            password: 'wooden2018ears',
          },
        },
      },
    },
    // protocol+host
    phost: 'http://47.106.36.246:8000',
    // swagger
    swagger2: {
      base: {
        host: '47.106.36.246:8100',
      },
    },
  };
};
