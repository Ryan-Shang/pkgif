'use strict';
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const helpers = require('./helpers');
const { VueLoaderPlugin } = require('vue-loader');

const dev = process.env.NODE_ENV === 'development';

module.exports = {
  entry: {
    main: [ helpers.root('client/main.js') ],
  },
  resolve: {
    extensions: [ '.js', '.vue', '.json' ],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  module: {
    rules: [
      /* {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: /node_modules/,
        options: {
          formatter: require('eslint-friendly-formatter'),
          emitWarning: true,
        },
      },*/
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'img/[name].[hash:7].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'media/[name].[hash:7].[ext]',
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          dev ? { loader: 'style-loader', options: { singleton: true } } : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [ require('autoprefixer')({ browsers: 'last 5 version' }) ],
            },
          },
          'less-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          dev ? { loader: 'style-loader', options: { singleton: true } } : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [ require('autoprefixer')({ browsers: 'last 5 version' }) ],
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
          },
          {
            loader: 'iview-loader',
            options: {
              prefix: false,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ 'vue-app' ],
            plugins: [ require('babel-plugin-transform-runtime'), require('babel-plugin-syntax-dynamic-import') ],
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([ 'webapp' ], {
      root: helpers.root(''),
      verbose: true,
      dry: false,
    }),
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new HtmlWebpackPlugin({
      chunksSortMode: 'dependency',
      template: helpers.root('client/index.html'),
    }),
  ],
};
