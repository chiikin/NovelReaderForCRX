import Vue from "vue";
import Vuex from "vuex";

import * as getters from "./getters";
import mutations from "./mutations";
import * as actions from "./actions";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    webApp: "hbooker",
    pageComponent: "Bookshelf",
    accountInfo: {
      isLogin: false,
      account: "",
      password: "",
      loginInfo: {}   //登录成功后的状态信息
    },
    bookshelf: {
      bookshelfId: "",
      bookshelfName: "",
      books: []
    }
  },
  getters,
  mutations,
  actions,
});
