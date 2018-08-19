'use strict';
const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',

  output: {
    path: helpers.root('webapp'),
    publicPath: '/',
    filename: '[name].js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  devServer: {
    host: '0.0.0.0',
    port: 9010,
    proxy: {
      '/back-public': {
        target: 'http://127.0.0.1:7001',
      },
      '/back-api': {
        target: 'http://127.0.0.1:7001',
      },
    },
  },
});
