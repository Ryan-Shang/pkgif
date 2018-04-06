'use strict';
const packageConfig = require('../package.json');
const env = process.env;
const config = {
  "port": env.PORT || "8000",
  "proxy": [
    {
      "host": `http://${env.GATEWAY || "172.20.0.10:8005"}/`,
      "context": "api"
    }
  ]
};

config.pkg = packageConfig;

module.exports = config;
