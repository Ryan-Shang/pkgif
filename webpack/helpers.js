'use strict';
const path = require('path');

const root = arg => {
  return path.join(process.cwd(), arg);
};

module.exports = {
  root,
};
