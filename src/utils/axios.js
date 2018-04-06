import axios from 'axios';

export const _api_certifi_record = axios.create({
  baseURL: 'api/certifi-record'
});

_api_certifi_record.interceptors.request.use(reqSuccess,reqError);
_api_certifi_record.interceptors.response.use(resSuccess,resError);


function reqSuccess(config){
  return config;
}

function reqError(error){
  return Promise.reject(error)
}

function resSuccess(response){
    return response
}

function resError(error){
    if(String(error.response.status)[0] === "5"){
      alert("服务器内部错误");
    }
    return Promise.reject(error)
}


