import Vue from "vue";
import Vuex from "vuex";

import * as getters from "./getters";
import mutations from "./mutations";
import * as actions from "./actions";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    webApp: "hbooker",
    pageComponent: "Bookshelf",//"Bookshelf",//"ChapterView"
    accountInfo: {
      isLogin: false,
      account: "",
      password: "",
      loginInfo: {}   //登录成功后的状态信息
    },
    bookshelfList: [{
      bookshelfId: "",
      bookshelfName: "",
      loaded: false,
      books: []
    }],
    bookChapters:[],//书籍分卷章节列表，
    
    currentBookshelfId: "",
    readingChapter: {
      bookId: "",
      chapterId: "",
      title: "",
      loaded:false,
      content:""
    }
  },
  getters,
  mutations,
  actions,
});
