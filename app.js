'use strict';
const fse = require('fs-extra');
const path = require('path');
module.exports = app => {
  app.beforeStart(() => {
    const staticConfig = app.config.static;
    const tmpDir = path.join(staticConfig.dir, staticConfig.tmpdir);
    fse.ensureDirSync(tmpDir);
  });
};
