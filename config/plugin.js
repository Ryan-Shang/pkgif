'use strict';

// had enabled by egg
// exports.static = true;
module.exports = {
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
  validate: {
    enable: true,
    package: 'egg-validate',
  },
  helper: {
    enable: true,
    package: 'egg-helper',
  },
};
