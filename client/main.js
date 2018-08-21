import './helper/libgif/libgif.bak';
import './helper/libgif/rubbable';
import 'iview/dist/styles/iview.css';
import './asset/style/common.less';
import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import store from './store';
import routes from './route';
import iView from 'iview';
import axios from './helper/axios';

Vue.use(iView);
Vue.use(VueRouter);
Vue.prototype.$axios = axios;

const router = new VueRouter({
  routes,
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});
