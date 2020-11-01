import Vue from 'vue'
import App from './App'
import store from '../store'
import Vant from 'vant';
import 'vant/lib/index.css';
import components from "./components"
import axios from "axios"
import {dispatch} from "../utils/VuexHelper"

Vue.use(Vant);
Vue.use(components);

window.axios = axios;

// global.browser = require('webextension-polyfill')
// Vue.prototype.$browser = global.browser

Vue.mixin({
  methods:{
    dispatch:dispatch
  }
});

store.dispatch({ type: "recoverSession" }).then(() => {

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    store,
    render: h => h(App)
  })

});



//页面卸载时保存vuex快照，以便于下次快速恢复
window.addEventListener('beforeunload', () => {
  store.dispatch({ type: "saveSnapshot" })
});