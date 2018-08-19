import axios from 'axios';
import iview from 'iview';

export const _public = axios.create({
  baseURL: '/public',
});

export const _api = axios.create({
  baseURL: '/api',
});

_public.interceptors.response.use(resSuccess, resError);

function resSuccess(response) {
  return response;
}

function resError(error) {
  if (String(error.response.status)[0] === '5') {
    iview.Message.error('服务器内部错误');
  }
  return Promise.reject(error);
}

