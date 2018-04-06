/**
 * Created by ly on 15-7-13.
 */
const config = require("../config");
const signature = require("./signature");
const querystring = require("querystring");

const signUrl = (service, originalUrl, reqObj, keyObj) => {
    let body = reqObj.body;
    let method = reqObj.method || "GET";
    let token = reqObj.token || "";
    let query = reqObj.query || {};
    let headers = reqObj.headers || {};

    //拼接url
    let urlObj = installUrl(service, originalUrl);
    let queryStr = querystring.stringify(query, null, null, {
        encodeURIComponent: function (a) {
            return encodeURIComponent(a);
        }
    });
    let url = urlObj.host + urlObj.signUri + (queryStr ? ("?" + queryStr) :"");

    //拿签名
    let allPath = "/" + service + "/" + originalUrl;
    let timestamp = new Date().getTime();
    let sign = signature(allPath, timestamp, {
        method: method,
        token: token,
        query: query,
        body: body
    }, keyObj);
    let headers2 = {
        "ice-auth-appkey": keyObj.appkey,
        "ice-auth-timestamp": timestamp,
        "ice-auth-token": token,
        "ice-auth-sign": sign,
        "token": token
    };

    Object.assign(headers, headers2);
    return {
        method: method,
        headers: headers,
        uri: url,
        body: body,
        formData: reqObj.formData,
        form: reqObj.form
    };
};

/**
 * 组装uri
 */
const installUrl = (service, originalUrl) => {
    let result = {};
    if (originalUrl) {
        let servicePathArr = service.split("/");
        let serviceUri = config[servicePathArr[0]]["uri"];
        result.host = config[servicePathArr[0]]["host"];
        if (servicePathArr.length > 1) {
            for (let i = 1; i < servicePathArr.length; i++) {
                serviceUri += servicePathArr[i] + "/";
            }
        }
        if (serviceUri) {
            result.signUri = serviceUri + originalUrl;
        } else {
            log.error(serviceUri + "signurl - serviceUri 不存在！");
        }
    } else {
        log.error("signurl - originalUrl 不存在！");
    }
    return result;
};

const dashboardSignUrl = (service, originalUrl, reqObj) => {
    return signUrl(service, originalUrl, reqObj, config.appinfo.dashboard)
};

const gatewaySignUrl = (service, originalUrl, reqObj) => {
    return signUrl(service, originalUrl, reqObj, config.appinfo.gateway)
};

module.exports = {
    dashboardSignUrl,
    gatewaySignUrl
};