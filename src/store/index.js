import Vue from "vue";
import Vuex from "vuex";

import { localStorage as storage } from "../utils/webStorage";

import * as getters from "./getters";
import mutations from "./mutations";
import * as actions from "./actions";
import { getService } from "../server";

Vue.use(Vuex);

export default new Vuex.Store({
  state: () => {
    const runtimeData = storage.getObject("appVuexSnapshot", {
      webApp: "hbooker",
      pageComponent: "Bookshelf",//"Bookshelf",//"ChapterView"
      session: undefined,
      bookshelfList: [],
      currentBookshelf: undefined,//{}
      bookList: [],
      readingBook: undefined,//{},
      readingBookVolumes: [],
      readingChapter: undefined,//{}
    });

    return {
      webAppList: [{
        appId: "hbooker",
        appName: "刺猬猫"
      }],
      ...runtimeData
    };
  },
  getters,
  mutations,
  actions,
});
