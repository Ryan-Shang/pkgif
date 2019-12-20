'use strict';
const aliasConfig = require('./alias.config');
const QiniuPlugin = require('qn-webpack');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

const CDN_PREFIX = 'webapp/';

module.exports = {
  publicPath: isProd ? `http://cdn.pkgif.net/${CDN_PREFIX}` : '/',
  chainWebpack: config => {
    config.module
      .rule('vue')
      .test(/\.vue$/)
      .use('iview-loader')
      .loader('iview-loader')
      .options({
        prefix: true,
      })
      .end();
  },
  configureWebpack: {
    ...aliasConfig,
    plugins: isProd ? [
      new QiniuPlugin({
        accessKey: 'cgSW-aHuGtHQP2tptoVXRIbPHRLRxIF07-MEJeUt',
        secretKey: '_gbHhjrl2LPk7mdghpL9Cixo2JvS-rqhpnKWNjfg',
        bucket: 'pkgif',
        path: CDN_PREFIX,
        exclude: /index\.html$/,
      }),
      new PrerenderSPAPlugin({
        staticDir: path.join(process.cwd(), 'dist'),
        routes: [ '/' ],
        postProcess(renderedRoute) {
          renderedRoute.route = renderedRoute.originalRoute;
          renderedRoute.html = renderedRoute.html.split(/>[\s]+</gmi).join('><');
          if (renderedRoute.route.endsWith('.html')) {
            renderedRoute.outputPath = path.join(path.join(process.cwd(), 'dist'), renderedRoute.route);
          }
          return renderedRoute;
        },
        minify: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          keepClosingSlash: true,
          sortAttributes: true,
        },
      }),
    ] : [],
  },
  devServer: {
    port: 9010,
  },
};
