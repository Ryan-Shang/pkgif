/**
 * Created by yong.liu on 2015/6/11.
 */
'use strict';
const log     = require("./util/logger");
const app     = require("./index");
const config  = require("./config");

app.listen(config.port);
log.info(config.pkg.name + " is listening on http://127.0.0.1:" + config.port);