'use strict';
const aliasConfig = require('./alias.config');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
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
