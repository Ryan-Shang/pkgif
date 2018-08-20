'use strict';
const fs = require('fs');
const path = require('path');
const uuidv1 = require('uuid/v1');

module.exports = app => {
  const staticConfig = app.config.static;
  const tmpDir = path.join(staticConfig.dir, staticConfig.tmpdir);
  return {
    saveTmpGif(stream) {
      return new Promise((resolve, reject) => {
        const filename = uuidv1() + '.gif';
        const filepath = path.join(tmpDir, filename);
        const ws = fs.createWriteStream(filepath);
        stream.pipe(ws);
        stream.on('end', () => {
          resolve({
            filename,
            root: staticConfig.tmpdir,
          });
        });
        stream.on('error', err => {
          reject(err);
        });
      });
    },
  };
};
