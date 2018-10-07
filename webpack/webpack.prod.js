'use strict';
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const path = require('path');

module.exports = webpackMerge(commonConfig, {
  mode: 'production',

  output: {
    path: helpers.root('webapp'),
    publicPath: '',
    filename: '[name].[chunkhash].js',
  },
  optimization: {
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          chunks: 'all',
          priority: -10,
          reuseExistingChunk: true,
          test: /[\\/](node_modules|asset)[\\/]/,
        },
      },
    },
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new PrerenderSPAPlugin({
      staticDir: helpers.root('webapp'),
      outputDir: helpers.root('webapp-prerender'),
      routes: [ '/' ],
      postProcess(renderedRoute) {
        renderedRoute.route = renderedRoute.originalRoute;
        renderedRoute.html = renderedRoute.html.split(/>[\s]+</gmi).join('><');
        if (renderedRoute.route.endsWith('.html')) {
          renderedRoute.outputPath = path.join(helpers.root('webapp'), renderedRoute.route);
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
  ],
});
