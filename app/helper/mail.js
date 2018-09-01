'use strict';
const nodemailer = require('nodemailer');

/*
 * @param options({
 *  content, 内容
 *  email, 反馈人邮件
 * })
 * @return {Promise<any>}
 */
module.exports = () => {
  return options => {
    const user = '20562615@qq.com'; // 账号
    // 开启一个 SMTP 连接池
    return new Promise((resolve, reject) => {
      const smtpTransport = nodemailer.createTransport({
        host: 'smtp.qq.com', // 主机
        port: 465, // SMTP 端口
        secureConnection: true,
        auth: {
          user, // 账号
          pass: 'wosxzgpzwtwibhid', // 密码或授权码
        },
      });
      // 设置邮件内容
      const subject = 'pkgif反馈';
      const html = `<p>内容：${options.content}</p>
                    <p>反馈人邮件：${options.email || ''}</p>`;
      const message = {
        from: `pkgif <${user}>`, // 发件地址
        to: user, // 收件列表
        subject, // 标题
        html, // html 内容
        priority: 'high',
      };
      // 发送邮件
      smtpTransport.sendMail(message, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
        smtpTransport.close(); // 如果没用，关闭连接池
      });
    });
  };
};
