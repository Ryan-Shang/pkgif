'use strict';
const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  resolve: {
    alias: {
      '@': resolve('src'),
      '@views': resolve('src/views'),
      '@components': resolve('src/components'),
      '@assets': resolve('src/assets'),
      '@utils': resolve('src/utils'),
    },
  },
};
