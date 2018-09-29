'use strict';
const path = require('path');

const root = () => {
  return path.join(process.cwd(), ...arguments);
};

module.exports = {
  root,
};
