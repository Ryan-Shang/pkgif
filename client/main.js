import './helper/libgif/libgif';
import './helper/libgif/rubbable';
import 'iview/dist/styles/iview.css';
import './asset/style/common.less';
import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import store from './store';
import routes from './route';
import iView from 'iview';

Vue.use(iView);
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
