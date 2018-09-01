'use strict';
const map = {
  commentVote: {
    aid: 2089125366,
    AppSecretKey: '0C3oegCzAirYEWyfNvrWXoA**',
  },
};

module.exports = app => {
  /**
   *
   * @param {object} config ({type,Ticket,Randstr,UserIP}) 类型，票据，随机字符串，用户ip
   * @return {Promise<any>} 结果
   */
  return config => {
    return new Promise((resolve, reject) => {
      app.curl(`https://ssl.captcha.qq.com/ticket/verify?aid=${map[ config.type ].aid}&AppSecretKey=${map[ config.type ].AppSecretKey}&Ticket=${config.Ticket}&Randstr=${config.Randstr}&UserIP=${config.UserIP}`, {
        dataType: 'json',
      }).then(res => {
        if (res.response === '1') {
          resolve(res.err_msg);
        } else {
          reject(res.err_msg);
        }
      });
    });
  };
};
