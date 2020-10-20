import Vue from 'vue'
import App from './App'
import store from '../store'
import Vant from 'vant';
import 'vant/lib/index.css';

Vue.use(Vant);

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
