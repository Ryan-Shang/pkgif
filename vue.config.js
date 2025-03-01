const { defineConfig } = require('@vue/cli-service')

const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = defineConfig({
  transpileDependencies: true,
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
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@views', resolve('src/views'))
      .set('@components', resolve('src/components'))
      .set('@assets', resolve('src/assets'))
      .set('@utils', resolve('src/utils'))
      .end();
  },
})
