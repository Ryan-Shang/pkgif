/**
 * Created by ly on 2016/5/12.
 */
'use strict';
const path = require('path');
const koa = require('koa');
const app = new koa();
const send = require('koa-send');
const staticCache = require('koa-static-cache');
const log = require("./util/logger");
const assert = require('assert');
const webRoot = path.join(process.cwd(), "build");
const Proxy = require('./middleware/proxy');

app.use(async (ctx, next) => {
  try {
    log.info(ctx.method + " " + ctx.url);
    await next();
  } catch (err) {
    log.info('--------------authorization------------->%s', err.message);
    if (401 === err.status) {
      ctx.status = 401;
      ctx.body = 'Protected resource, use Authorization header to get access\n';
    } else {
      assert.ifError(err);
    }
  }
});

app.use(staticCache(webRoot, {
  maxAge: 365 * 24 * 60 * 60,
  gzip: true,
  usePrecompiledGzip: true,
  dynamic: true
}));

app.use(async function (ctx, next) {
  if ('/' === ctx.path) {
    ctx.path = "/index.html";
    await send(ctx, ctx.path, {root: webRoot});
  } else {
    await next();
  }
});

app.use(Proxy.proxy());

module.exports = app;