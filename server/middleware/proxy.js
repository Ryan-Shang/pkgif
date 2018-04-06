/**
 * Created by yong.liu on 2017/5/23.
 */
const HttpProxy = require('http-proxy');
const log = require("../util/logger");
const proxyServer = HttpProxy.createProxyServer();
const compose = require("./compose");
const config = require("../config");

class Proxy {
  constructor() {

  }

  static nginx(context, options) {
    return (ctx, next) => {
      if (!ctx.url.startsWith(context)) return next();

      const {logs, rewrite} = options;

      options.headers = ctx.request.headers;

      return new Promise((resolve, reject) => {
        if (logs) {
          log.info('- proxy -', ctx.req.method, ctx.req.url);
        }

        if (typeof rewrite === 'function') {
          ctx.req.url = rewrite(ctx.url);
        }

        proxyServer.web(ctx.req, ctx.res, options, e => {
          const status = {
            ECONNREFUSED: 503,
            ETIMEOUT: 504
          }[e.code];
          if (status) ctx.status = status;
          if (logs) {
            log.error('- proxy -', ctx.status, ctx.req.method, ctx.req.url);
          }
          resolve();
        });


      })
    }
  }

  proxy() {
    let proxies = config.proxy;
    let mildArr = [];
    if(proxies){
      proxies.forEach(function(proxy){
        let pattern = new RegExp("^\/"+proxy.context+"(\/|\/\w+)?");
        mildArr.push(Proxy.nginx(
          "/" + proxy.context,
          {
            target: proxy.host,
            changeOrigin: true,
            xfwd: true,
            rewrite: path => path.replace(pattern, ''),
            logs: true,
            proxyTimeout:30000
          }
        ));
      })
    }
    return compose(mildArr);
  }
}

module.exports = new Proxy;