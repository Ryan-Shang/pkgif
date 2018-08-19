import './helper/libgif/libgif';
import './helper/libgif/rubbable';
import Vue from 'vue';
import VueRouter from 'vue-router';
import './asset/style/common.less';
import App from './App.vue';
import store from './store';
import routes from './route';

Vue.use(VueRouter);

const router = new VueRouter({
  routes,
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});
