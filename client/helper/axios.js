import axios from 'axios';
import iview from 'iview';

const $axios = axios.create({
  baseURL: '/api',
});

$axios.interceptors.response.use(resSuccess, resError);

function resSuccess(response) {
  return response;
}

function resError(error) {
  if (String(error.response.status)[ 0 ] === '5') {
    iview.Message.error('服务器内部错误，请稍后重试');
  }
  return Promise.reject(error);
}

export default $axios;
