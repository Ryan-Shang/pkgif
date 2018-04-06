'use strict';
const crypto  = require("crypto");

//akmg签名算法
const signAlgorithm = function(path,timestamp,signObj,keyObj){
    let query = signObj.query;
    let body = signObj.body;
    let method = signObj.method;
    let token = signObj.token;

    let header = "ice-auth-appkey:" + keyObj.appkey + "ice-auth-timestamp:" + timestamp + "ice-auth-token:" + token;

    let bodyStr = JSON.stringify(body);
    if(body !== undefined && bodyStr !== '{}'){
        query.json  = bodyStr;
    }

    let paratmer = "";
    let sort = Object.keys(query).sort();
    let querySort = {};
    for(let i=0;i<sort.length;i++){
        querySort[sort[i]] = query[sort[i]]
    }
    for (let key in querySort) {
        paratmer += key.toLocaleLowerCase() + "=" + querySort[key];
    }

    let $string = method + path + header + paratmer + keyObj.secretkey;
    let urlCodeStr = encodeURIComponent($string);
    let sha256 = crypto.createHash('sha256');
    sha256.update(urlCodeStr);
    return sha256.digest('hex');
};

module.exports = signAlgorithm;

