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
  swagger2: {
    enable: true,
    package: 'egg-swagger2',
  },
};
