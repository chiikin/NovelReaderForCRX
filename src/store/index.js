import Vue from "vue";
import Vuex from "vuex";

import { localStorage as storage } from "../utils/webStorage";

import * as getters from "./getters";
import mutations from "./mutations";
import * as actions from "./actions";
import { getService } from "../server";

Vue.use(Vuex);
// const vueInst = new Vue({});
// const proxyHandler = {
//   apply: function (target, thisArg, args) {
//     console.log('proxy', target, thisArg, args);
//     try {
//       const result = target.apply(thisArg, args);
//       if (result instanceof Promise) {

//       }
//       else{
//         return result;
//       }
//     }
//     catch (e) {
//       const msg = typeof e === 'string' ? e : '未知错误';
//       console.error(e);
//       vueInst.$toast.fail(msg);
//     }
//   }
// }

// /**
//  * 给目标对象的属性方法加一成error的拦截层
//  * @param {*} targetObject 
//  */
// export function wrapObjectFunction(targetObject) {
//   Object.keys(targetObject).forEach(prop => {
//     const propVal = targetObject[prop];
//     if (typeof propVal === 'function') {
//       targetObject[prop] = new Proxy(propVal, proxyHandler);
//     }
//   });
// }


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
