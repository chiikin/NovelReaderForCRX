import * as types from './mutation-types'
import { getServer } from "../server"



export const setFoo = ({ commit }, payload) => {
  commit(types.UPDATE_FOO, payload)
}

export function openPage(context, payload) {
  context.state.pageComponent = payload.pageName;
}

function execLogin(webApp, payload, callback) {
  const server = getServer(webApp);

  server.login({
    account: payload.account,
    password: payload.password
  }).then(data => {

    callback(true, data);
  }).catch(() => {
    callback(false);
  });
}

export function login(context, payload) {
  execLogin(context.state.webApp, payload, (ret, data) => {
    if (ret) {
      context.state.accountInfo.account = data.account;
      context.state.accountInfo.password = data.password;
      context.state.accountInfo.loginInfo = data.loginInfo;
      context.state.accountInfo.isLogin = true;
      context.dispatch({ type: "openPage", pageName: "Bookshelf" });
    }
  });
}

export function recoveryLoginStatus(context, payload) {
  const server = getServer(context.state.webApp);
  const accountInfo = server.getLoginInfo();
  if (accountInfo && accountInfo.loginInfo) {
    context.state.accountInfo.account = accountInfo.account;
    context.state.accountInfo.password = accountInfo.password;
    context.state.accountInfo.loginInfo = accountInfo.loginInfo;
    context.state.accountInfo.isLogin = true;
    context.dispatch({ type: "loadBookshelf"});
  }
  else {
    context.dispatch({ type: "openPage", pageName: "Login" });
  }
}

/**
 * 登录信息失效，利用已缓存的用户名密码自动重新登录
 * @param {*} context 
 * @param {*} payload 
 */
export function reflashLoginInfo(context, payload) {
  execLogin(context.state.webApp, {
    account: context.state.accountInfo.account,
    password: context.state.accountInfo.password
  }, (ret, data) => {
    if (ret) {
      context.state.accountInfo.account = data.account;
      context.state.accountInfo.password = data.password;
      context.state.accountInfo.loginInfo = data.loginInfo;
      context.state.accountInfo.isLogin = true;
    }
    else {
      //还原登录状态失败则转到登录页
      context.dispatch({ type: "openPage", pageName: "Login" });
    }
  });
}

export function loadBookshelf(context, payload) {
  const server = getServer(context.state.webApp);
  server.getBookshelfList({
    accountInfo: context.state.accountInfo,
    refresh: payload.refresh
  }).then(bookshelfList => {
    bookshelfList = bookshelfList || [];
    context.state.bookshelfList = bookshelfList;
    if (bookshelfList.length > 0 && !context.state.currentBookshelfId) {
      context.state.currentBookshelfId = bookshelfList[0].bookshelfId;
      context.dispatch({ type: "loadShelfBookList", shelfId: context.state.currentBookshelfId });
    }
  });
}

export function loadShelfBookList(context, payload) {
  const server = getServer(context.state.webApp);
  server.getShelfBookList({
    accountInfo: context.state.accountInfo,
    shelfId: payload.shelfId,
    refresh: payload.refresh
  }).then(bookshelf => {
    const { bookshelfList } = context.state;
    for (let i = 0; i < bookshelfList.length; i++) {
      const bs2 = bookshelfList[i];
      if (bs2.bookshelfId === bookshelf.bookshelfId) {
        bs2.books = bookshelf.books;
        bs2.loaded = true;
      }
    }
  });
}

export function switchBookshelf(context, payload) {
  const { bookshelfList } = context.state;
  context.state.currentBookshelfId = payload.bookshelfId;
  for (let i = 0; i < bookshelfList.length; i++) {
    const bookshelf = bookshelfList[i];
    if (bookshelf.bookshelfId === payload.bookshelfId) {
      if (!bookshelf.loaded) {
        context.dispatch({ type: "loadShelfBookList", shelfId: bookshelf.bookshelfId });
        return;
      }
    }
  }
}